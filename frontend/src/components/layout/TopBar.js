import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../hooks/useAuth';

const TopBar = ({ courseTitle, onBack, showProgress, progress, onSidebarToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {onBack && (
            <IconButton
              edge="start"
              onClick={onBack}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              ←
            </IconButton>
          )}
          {courseTitle && (
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 500 }}>
              {courseTitle}
            </Typography>
          )}
          {!courseTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  mr: 1,
                }}
              >
                LMS
              </Box>
              <Typography variant="h6" noWrap component="div" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                LMS
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showProgress && progress !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Progress {progress}%
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  position: 'relative',
                  display: 'inline-flex',
                }}
              >
                <svg width={40} height={40}>
                  <circle
                    cx={20}
                    cy={20}
                    r={18}
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={3}
                  />
                  <circle
                    cx={20}
                    cy={20}
                    r={18}
                    fill="none"
                    stroke="#ff5722"
                    strokeWidth={3}
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {progress}%
                </Box>
              </Box>
            </Box>
          )}

          <Chip
            icon={<LocalFireDepartmentIcon sx={{ color: '#ff5722 !important' }} />}
            label="8 Days Streak"
            size="small"
            sx={{
              bgcolor: 'transparent',
              border: '1px solid #e0e0e0',
            }}
          />

          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
              },
            }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>

          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/student/profile')}
          >
            {getInitials(user?.name)}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
