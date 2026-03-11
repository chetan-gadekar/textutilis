import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CircularProgress,
    Alert,
    Snackbar,
    Breadcrumbs,
    Link,
    Typography
} from '@mui/material';
import { Save, ArrowLeft, Plus } from 'lucide-react';
import performanceService from '../../../services/performanceService';
import MainLayout from '../../layout/MainLayout';

const criteriaList = [
    { key: 'problemIdentification', label: 'Problem Identification' },
    { key: 'potentialSolution', label: 'Potential Solution' },
    { key: 'detailing', label: 'Detailing of how to build solution' },
    { key: 'implementation', label: 'Implementation' },
    { key: 'problemSynthesizing', label: 'Problem Synthesizing' },
    { key: 'punctuality', label: 'Punctuality' },
];

const PerformanceDetail = ({ mode = 'view', type = 'self' }) => {
    const { studentId, courseId } = useParams();
    const navigate = useNavigate();

    const [performance, setPerformance] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, [studentId, courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let response;

            // IF current user is a student viewing their own stuff
            if (!studentId) {
                response = await performanceService.getMyPerformance();
                const perf = response.data.find(p => p.courseId._id === courseId);
                setPerformance(perf);
                const evalSource = type === 'self' ? perf.selfEvaluation : perf.instructorAssessment;
                setData(perf ? JSON.parse(JSON.stringify(evalSource)) : null);
            }
            // IF current user is instructor/super viewing a student
            else {
                // Use teacher-accessible endpoint (getAllPerformance for supers, or we can use getInstructorPerformance)
                // For simplicity and to avoid auth issues, let's use the one that works for the current role
                response = await performanceService.getAllPerformance({ courseId });
                const perf = response.data.find(p => p.studentId._id === studentId);
                setPerformance(perf);
                const evalSource = type === 'self' ? perf.selfEvaluation : perf.instructorAssessment;
                setData(perf ? JSON.parse(JSON.stringify(evalSource)) : null);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const getNumRows = (evalData) => {
        if (!evalData) return 0;
        return Math.max(
            ...criteriaList.map(c => (evalData[c.key] && evalData[c.key].length) || 0),
            0
        );
    };

    const handleAddRow = () => {
        const newData = { ...data };
        const numRows = getNumRows(newData);
        criteriaList.forEach(c => {
            if (!newData[c.key]) newData[c.key] = [];
            while (newData[c.key].length <= numRows) newData[c.key].push(0);
        });
        setData(newData);
    };

    const handleCellChange = (rowIndex, criterionKey, value) => {
        let numVal = parseInt(value, 10);
        if (isNaN(numVal)) numVal = 0;
        if (numVal > 5) numVal = 5;
        if (numVal < 0) numVal = 0;

        const newData = { ...data };
        if (!newData[criterionKey]) newData[criterionKey] = [];
        newData[criterionKey][rowIndex] = numVal;
        setData(newData);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (type === 'self') {
                await performanceService.saveSelfEvaluation(courseId, data);
            } else {
                // Check if we use instructor or super save based on path or simplified service
                await performanceService.saveInstructorAssessment(studentId, courseId, data);
            }
            setSuccessMsg('Saved successfully!');
        } catch (err) {
            setError(err.message || 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const numRows = getNumRows(data);
    const rows = Array.from({ length: numRows }).map((_, i) => i);

    if (loading) return <MainLayout><div className="flex justify-center mt-10"><CircularProgress /></div></MainLayout>;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 font-poppins h-full">
                <div className="mb-8 pt-6 flex justify-between items-start no-print">
                    <div>
                        <h1 className="text-3xl font-medium text-gray-800">
                            {type === 'self' ? 'Self Evaluation' : 'Instructor Assessment'}
                        </h1>
                        <p className="text-gray-500 mt-1 font-light">
                            {performance?.courseId?.title} — {performance?.studentId?.name}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button onClick={() => window.print()} className="px-6 py-2 text-sm bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
                            Print Report
                        </button>
                        {mode === 'edit' && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2 text-sm bg-theme text-white rounded-xl hover:bg-theme-dark transition-all disabled:opacity-50 shadow-md shadow-theme/20"
                            >
                                {saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />} Save Changes
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700">Assessment Matrix</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="border-r border-gray-100 p-4 w-16 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">No.</th>
                                    {criteriaList.map(c => (
                                        <th key={c.key} className="border-r border-gray-100 p-4 text-center align-middle font-bold text-gray-500 uppercase tracking-wider text-[10px] leading-tight last:border-r-0">
                                            {c.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map(idx => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="border-r border-gray-100 p-3 text-center font-bold text-gray-400 bg-gray-50/30">{idx + 1}</td>
                                        {criteriaList.map(c => {
                                            const val = (data && data[c.key] && data[c.key][idx]) || 0;
                                            return (
                                                <td key={c.key} className="border-r border-gray-100 p-0 text-center last:border-r-0">
                                                    {mode === 'edit' ? (
                                                        <input
                                                            type="number"
                                                            min="0" max="5"
                                                            value={val || ''}
                                                            placeholder="-"
                                                            onChange={(e) => handleCellChange(idx, c.key, e.target.value)}
                                                            className="w-full h-full p-3 text-center bg-transparent focus:bg-theme/5 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-theme transition-colors font-semibold text-gray-800 border-0"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-gray-700 p-3 block">{val || '-'}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {mode === 'edit' && (
                                    <tr className="no-print">
                                        <td colSpan={criteriaList.length + 1} className="p-0">
                                            <button
                                                onClick={handleAddRow}
                                                className="w-full py-4 bg-gray-50/50 hover:bg-gray-100 text-theme font-semibold flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs"
                                            >
                                                <Plus size={16} /> Add Assignment Row
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-theme/10">
                                <tr className="bg-theme/5 font-bold">
                                    <td className="border-r border-gray-100 p-4 text-center uppercase tracking-widest text-[10px] text-theme">AVG</td>
                                    {criteriaList.map(c => {
                                        const values = (data && data[c.key]) || [];
                                        const sum = values.reduce((a, b) => a + (b || 0), 0);
                                        const avg = values.length > 0 ? (sum / values.length).toFixed(2) : '0.00';
                                        return (
                                            <td key={c.key} className="border-r border-gray-100 p-4 text-center text-theme-dark font-black last:border-r-0">
                                                {avg}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}>
                <Alert severity="success">{successMsg}</Alert>
            </Snackbar>
        </MainLayout>
    );
};

export default PerformanceDetail;
