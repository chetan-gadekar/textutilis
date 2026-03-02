import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FileText, Copy, Edit3, Trash } from 'lucide-react';

const AssignmentTable = ({ assignments, onDelete, onEdit, pagination }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibility</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created At</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600">No assignments found</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first assignment to get started!</p>
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-800">{assignment.title}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {assignment.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Visible
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 items-center">
                      <Tooltip title="Edit" placement="top">
                        <button
                          onClick={() => onEdit(assignment)}
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 rounded-xl transition-colors"
                        >
                          <Edit3 size={20} strokeWidth={2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete" placement="top">
                        <button
                          onClick={() => onDelete(assignment._id)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-colors"
                        >
                          <Trash size={20} strokeWidth={2} />
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
      {pagination && (
        <div className="bg-white border-t border-gray-100 flex justify-end items-center px-4 py-1">
          {pagination}
        </div>
      )}
    </div>
  );
};

export default AssignmentTable;
