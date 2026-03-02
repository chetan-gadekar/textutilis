import React from 'react';
import { Tooltip } from '@mui/material';
import { Edit3, Trash, BookOpen } from 'lucide-react';

const FacultyTable = ({
  faculty,
  onEdit,
  onDelete,
  onAssignCourses,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Courses</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created At</th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {faculty.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">No faculty members found</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first faculty member to get started!</p>
                </div>
              </td>
            </tr>
          ) : (
            faculty.map((facultyMember) => (
              <tr key={facultyMember._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-800">{facultyMember.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{facultyMember.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {facultyMember.role.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${facultyMember.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {facultyMember.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Tooltip title={facultyMember.isActive ? 'Deactivate' : 'Activate'} placement="top">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={facultyMember.isActive}
                          onChange={() => onToggleStatus(facultyMember)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-theme"></div>
                      </label>
                    </Tooltip>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {facultyMember.assignedCourses && facultyMember.assignedCourses.length > 0 ? (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {facultyMember.assignedCourses.length} Courses
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                  {new Date(facultyMember.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 items-center">
                    <Tooltip title="Assign Courses" placement="top">
                      <button
                        onClick={() => onAssignCourses(facultyMember)}
                        className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-500 hover:text-purple-700 rounded-xl transition-colors"
                      >
                        <BookOpen size={20} strokeWidth={2} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Edit Faculty" placement="top">
                      <button
                        onClick={() => onEdit(facultyMember)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 rounded-xl transition-colors"
                      >
                        <Edit3 size={20} strokeWidth={2} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Delete Faculty" placement="top">
                      <button
                        onClick={() => onDelete(facultyMember._id)}
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
  );
};

export default FacultyTable;
