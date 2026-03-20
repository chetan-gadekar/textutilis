import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import MainLayout from '../layout/MainLayout';
import CourseSidebar from './courseDashboard/CourseSidebar';
import ContentViewer from './courseDashboard/ContentViewer';
import RatingSection from './courseDashboard/RatingSection';

const DRAWER_WIDTH = 320;

const CourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [courseStructure, setCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [loadingModules, setLoadingModules] = useState({});

  const fetchCourseStructure = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentCourseStructure(courseId);
      setCourseStructure(response.data);

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

    // Disable right-click globally on the course page
    const handleGlobalContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleGlobalContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
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
    try {
      setContentLoading(true);
      if (isMobile) {
        setMobileOpen(false);
      }
      // Fetch full content details (including contentData/description) on demand
      const response = await courseService.getStudentContent(content._id);
      setSelectedContent(response.data.content);
      setCurrentProgress(response.data.progress);
    } catch (err) {
      console.error('Failed to fetch content details:', err);
      setError('Failed to load lecture content');
    } finally {
      setContentLoading(false);
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

      // Refresh structure to show updated progress in sidebar
      const response = await courseService.getStudentCourseStructure(courseId);
      setCourseStructure(response.data);
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
  const drawerWidth = 320;
  const mainSidebarWidth = isMobile ? 0 : 80;

  return (
    <MainLayout
      courseTitle={course?.title}
      onBack={() => navigate('/student/courses')}
      showProgress={true}
      progress={course?.progress || 0}
      initialCollapsed={true}
      onCourseMenuToggle={() => setMobileOpen(true)}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 64,
          left: mainSidebarWidth, // Start after main sidebar
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* Fixed Sidebar */}
        <CourseSidebar
          course={course}
          modules={modules}
          expandedModules={expandedModules}
          loadingModules={loadingModules}
          selectedContent={selectedContent}
          onModuleToggle={handleModuleToggle}
          onContentClick={handleContentClick}
          drawerWidth={drawerWidth}
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          isMobile={isMobile}
        />

        {/* Main Content Area - positioned to the right of sidebar */}
        <Box
          component="main"
          onContextMenu={(e) => e.preventDefault()}
          sx={{
            position: 'absolute',
            left: isMobile ? 0 : `${drawerWidth}px`, // Start after course sidebar
            top: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            bgcolor: '#FAFAFA', // Match lighter background
            p: { xs: 1.5, sm: 2, md: 3 },
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            mozUserSelect: 'none',
          }}
        >
          {contentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ContentViewer
              content={selectedContent}
              course={course}
              currentProgress={currentProgress}
              onProgressUpdate={handleProgressUpdate}
            />
          )}
          {selectedContent && !contentLoading && <RatingSection />}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CourseDashboard;
