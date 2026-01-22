import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Courses to {student?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          Toggle courses to assign or unassign them from this student
        </Typography>

        {courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading courses...
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {courses.map((course) => (
              <ListItem
                key={course._id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: assignedCourses.has(course._id) ? '#f0f7ff' : 'white',
                  '&:hover': {
                    bgcolor: assignedCourses.has(course._id) ? '#e3f2fd' : '#f5f5f5',
                  },
                }}
              >
                <ListItemText
                  primary={course.title}
                  secondary={course.description || 'No description'}
                  primaryTypographyProps={{
                    fontWeight: assignedCourses.has(course._id) ? 600 : 400,
                  }}
                />
                <Switch
                  checked={assignedCourses.has(course._id)}
                  onChange={() => onToggleCourse(course._id)}
                  color="primary"
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting || courses.length === 0}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCoursesDialog;
