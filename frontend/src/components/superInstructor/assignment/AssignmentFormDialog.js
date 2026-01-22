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
} from '@mui/material';

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
  onSubmit,
  submitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Assignment</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Select Course *</InputLabel>
            <Select
              value={selectedCourse}
              onChange={onCourseChange}
              label="Select Course *"
              required
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignmentFormDialog;
