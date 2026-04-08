import React, { useState, useEffect } from 'react';
import {
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import notify from '../../utils/notify';
import { Plus } from 'lucide-react';
import teachingPointService from '../../services/teachingPointService';
import MainLayout from '../layout/MainLayout';
import TeachingPointFormDialog from './teachingPoints/TeachingPointFormDialog';
import TeachingPointTable from './teachingPoints/TeachingPointTable';

const TeachingPointsUpdate = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
      // Removed orphaned setError(null)
    } catch (err) {
      if (err.response?.status !== 404) {
        notify.error(err.message || 'Failed to fetch teaching points');
      }
    } finally {
      setFetching(false);
    }
  };

  const savePoints = async (newPoints, successMessage = 'Teaching points updated successfully!') => {
    try {
      setLoading(true);
      await teachingPointService.updateTodayTeachingPoints(newPoints);
      setPoints(newPoints);
      notify.success(successMessage);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      notify.error('Title is required');
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

    const msg = currentId ? 'Topic updated successfully!' : 'New topic added successfully!';
    await savePoints(updatedPoints, msg);
    handleCloseDialog();
  };

  const handleDelete = async (pointToDelete) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    const updatedPoints = points.filter((p) => p !== pointToDelete);
    await savePoints(updatedPoints, 'Topic deleted successfully!');
  };

  const handleDuplicate = async (point) => {
    const duplicatedPoint = {
      ...point,
      title: `${point.title} (Copy)`,
      _id: undefined,
      tempId: Date.now().toString(),
    };
    const updatedPoints = [...points, duplicatedPoint];
    await savePoints(updatedPoints, 'Topic duplicated successfully!');
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
      <div className="font-poppins h-full">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Teaching Points Management</h1>
            <p className="text-gray-500 mt-1 font-light">Organize and track daily topics</p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="bg-theme hover:bg-theme-dark text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={2} />
            Add Today's Topic
          </button>
        </div>

        {/* Legacy alerts removed in favor of premium toasts */}

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
      </div>
    </MainLayout>
  );
};

export default TeachingPointsUpdate;
