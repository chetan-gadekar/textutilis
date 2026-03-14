import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Autocomplete,
  Stack,
  IconButton,
  Tooltip,
  Collapse,
  TablePagination,
} from '@mui/material';
import { Filter, FilterX, ExternalLink } from 'lucide-react';
import assignmentService from '../../services/assignmentService';
import MainLayout from '../layout/MainLayout';

const AssignmentReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce assignment title
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(assignmentTitle);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [assignmentTitle]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await assignmentService.getStudents({ limit: 1000 });
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        studentId: selectedStudent?._id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        assignmentTitle: debouncedTitle || undefined,
      };

      const response = await assignmentService.getAllSubmissions(params);
      setSubmissions(response.data || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedStudent, startDate, endDate, debouncedTitle]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedStudent(null);
    setStartDate('');
    setEndDate('');
    setAssignmentTitle('');
    setPage(0);
  };

  if (loading && submissions.length === 0 && !showFilters) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="font-poppins h-full">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Review Assignments</h1>
            <p className="text-gray-500 mt-1 font-light">Monitor and grade student assignment submissions</p>
          </div>
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"} placement="top">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-theme/10 text-theme' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
            >
              {showFilters ? <FilterX size={20} strokeWidth={2} /> : <Filter size={20} strokeWidth={2} />}
            </button>
          </Tooltip>
        </div>

        <Collapse in={showFilters}>
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-[0_0_250px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Search Student</label>
                <select
                  value={selectedStudent ? selectedStudent._id : ''}
                  onChange={(e) => {
                    const student = students.find(s => s._id === e.target.value) || null;
                    setSelectedStudent(student);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-grow min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Assignment Title</label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                />
              </div>
              <div className="flex-[0_0_150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all text-gray-700"
                />
              </div>
              <div className="flex-[0_0_150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all text-gray-700"
                />
              </div>
              <button
                onClick={handleClearFilters}
                className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-theme/20 transition-colors shadow-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">File</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted At</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                      </div>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No submissions found</p>
                        <p className="text-sm text-gray-400 mt-1">Adjust your filters or wait for students to submit work.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-800">{submission.studentId?.name || 'Unknown Student'}</div>
                        <div className="text-xs text-gray-500">{submission.studentId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{submission.assignmentId?.courseId?.title || 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{submission.assignmentId?.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {submission.fileName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${submission.status === 'reviewed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          {submission.fileUrl && (
                            <Tooltip title="View Submission" placement="top">
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors flex items-center justify-center"
                              >
                                <ExternalLink size={20} strokeWidth={2} />
                              </a>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-white border-t border-gray-100 flex justify-end items-center px-4 py-1 w-full overflow-x-auto">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                border: 'none',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                },
                '.MuiTablePagination-select': {
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontWeight: 500,
                },
                '.MuiTablePagination-actions .MuiIconButton-root': {
                  color: '#6b7280',
                }
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentReview;
