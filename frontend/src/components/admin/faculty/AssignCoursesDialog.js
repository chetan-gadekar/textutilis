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
  facultyMember,
  allCourses,
  selectedCourseIds,
  onToggleCourse,
  onSubmit,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Courses to {facultyMember?.name}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {allCourses.length === 0 ? (
              <Typography align="center">No courses found to assign.</Typography>
            ) : (
              allCourses.map((course) => (
                <ListItem
                  key={course._id}
                  dense
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: selectedCourseIds.includes(course._id) ? '#f0f7ff' : 'white',
                    '&:hover': {
                      bgcolor: selectedCourseIds.includes(course._id) ? '#e3f2fd' : '#f5f5f5',
                    },
                  }}
                >
                  <ListItemText
                    primary={course.title}
                    secondary={course.description ? course.description.substring(0, 50) + '...' : 'No description'}
                    primaryTypographyProps={{
                      fontWeight: selectedCourseIds.includes(course._id) ? 600 : 400,
                    }}
                  />
                  <Switch
                    edge="end"
                    checked={selectedCourseIds.includes(course._id)}
                    onChange={() => onToggleCourse(course._id)}
                    color="primary"
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          Save Assignments
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCoursesDialog;
