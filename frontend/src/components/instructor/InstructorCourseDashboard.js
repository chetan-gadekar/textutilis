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
import MainLayout from '../layout/MainLayout';
import CourseSidebar from '../student/courseDashboard/CourseSidebar';
import ContentViewer from '../student/courseDashboard/ContentViewer';

const DRAWER_WIDTH = 320;

const InstructorCourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [courseStructure, setCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  const fetchCourseStructure = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorCourseStructure(courseId);
      setCourseStructure(response.data);
    } catch (err) {
      notify.error(err.message || 'Failed to fetch course structure');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

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
      const response = await courseService.getInstructorContent(content._id);
      setSelectedContent(response.data.content);
    } catch (err) {
      console.error('Failed to fetch content details:', err);
      notify.error('Failed to load lecture content');
    } finally {
      setContentLoading(false);
    }
  };

  // Instructors are read-only — no progress saving
  const handleProgressUpdate = () => {};

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
  const drawerWidth = DRAWER_WIDTH;
  const mainSidebarWidth = isMobile ? 0 : 80;

  return (
    <MainLayout
      courseTitle={course?.title}
      onBack={() => navigate('/instructor/courses')}
      showProgress={false}
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
          loadingModules={{}}
          selectedContent={selectedContent}
          onModuleToggle={handleModuleToggle}
          onContentClick={handleContentClick}
          drawerWidth={drawerWidth}
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          isMobile={isMobile}
        />

        {/* Main Content Area */}
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
              currentProgress={null}
              onProgressUpdate={handleProgressUpdate}
              onNextContent={() => {
                const allContent = modules.flatMap(m => m.topics.flatMap(t => t.content));
                const currentIndex = allContent.findIndex(c => c._id === selectedContent?._id);
                if (currentIndex !== -1 && currentIndex < allContent.length - 1) {
                  handleContentClick(allContent[currentIndex + 1]);
                } else {
                  notify.success("You've reached the end of the course content.");
                }
              }}
              hasNextContent={(() => {
                const allContent = modules.flatMap(m => m.topics.flatMap(t => t.content));
                const currentIndex = allContent.findIndex(c => c._id === selectedContent?._id);
                return currentIndex !== -1 && currentIndex < allContent.length - 1;
              })()}
            />
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default InstructorCourseDashboard;
