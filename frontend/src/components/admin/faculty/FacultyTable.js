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
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

const FacultyTable = ({
  faculty,
  onEdit,
  onDelete,
  onAssignCourses,
  onToggleStatus,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned Courses</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {faculty.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No faculty members found
              </TableCell>
            </TableRow>
          ) : (
            faculty.map((facultyMember) => (
              <TableRow key={facultyMember._id}>
                <TableCell>{facultyMember.name}</TableCell>
                <TableCell>{facultyMember.email}</TableCell>
                <TableCell>
                  <Chip
                    label={facultyMember.role.replace('_', ' ').toUpperCase()}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={facultyMember.isActive ? 'Active' : 'Inactive'}
                      color={facultyMember.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Tooltip title={facultyMember.isActive ? 'Deactivate' : 'Activate'}>
                      <Switch
                        checked={facultyMember.isActive}
                        onChange={() => onToggleStatus(facultyMember)}
                        size="small"
                        color="success"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {facultyMember.assignedCourses && facultyMember.assignedCourses.length > 0 ? (
                    <Chip
                      label={`${facultyMember.assignedCourses.length} Courses`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      None
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(facultyMember.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Assign Courses">
                    <IconButton
                      color="info"
                      onClick={() => onAssignCourses(facultyMember)}
                      size="small"
                    >
                      <SchoolIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(facultyMember)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => onDelete(facultyMember._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FacultyTable;
