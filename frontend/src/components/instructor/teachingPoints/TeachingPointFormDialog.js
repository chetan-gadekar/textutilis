import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const TeachingPointFormDialog = ({
  open,
  onClose,
  isEditing,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  onSubmit,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg">
        {isEditing ? 'Edit Topic' : "Add Today's Topic"}
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent className="font-poppins overflow-y-auto px-5 py-3" style={{ paddingBottom: '0.5rem', paddingTop: '1rem' }}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Topic Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={onTitleChange}
                placeholder="E.g., CSS Flexbox Layouts"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={onDescriptionChange}
                placeholder="What will be covered today?"
                rows={4}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all resize-y"
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-3 px-5 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-sm bg-theme hover:bg-theme-dark text-white font-medium rounded-md shadow-sm transition-colors ml-2 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isEditing ? 'Update' : 'Add'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeachingPointFormDialog;
