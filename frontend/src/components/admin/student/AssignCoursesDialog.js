import React from 'react';
import {
  Dialog,
  Switch,
  CircularProgress,
} from '@mui/material';
import { X, Book } from 'lucide-react';

const AssignCoursesDialog = ({
  open,
  onClose,
  student,
  courses,
  assignedCourses,
  onToggleCourse,
  onSubmit,
  submitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 font-poppins">
            Assign Courses
          </h2>
          <p className="text-sm text-gray-500 font-poppins mt-1">
            Managing enrollment for <span className="font-semibold text-gray-700">{student?.name}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors self-start">
          <X size={20} />
        </button>
      </div>

      <div className="font-poppins overflow-y-auto px-5 py-4" style={{ maxHeight: '450px' }}>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CircularProgress size={40} thickness={4} sx={{ color: '#6366f1' }} />
            <p className="text-sm text-gray-500 mt-4 font-medium">Loading available courses...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const isAssigned = assignedCourses.has(course._id);
              return (
                <div
                  key={course._id}
                  onClick={() => onToggleCourse(course._id)}
                  className={`flex items-start p-4 rounded-xl border transition-all cursor-pointer ${isAssigned
                    ? 'bg-theme/5 border-theme/30 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg mr-4 flex-shrink-0 ${isAssigned ? 'bg-theme/10 text-theme' : 'bg-gray-50 text-gray-400'}`}>
                    <Book size={20} strokeWidth={isAssigned ? 2.5 : 2} />
                  </div>

                  <div className="flex-grow">
                    <h3 className={`text-sm font-semibold mb-1 w-11/12 ${isAssigned ? 'text-gray-900' : 'text-gray-700'}`}>
                      {course.title}
                    </h3>
                    <p className={`text-xs w-11/12 ${isAssigned ? 'text-theme-dark/70' : 'text-gray-500'}`}>
                      {course.description || 'No description available for this course.'}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isAssigned}
                      onChange={() => onToggleCourse(course._id)}
                      color="primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme/20 shadow-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || courses.length === 0}
          className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors flex items-center justify-center min-w-[100px] ${(submitting || courses.length === 0)
            ? 'bg-theme/70 cursor-not-allowed'
            : 'bg-theme hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme/50'
            }`}
        >
          {submitting ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : 'Save Assignments'}
        </button>
      </div>
    </Dialog>
  );
};

export default AssignCoursesDialog;
