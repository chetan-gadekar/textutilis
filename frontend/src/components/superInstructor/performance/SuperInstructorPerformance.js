import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CircularProgress,
    Alert,
    TablePagination,
    Tooltip,
    Collapse
} from '@mui/material';
import { Search, Filter, FilterX, Eye, Edit3 } from 'lucide-react';
import performanceService from '../../../services/performanceService';
import MainLayout from '../../layout/MainLayout';

const SuperInstructorPerformance = () => {
    const navigate = useNavigate();
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPerformances = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (debouncedSearch) params.studentName = debouncedSearch;
            if (selectedCourse) params.courseId = selectedCourse;

            const response = await performanceService.getAllPerformance(params);
            setPerformances(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch performance data');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCourse]);

    useEffect(() => {
        fetchPerformances();
    }, [fetchPerformances]);

    const coursesList = React.useMemo(() => {
        const map = new Map();
        performances.forEach(p => {
            if (p.courseId) map.set(p.courseId._id, p.courseId.title);
        });
        return Array.from(map, ([id, title]) => ({ id, title }));
    }, [performances]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCourse('');
        setPage(0);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = performances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getAvg = (data) => {
        if (!data) return "0.00";
        const keys = Object.keys(data).filter(k => Array.isArray(data[k]));
        let totalSum = 0;
        let count = 0;
        keys.forEach(k => {
            data[k].forEach(v => {
                totalSum += (v || 0);
                count++;
            });
        });
        return count > 0 ? (totalSum / count).toFixed(2) : "0.00";
    };

    return (
        <MainLayout>
            <div className="font-poppins h-full max-w-7xl mx-auto px-4">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-medium text-gray-800">Student Performance</h1>
                        <p className="text-gray-500 mt-1 font-light">Super Instructor Portal — Monitor all student evaluations</p>
                    </div>
                    <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"} placement="left">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border shadow-sm ${showFilters
                                ? 'bg-theme/10 text-theme border-theme/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {showFilters ? <FilterX size={20} strokeWidth={2} /> : <Filter size={20} strokeWidth={2} />}
                        </button>
                    </Tooltip>
                </div>

                <Collapse in={showFilters}>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-5 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Search Student</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by student name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Courses</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => { setSelectedCourse(e.target.value); setPage(0); }}
                                className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Courses Globally</option>
                                {coursesList.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleClearFilters}
                            className="px-8 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                        >
                            <FilterX size={18} /> Clear Filters
                        </button>
                    </div>
                </Collapse>

                {error && <Alert severity="error" className="mb-6">{error}</Alert>}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Course</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Self Avg</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Instr Avg</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center"><CircularProgress /></td></tr>
                            ) : performances.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-light">No global records found.</td></tr>
                            ) : (
                                paginatedData.map((perf) => (
                                    <tr key={perf._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 group-hover:text-theme transition-colors">{perf.studentId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-400">{perf.studentId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {perf.courseId?.title}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                                {getAvg(perf.selfEvaluation)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                                {getAvg(perf.instructorAssessment)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button
                                                onClick={() => navigate(`/instructor/performance/view-self/${perf.studentId._id}/${perf.courseId._id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View Self Evaluation"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/instructor/performance/assess/${perf.studentId._id}/${perf.courseId._id}`)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                title="Assess Student (Instructor View)"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={performances.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className="border-t border-gray-100"
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default SuperInstructorPerformance;
