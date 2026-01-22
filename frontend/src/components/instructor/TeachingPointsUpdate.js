import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import teachingPointService from '../../services/teachingPointService';
import MainLayout from '../layout/MainLayout';
import TeachingPointFormDialog from './teachingPoints/TeachingPointFormDialog';
import TeachingPointTable from './teachingPoints/TeachingPointTable';

const TeachingPointsUpdate = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [currentId, setCurrentId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTodayTeachingPoints();
  }, []);

  const fetchTodayTeachingPoints = async () => {
    try {
      setFetching(true);
      const response = await teachingPointService.getTodayTeachingPoints();
      if (response.data && response.data.teachingPoints) {
        if (Array.isArray(response.data.teachingPoints)) {
          const validPoints = response.data.teachingPoints
            .map((p) => {
              if (typeof p !== 'object' || p === null) return null;
              return {
                _id: p._id,
                tempId: p.tempId,
                title: typeof p.title === 'object' ? JSON.stringify(p.title) : String(p.title || ''),
                description:
                  typeof p.description === 'object' ? JSON.stringify(p.description) : String(p.description || ''),
                visibility: typeof p.visibility === 'string' ? p.visibility : 'Visible',
                createdAt: p.createdAt,
              };
            })
            .filter((p) => p && p.title);
          setPoints(validPoints);
        } else {
          setPoints([]);
        }
      } else {
        setPoints([]);
      }
      setError(null);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to fetch teaching points');
      }
    } finally {
      setFetching(false);
    }
  };

  const savePoints = async (newPoints) => {
    try {
      setLoading(true);
      await teachingPointService.updateTodayTeachingPoints(newPoints);
      setPoints(newPoints);
      setSuccess('Teaching points updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (point = null) => {
    if (point) {
      setCurrentId(point._id || point.tempId);
      setTitle(point.title);
      setDescription(point.description || '');
    } else {
      setCurrentId(null);
      setTitle('');
      setDescription('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const newPoint = {
      title,
      description,
      visibility: 'Visible',
      createdAt: new Date().toISOString(),
    };

    let updatedPoints;
    if (currentId) {
      updatedPoints = points.map((p) =>
        p._id === currentId || p.tempId === currentId ? { ...p, ...newPoint, _id: p._id } : p
      );
    } else {
      updatedPoints = [...points, { ...newPoint, tempId: Date.now().toString() }];
    }

    await savePoints(updatedPoints);
    handleCloseDialog();
  };

  const handleDelete = async (pointToDelete) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    const updatedPoints = points.filter((p) => p !== pointToDelete);
    await savePoints(updatedPoints);
  };

  const handleDuplicate = async (point) => {
    const duplicatedPoint = {
      ...point,
      title: `${point.title} (Copy)`,
      _id: undefined,
      tempId: Date.now().toString(),
    };
    const updatedPoints = [...points, duplicatedPoint];
    await savePoints(updatedPoints);
  };

  if (fetching) {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Teaching Points Management
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#1976d2' }}>
            + ADD TODAYS TOPIC
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <TeachingPointTable
          points={points}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

        <TeachingPointFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          isEditing={!!currentId}
          title={title}
          onTitleChange={(e) => setTitle(e.target.value)}
          description={description}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Box>
    </MainLayout>
  );
};

export default TeachingPointsUpdate;
