import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useMediaQuery,
  Skeleton,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import notify from '../../utils/notify';
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
    } catch (err) {
      notify.error(err.message || 'Failed to fetch course structure');
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
      notify.error('Failed to load lecture content');
    } finally {
      setContentLoading(false);
    }
  };

  const handleProgressUpdate = async (progress, isManualToggle = false) => {
    if (!selectedContent) return;

    let isCompleted = progress > 0.95;
    let videoPosition = progress * 100;

    if (!isManualToggle && currentProgress) {
      // Don't downgrade progress or completion status during normal video playback
      if (currentProgress.isCompleted) {
        isCompleted = true;
      }
      if (currentProgress.videoPosition > videoPosition) {
        videoPosition = currentProgress.videoPosition;
      }
    }

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

      // 🚀 OPTIMIZATION: Update local state instead of full re-fetch
      setCourseStructure(prev => {
        if (!prev) return prev;
        
        const newModules = prev.modules.map(m => {
          if (m._id !== module._id) return m;
          return {
            ...m,
            topics: m.topics.map(t => {
              if (t._id !== topic._id) return t;
              return {
                ...t,
                content: t.content.map(c => {
                  if (c._id !== selectedContent._id) return c;
                  return { ...c, progress: { isCompleted, videoPosition } };
                })
              };
            })
          };
        });

        // Trigger milestone celebration if module just completed
        const isModuleNowComplete = newModules.find(m => m._id === module._id)
          .topics.every(t => t.content.every(c => c.progress?.isCompleted || (c._id === selectedContent._id && isCompleted)));
        
        const wasModuleComplete = prev.modules.find(m => m._id === module._id)
          .topics.every(t => t.content.every(c => c.progress?.isCompleted));

        if (isModuleNowComplete && !wasModuleComplete) {
          notify.success(`Congratulations! You've completed Module: ${module.title} 🎉`, {
            duration: 5000,
            icon: '🏆'
          });
        }

        return { ...prev, modules: newModules };
      });

      // Update current progress locally so the checkbox reflects this immediately
      setCurrentProgress((prev) => ({
        ...prev,
        isCompleted: isCompleted,
        videoPosition: videoPosition,
      }));

    } catch (err) {
      console.error('Failed to save progress:', err);
      notify.error('Progress sync failed - checking your connection');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!courseStructure) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6" color="text.secondary">
          Unable to load course structure. Please try again later.
        </Typography>
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
          left: mainSidebarWidth, 
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
            left: isMobile ? 0 : `${drawerWidth}px`, 
            top: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            bgcolor: '#FAFAFA', 
            p: { xs: 1.5, sm: 2, md: 3 },
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            mozUserSelect: 'none',
          }}
        >
          {contentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <Skeleton variant="rectangular" width="100%" height="400px" sx={{ borderRadius: 2 }} />
            </Box>
          ) : (
            <ContentViewer
              content={selectedContent}
              course={course}
              currentProgress={currentProgress}
              onProgressUpdate={handleProgressUpdate}
              onNextContent={() => {
                // Flatten all content to find next one
                const allContent = modules.flatMap(m => m.topics.flatMap(t => t.content));
                const currentIndex = allContent.findIndex(c => c._id === selectedContent?._id);
                if (currentIndex !== -1 && currentIndex < allContent.length - 1) {
                  handleContentClick(allContent[currentIndex + 1]);
                } else {
                  notify.success("Great job! You've reached the end of the course content.");
                }
              }}
              hasNextContent={(() => {
                const allContent = modules.flatMap(m => m.topics.flatMap(t => t.content));
                const currentIndex = allContent.findIndex(c => c._id === selectedContent?._id);
                return currentIndex !== -1 && currentIndex < allContent.length - 1;
              })()}
            />
          )}
          {selectedContent && !contentLoading && <RatingSection />}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CourseDashboard;
