import React, { useState, useEffect, useCallback } from 'react';
import {
  CircularProgress,
  Tooltip,
  Collapse,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Filter, FilterX, ExternalLink, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import assignmentService from '../../services/assignmentService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';
import { downloadFile } from '../../utils/cloudinaryUtils';

const AssignmentReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Remark Modal State
  const [remarkModal, setRemarkModal] = useState({ open: false, submission: null });
  const [remarkText, setRemarkText] = useState('');
  const [remarkSaving, setRemarkSaving] = useState(false);

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
    } catch (err) {
      notify.error(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedStudent, startDate, endDate, debouncedTitle]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleChangePage = (event, newPage) => setPage(newPage);
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

  // --- Remark Modal Handlers ---
  const openRemarkModal = (submission) => {
    setRemarkModal({ open: true, submission });
    setRemarkText(submission.remark || '');
  };

  const closeRemarkModal = () => {
    setRemarkModal({ open: false, submission: null });
    setRemarkText('');
  };

  const handleSaveRemark = async () => {
    if (!remarkText.trim()) {
      notify.error('Please enter a remark before saving.');
      return;
    }
    try {
      setRemarkSaving(true);
      await assignmentService.addRemark(remarkModal.submission._id, remarkText.trim());
      notify.success('Remark saved successfully!');
      // Update local state to reflect the remark immediately
      setSubmissions(prev =>
        prev.map(s =>
          s._id === remarkModal.submission._id
            ? { ...s, remark: remarkText.trim(), status: 'reviewed' }
            : s
        )
      );
      closeRemarkModal();
    } catch (err) {
      notify.error(err.message || 'Failed to save remark');
    } finally {
      setRemarkSaving(false);
    }
  };

  if (loading && submissions.length === 0 && !showFilters) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <CircularProgress />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="font-poppins h-full">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Review Assignments</h1>
            <p className="text-gray-500 mt-1 font-light">Monitor, download, and remark on student submissions</p>
          </div>
          <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'} placement="top">
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
                className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Collapse>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">File</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted At</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
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
                        {submission.remark && (
                          <div className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span className="truncate max-w-[160px]">{submission.remark}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{submission.fileName}</div>
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
                            <Tooltip title="Download Submission" placement="top">
                              <button
                                onClick={() => downloadFile(submission.fileUrl, submission.fileName)}
                                className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors flex items-center justify-center"
                              >
                                <ExternalLink size={18} strokeWidth={2} />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip title={submission.remark ? 'Edit Remark' : 'Add Remark'} placement="top">
                            <button
                              onClick={() => openRemarkModal(submission)}
                              className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${
                                submission.remark
                                  ? 'bg-green-50 hover:bg-green-100 text-green-600'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                              }`}
                            >
                              <MessageSquarePlus size={18} strokeWidth={2} />
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
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Remark Modal */}
      <Dialog
        open={remarkModal.open}
        onClose={closeRemarkModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Poppins, sans-serif',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem', pb: 1 }}>
          <div className="flex items-center gap-2 text-gray-800">
            <MessageSquarePlus size={20} className="text-theme" />
            {remarkModal.submission?.remark ? 'Edit Remark' : 'Add Remark'}
          </div>
          {remarkModal.submission && (
            <p className="text-xs font-normal text-gray-400 mt-1">
              {remarkModal.submission.studentId?.name} — {remarkModal.submission.assignmentId?.title}
            </p>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <textarea
            autoFocus
            rows={5}
            placeholder="Write your remark for the student here..."
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all resize-none font-poppins text-gray-700 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-2">This remark will be visible to the student in their assignment view.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <button
            onClick={closeRemarkModal}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveRemark}
            disabled={remarkSaving || !remarkText.trim()}
            className="px-6 py-2 text-sm font-semibold text-white bg-theme hover:bg-theme-dark rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {remarkSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              'Save Remark'
            )}
          </button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default AssignmentReview;
