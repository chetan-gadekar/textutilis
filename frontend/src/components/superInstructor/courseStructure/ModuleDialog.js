import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

const ModuleDialog = ({ open, onClose, module, formData, onFormChange, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{module ? 'Edit Module' : 'Create Module'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Module Title"
            fullWidth
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            required
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          />
          <TextField
            label="Order"
            type="number"
            fullWidth
            value={formData.order}
            onChange={(e) => onFormChange({ ...formData, order: parseInt(e.target.value) || 0 })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          {module ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleDialog;
