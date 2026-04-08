import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Collapse } from '@mui/material';
import { Upload, Download, Filter, FilterX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';
import FileUpload from '../common/FileUpload';

const AssignmentView = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status !== 'all' ? status : undefined,
      };

      const response = await assignmentService.getMyAssignments(params);
      setAssignments(response.assignments || []);
      setTotalRecords(response.total || 0);
    } catch (err) {
      notify.error(err.message || 'Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, startDate, endDate, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = assignment.submission;
    if (existingSubmission) {
      setFileUrl(existingSubmission.fileUrl);
      setFileName(existingSubmission.fileName);
    } else {
      setFileUrl('');
      setFileName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAssignment(null);
    setFileUrl('');
    setFileName('');
  };

  const handleSubmit = async () => {
    if (!fileUrl || !fileName) {
      notify.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await assignmentService.submitAssignment(selectedAssignment._id, fileUrl, fileName);
      handleCloseDialog();
      fetchData(); // Refresh list to update status
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 font-poppins">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">My Assignments</h1>
            <p className="text-gray-500 mt-1 font-light">View and submit your course assignments</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-theme transition-colors shadow-sm"
          >
            {showFilters ? <FilterX size={18} /> : <Filter size={18} />}
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters Section */}
        <Collapse in={showFilters}>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Due)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Due)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-colors bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-theme hover:bg-theme/5 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Collapse>

        {/* Legacy error alerts removed in favor of premium toasts */}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center shadow-sm border border-blue-100">
            <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            <span className="text-sm font-medium">No assignments found matching your criteria.</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment File</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">My Submission</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{assignment.title}</p>
                        {assignment.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{assignment.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignment.course?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.status === 'submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {assignment.attachments && assignment.attachments.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {assignment.attachments.map((file, index) => (
                              <a
                                key={index}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-theme hover:text-theme/80 transition-colors bg-theme/5 hover:bg-theme/10 px-2 py-1 rounded text-xs font-medium"
                              >
                                <Download size={14} />
                                <span className="truncate max-w-[120px]">{file.fileName || `File ${index + 1}`}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.submission ? (
                          <div>
                            <p className="font-medium text-gray-900">{new Date(assignment.submission.submittedAt).toLocaleDateString()}</p>
                            {assignment.submission.fileName && (
                              <p className="text-xs text-gray-500 max-w-[120px] truncate">{assignment.submission.fileName}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenDialog(assignment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme text-white text-xs font-semibold rounded-lg hover:bg-theme/90 transition-colors shadow-sm"
                        >
                          <Upload size={14} />
                          {assignment.submission ? 'Update' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="border-gray-300 rounded-md text-sm focus:ring-theme focus:border-theme py-1 pl-2 pr-6"
                >
                  {[5, 10, 25].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalRecords)} of {totalRecords}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleChangePage(e, page - 1)}
                    disabled={page === 0}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button
                    onClick={(e) => handleChangePage(e, page + 1)}
                    disabled={page >= Math.ceil(totalRecords / rowsPerPage) - 1}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dialog for File Uploads */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedAssignment?.title || 'Submit Assignment'}
            </h2>
          </div>
          <div className="p-6">
            <div className="pt-2">
              <FileUpload
                label="Select Assignment File"
                accept=".pdf,.doc,.docx,.txt"
                onUploadSuccess={(url, name) => {
                  setFileUrl(url);
                  setFileName(name);
                }}
              />
              {fileName && !uploading && (
                <p className="mt-3 text-sm font-medium text-green-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Ready to submit: <span className="text-gray-900">{fileName}</span>
                </p>
              )}
              {uploading && (
                <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-theme h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end items-center gap-3 rounded-b-xl border-t border-gray-100">
            <button
              onClick={handleCloseDialog}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!fileUrl || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white text-sm font-semibold rounded-lg hover:bg-theme/90 transition-all shadow-sm shadow-theme/20 disabled:opacity-50 disabled:shadow-none"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload size={16} />
              )}
              {uploading ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AssignmentView;
