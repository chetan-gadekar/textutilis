import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Avatar
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import adminService from '../../services/adminService';
import MainLayout from '../layout/MainLayout';
import {
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';

/* =========================================================
   🔐 SAFE TEXT HELPER (Same as Instructor View)
========================================================= */
const extractStringFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  const numericKeys = Object.keys(obj).filter(k => !isNaN(k));
  if (!numericKeys.length) return '';
  return numericKeys
    .sort((a, b) => Number(a) - Number(b))
    .map(k => obj[k])
    .join('');
};

const safeText = (value) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return extractStringFromObject(value);
  return '';
};

const TeachingPointsView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [showFilters, setShowFilters] = useState(false);

  // Instructors for dropdown
  const [instructors, setInstructors] = useState([]);

  // Filters State
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogPoints, setDialogPoints] = useState([]);

  // Fetch instructors on mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await adminService.getAllFaculty();
        setInstructors(response.data || []);
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
      }
    };
    fetchInstructors();
  }, []);

  const fetchTeachingPoints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        instructorId: selectedInstructorId,
        startDate,
        endDate
      };

      const response = await adminService.getAllTeachingPoints(params);
      setRecords(response.data || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch teaching points');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedInstructorId, startDate, endDate]);

  useEffect(() => {
    fetchTeachingPoints();
  }, [fetchTeachingPoints]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchTeachingPoints();
  };

  const handleClearFilters = () => {
    setSelectedInstructorId('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleViewDetails = (record) => {
    // Parse points for the dialog
    let points = [];
    if (Array.isArray(record.teachingPoints)) {
      points = record.teachingPoints.map(p => {
        if (typeof p !== 'object' || p === null) return null;
        return {
          _id: p._id,
          title: safeText(p.title || p), // Handle mixed legacy
          description: safeText(p.description),
          visibility: p.visibility || 'Visible',
          createdAt: p.createdAt
        };
      }).filter(p => p && p.title);
    }
    setDialogPoints(points);
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  if (loading && records.length === 0) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Teaching Points - All Instructors
            </Typography>
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
                sx={{ bgcolor: showFilters ? 'action.hover' : 'transparent' }}
              >
                {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl size="small" sx={{ flexGrow: 1, minWidth: 200 }}>
                  <InputLabel>Select Instructor</InputLabel>
                  <Select
                    value={selectedInstructorId}
                    label="Select Instructor"
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Instructors</em>
                    </MenuItem>
                    {instructors.map((instructor) => (
                      <MenuItem key={instructor._id} value={instructor._id}>
                        {instructor.name} ({instructor.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Button variant="contained" size="small" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </Box>
            </Paper>
          </Collapse>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Instructor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Topics Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>{row.instructorId?.name?.[0] || '?'}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {row.instructorId?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.instructorId?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {new Date(row.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={Array.isArray(row.teachingPoints) ? row.teachingPoints.length : '1 (Legacy)'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Topics">
                        <IconButton color="primary" onClick={() => handleViewDetails(row)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Topics for {selectedRecord?.instructorId?.name}
            <Typography variant="caption" display="block" color="text.secondary">
              {selectedRecord && new Date(selectedRecord.date).toLocaleDateString()}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Title</b></TableCell>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Visibility</b></TableCell>
                    <TableCell><b>Created</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dialogPoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No detailed topics found (Legacy text data might exist)</TableCell>
                    </TableRow>
                  ) : (
                    dialogPoints.map((p, idx) => (
                      <TableRow key={p._id || idx}>
                        <TableCell>{p.title}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>
                          <Chip label={p.visibility} size="small" color="success" />
                        </TableCell>
                        <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleTimeString() : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </MainLayout>
  );
};

export default TeachingPointsView;
