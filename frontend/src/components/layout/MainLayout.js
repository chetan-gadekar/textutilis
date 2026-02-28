import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children, courseTitle, onBack, showProgress, progress, initialCollapsed = false }) => {
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
      />
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
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
