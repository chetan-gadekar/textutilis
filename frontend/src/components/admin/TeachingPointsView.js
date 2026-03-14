import React, { useState, useEffect, useCallback } from 'react';
import {
  TablePagination,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { Filter, FilterX, Eye, ChevronDown } from 'lucide-react';
import adminService from '../../services/adminService';
import MainLayout from '../layout/MainLayout';

/* =========================================================
   🔐 SAFE TEXT HELPER (Same as Instructor View)
========================================================= */
const extractStringFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  const numericKeys = Object.keys(obj).filter(k => !isNaN(k));
  if (!numericKeys.length) return '';
  return numericKeys
    .sort((a, b) => Number(a) - Number(b))
    .map(k => obj[k])
    .join('');
};

const safeText = (value) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return extractStringFromObject(value);
  return '';
};

const TeachingPointsView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [showFilters, setShowFilters] = useState(false);

  // Instructors for dropdown
  const [instructors, setInstructors] = useState([]);

  // Filters State
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogPoints, setDialogPoints] = useState([]);

  // Fetch instructors on mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await adminService.getAllFaculty();
        setInstructors(response.data || []);
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
      }
    };
    fetchInstructors();
  }, []);

  const fetchTeachingPoints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        instructorId: selectedInstructorId,
        startDate,
        endDate
      };

      const response = await adminService.getAllTeachingPoints(params);
      setRecords(response.data || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch teaching points');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedInstructorId, startDate, endDate]);

  useEffect(() => {
    fetchTeachingPoints();
  }, [fetchTeachingPoints]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchTeachingPoints();
  };

  const handleClearFilters = () => {
    setSelectedInstructorId('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleViewDetails = (record) => {
    // Parse points for the dialog
    let points = [];
    if (Array.isArray(record.teachingPoints)) {
      points = record.teachingPoints.map(p => {
        if (typeof p !== 'object' || p === null) return null;
        return {
          _id: p._id,
          title: safeText(p.title || p), // Handle mixed legacy
          description: safeText(p.description),
          visibility: p.visibility || 'Visible',
          createdAt: p.createdAt
        };
      }).filter(p => p && p.title);
    }
    setDialogPoints(points);
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  if (loading && records.length === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="font-poppins h-full">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Teaching Points - All Instructors</h1>
            <p className="text-gray-500 mt-1 font-light">View teaching points recorded by instructors</p>
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
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full md:w-1/3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Select Instructor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <ChevronDown size={16} strokeWidth={2} />
                  </div>
                  <select
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                    className="w-full appearance-none pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all cursor-pointer"
                  >
                    <option value="">All Instructors</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.name} ({instructor.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-theme/20 transition-colors shadow-sm whitespace-nowrap"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-theme border border-theme rounded-lg hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-theme/20 transition-colors shadow-sm whitespace-nowrap"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </Collapse>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Topics Count</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Updated</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-theme/10 flex items-center justify-center text-theme font-semibold text-sm">
                            {row.instructorId?.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{row.instructorId?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{row.instructorId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                          {Array.isArray(row.teachingPoints) ? row.teachingPoints.length : '1 (Legacy)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {new Date(row.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center">
                          <Tooltip title="View Topics" placement="top">
                            <button
                              onClick={() => handleViewDetails(row)}
                              className="p-2 bg-[#f8f5ff] text-[#8b5cf6] hover:bg-[#f3edff] rounded-2xl transition-colors"
                            >
                              <Eye size={20} strokeWidth={1.5} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Records per page"
            className="border-t border-gray-100 bg-gray-50/50 w-full overflow-x-auto"
            sx={{
              '.MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontFamily: 'Poppins',
                fontSize: '0.875rem',
                color: '#6b7280',
              },
              '.MuiTablePagination-select': {
                fontFamily: 'Poppins',
              }
            }}
          />
        </div>

        {/* Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ style: { borderRadius: '12px', margin: '16px', maxHeight: 'none' } }}>
          <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg flex items-center justify-between">
            <div>
              <span className="text-gray-800 text-lg">Topics for {selectedRecord?.instructorId?.name}</span>
              <span className="block text-sm text-gray-500 font-normal mt-0.5">
                {selectedRecord && new Date(selectedRecord.date).toLocaleDateString()}
              </span>
            </div>
          </DialogTitle>
          <DialogContent className="font-poppins overflow-y-auto px-0 py-0" style={{ maxHeight: '60vh' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Visibility</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 hidden sm:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {dialogPoints.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No detailed topics found (Legacy text data might exist)
                      </td>
                    </tr>
                  ) : (
                    dialogPoints.map((p, idx) => (
                      <tr key={p._id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800 align-top">{p.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 align-top whitespace-pre-wrap">{p.description}</td>
                        <td className="px-6 py-4 text-sm align-top">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${p.visibility === 'Visible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {p.visibility}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 align-top hidden sm:table-cell">
                          {p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions className="p-3 px-5 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={() => setOpenDialog(false)}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors shadow-sm"
            >
              Close
            </button>
          </DialogActions>
        </Dialog>

      </div>
    </MainLayout>
  );
};

export default TeachingPointsView;
