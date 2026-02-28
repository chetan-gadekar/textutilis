import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import FileUpload from '../../common/FileUpload';

const AssignmentFormDialog = ({
  open,
  onClose,
  courses,
  selectedCourse,
  onCourseChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  attachment,
  onAttachmentChange,
  onSubmit,
  submitting,
  editing,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Select Course *</InputLabel>
            <Select
              value={selectedCourse}
              onChange={onCourseChange}
              label="Select Course *"
              required
              disabled={editing} // Usually course shouldn't be changed during edit
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Assignment Title"
            value={title}
            onChange={onTitleChange}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={onDescriptionChange}
            multiline
            rows={4}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={onDueDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Assignment Attachment (Optional)
          </Typography>
          <FileUpload
            label="Upload Assignment Document (PDF, DOC, etc.)"
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
            onUploadSuccess={onAttachmentChange}
          />
          {attachment && (
            <Typography variant="caption" color="success.main">
              File uploaded: {attachment.fileName}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignmentFormDialog;
