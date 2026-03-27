import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Backdrop, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children, courseTitle, onBack, showProgress, progress, initialCollapsed = false, onCourseMenuToggle, rightActions }) => {
  const isMobile = useMediaQuery('(max-width:899px)');

  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    if (initialCollapsed) return false;
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    if (initialCollapsed) {
      setSidebarOpen(false);
    }
  }, [initialCollapsed]);

  const handleSidebarToggle = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar
        courseTitle={courseTitle}
        onBack={onBack}
        showProgress={showProgress}
        progress={progress}
        onSidebarToggle={handleSidebarToggle}
        onCourseMenuToggle={onCourseMenuToggle}
        rightActions={rightActions}
      />
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Dark overlay backdrop for mobile sidebar */}
      <Backdrop
        open={isMobile && sidebarOpen}
        onClick={handleSidebarToggle}
        sx={{
          zIndex: 1199, // Just below Sidebar z-index: 1200
          bgcolor: 'rgba(0, 0, 0, 0.6)',
        }}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          bgcolor: '#fafafa',
          minHeight: 'calc(100vh - 64px)',
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
