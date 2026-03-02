import React from 'react';
import {
  Tooltip,
  Switch,
} from '@mui/material';
import { BookOpen } from 'lucide-react';

const StudentTable = ({ students, onAssignCourses, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Created At</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">No students found</p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-800">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${student.isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-4 items-center">
                    <Tooltip title="Assign Course" placement="top">
                      <button
                        onClick={() => onAssignCourses(student)}
                        className="p-2 bg-[#f8f5ff] text-[#8b5cf6] hover:bg-[#f3edff] rounded-2xl transition-colors"
                      >
                        <BookOpen size={20} strokeWidth={1.5} />
                      </button>
                    </Tooltip>

                    {/* Minimal vertical divider */}
                    <div className="h-6 w-px bg-gray-200"></div>

                    <Tooltip title={student.isActive ? 'Deactivate' : 'Activate'} placement="top">
                      <div className="flex items-center cursor-pointer" onClick={() => onToggleStatus(student._id)}>
                        <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${student.isActive ? 'bg-[#3b82f6]' : 'bg-gray-300'
                          }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${student.isActive ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
