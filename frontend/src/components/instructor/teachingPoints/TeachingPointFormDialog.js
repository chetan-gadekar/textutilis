import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Topic' : "Add Today's Topic"}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic Title"
            value={title}
            onChange={onTitleChange}
            required
            sx={{ mb: 3, mt: 1 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={onDescriptionChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeachingPointFormDialog;
