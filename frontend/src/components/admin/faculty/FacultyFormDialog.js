import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const FacultyFormDialog = ({ open, onClose, editingFaculty, formData, onFormChange, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '12px', margin: '16px', maxHeight: 'none' } }}>
      <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg">
        {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
      </DialogTitle>
      <DialogContent className="font-poppins overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              required
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
            <input
              type="email"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              required
              placeholder="Email Address"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
              {editingFaculty ? 'New Password (leave empty to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
              required={!editingFaculty}
              placeholder={editingFaculty ? 'Leave empty to keep current password' : 'Password'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Role *</label>
            <select
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all appearance-none cursor-pointer"
              value={formData.role}
              onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
              required
            >
              <option value="instructor">Instructor</option>
              <option value="super_instructor">Super Instructor</option>
            </select>
          </div>
        </div>
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
          className="px-4 py-1.5 text-sm bg-theme hover:bg-theme-dark text-white font-medium rounded-md shadow-sm transition-colors ml-2"
        >
          {editingFaculty ? 'Update' : 'Create'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default FacultyFormDialog;
