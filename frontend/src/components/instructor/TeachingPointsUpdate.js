import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Plus } from 'lucide-react';
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

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-500">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
      </div>
    </MainLayout>
  );
};

export default TeachingPointsUpdate;
