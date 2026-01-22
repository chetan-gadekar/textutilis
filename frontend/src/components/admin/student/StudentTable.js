import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';

const StudentTable = ({ students, onAssignCourses, onToggleStatus }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Chip
                    label={student.isActive ? 'Active' : 'Inactive'}
                    color={student.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Tooltip title="Assign Course">
                      <IconButton color="primary" size="small" onClick={() => onAssignCourses(student)}>
                        <ClassIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={student.isActive ? 'Deactivate' : 'Activate'}>
                      <Switch
                        checked={student.isActive}
                        onChange={() => onToggleStatus(student._id)}
                        size="small"
                        color="success"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentTable;
