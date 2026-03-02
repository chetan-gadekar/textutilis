import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const AssignCoursesDialog = ({
  open,
  onClose,
  facultyMember,
  allCourses,
  selectedCourseIds,
  onToggleCourse,
  onSubmit,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '12px', margin: '16px', maxHeight: 'none' } }}>
      <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg">
        Assign Courses to {facultyMember?.name}
      </DialogTitle>
      <DialogContent className="font-poppins overflow-y-auto px-5 py-4" style={{ maxHeight: '400px' }}>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {allCourses.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No courses found to assign.</p>
            ) : (
              allCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => onToggleCourse(course._id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedCourseIds.includes(course._id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex-1 pr-4">
                    <h3 className={`text-sm ${selectedCourseIds.includes(course._id) ? 'font-semibold text-blue-800' : 'font-medium text-gray-800'}`}>
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {course.description || 'No description'}
                    </p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selectedCourseIds.includes(course._id)}
                        readOnly
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-theme"></div>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions className="p-3 px-5 border-t border-gray-100 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-4 py-1.5 text-sm bg-theme hover:bg-theme-dark text-white font-medium rounded-md shadow-sm transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Assignments
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCoursesDialog;
