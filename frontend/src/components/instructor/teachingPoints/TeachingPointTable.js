import { Tooltip } from '@mui/material';
import { Copy, FileText, Edit3, Trash } from 'lucide-react';

const TeachingPointTable = ({ points, onEdit, onDelete, onDuplicate }) => {
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
            {points.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600">No topics found for today</p>
                  </div>
                </td>
              </tr>
            ) : (
              points.map((point, index) => (
                <tr key={point._id || point.tempId || index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-800">{point.title}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {point.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-green-50 text-green-700 border-green-200">
                      {point.visibility || 'Visible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {point.createdAt
                      ? new Date(point.createdAt).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 items-center">
                      <Tooltip title="Duplicate" placement="top">
                        <button
                          onClick={() => onDuplicate(point)}
                          className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors"
                        >
                          <Copy size={18} strokeWidth={2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="View Details" placement="top">
                        <button className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors">
                          <FileText size={18} strokeWidth={2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Edit" placement="top">
                        <button
                          onClick={() => onEdit(point)}
                          className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors"
                        >
                          <Edit3 size={18} strokeWidth={2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete" placement="top">
                        <button
                          onClick={() => onDelete(point)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-colors"
                        >
                          <Trash size={18} strokeWidth={2} />
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
    </div>
  );
};

export default TeachingPointTable;
