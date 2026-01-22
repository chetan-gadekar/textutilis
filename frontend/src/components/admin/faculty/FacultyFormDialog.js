import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
} from '@mui/material';

const FacultyFormDialog = ({ open, onClose, editingFaculty, formData, onFormChange, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            label={editingFaculty ? 'New Password (leave empty to keep current)' : 'Password'}
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
            required={!editingFaculty}
          />
          <TextField
            select
            label="Role"
            fullWidth
            value={formData.role}
            onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
            required
          >
            <MenuItem value="instructor">Instructor</MenuItem>
            <MenuItem value="super_instructor">Super Instructor</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {editingFaculty ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacultyFormDialog;
