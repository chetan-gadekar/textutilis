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

const TopicDialog = ({ open, onClose, topic, module, formData, onFormChange, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {topic ? 'Edit Topic' : 'Create Topic'} - {module?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Topic Title"
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
          {topic ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicDialog;
