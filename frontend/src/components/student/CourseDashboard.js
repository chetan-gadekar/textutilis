import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import MainLayout from '../layout/MainLayout';
import CourseSidebar from './courseDashboard/CourseSidebar';
import ContentViewer from './courseDashboard/ContentViewer';
import RatingSection from './courseDashboard/RatingSection';

const CourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseStructure, setCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(null);



  const fetchCourseStructure = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentCourseStructure(courseId);
      setCourseStructure(response.data);

      if (response.data?.modules?.length > 0) {
        setExpandedModules({ [response.data.modules[0]._id]: true });
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch course structure');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchContentProgress = useCallback(async () => {
    if (!selectedContent) return;

    try {
      const response = await studentService.getVideoProgress(selectedContent._id);
      setCurrentProgress(response.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [selectedContent]);

  useEffect(() => {
    fetchCourseStructure();
  }, [fetchCourseStructure]);

  useEffect(() => {
    if (selectedContent) {
      fetchContentProgress();
    }
  }, [selectedContent, fetchContentProgress]);

  const handleModuleToggle = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleContentClick = async (content) => {
    setSelectedContent(content);

    try {
      const response = await studentService.getVideoProgress(content._id);
      setCurrentProgress(response.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleProgressUpdate = async (progress) => {
    if (!selectedContent) return;

    const isCompleted = progress > 0.95;
    const videoPosition = progress * 100;

    const module = courseStructure.modules.find((m) =>
      m.topics.some((t) => t.content.some((c) => c._id === selectedContent._id))
    );
    const topic = module?.topics.find((t) =>
      t.content.some((c) => c._id === selectedContent._id)
    );

    try {
      await studentService.saveContentProgress(
        selectedContent._id,
        topic?._id,
        module?._id,
        courseId,
        videoPosition,
        isCompleted
      );

      fetchCourseStructure();
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !courseStructure) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Failed to load course'}</Alert>
      </Box>
    );
  }

  const { course, modules } = courseStructure;

  return (
    <MainLayout
      courseTitle={course?.title}
      onBack={() => navigate('/student/courses')}
      showProgress={true}
      progress={course?.progress || 0}
    >
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', mt: -3 }}>
        <CourseSidebar
          course={course}
          modules={modules}
          expandedModules={expandedModules}
          selectedContent={selectedContent}
          onModuleToggle={handleModuleToggle}
          onContentClick={handleContentClick}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            bgcolor: 'white',
            ml: 0,
          }}
        >
          <ContentViewer
            content={selectedContent}
            currentProgress={currentProgress}
            onProgressUpdate={handleProgressUpdate}
          />
          {selectedContent && <RatingSection />}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CourseDashboard;
