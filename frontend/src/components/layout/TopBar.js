import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NotificationsOutlined as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PlaylistPlay as PlaylistPlayIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../hooks/useAuth';
import { alpha, styled } from '@mui/material/styles';

// Styled Search Component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.grey[100], 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[200], 1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '300px',
  },
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
  },
}));

const TopBar = ({ courseTitle, onBack, showProgress, progress, onSidebarToggle, onCourseMenuToggle, rightActions }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/student/profile');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ height: 70 }}>
        {/* Left Section: Logo or Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onCourseMenuToggle ? (
            <IconButton
              edge="start"
              onClick={onCourseMenuToggle}
              sx={{ mr: 1, display: { md: 'none' }, color: 'text.primary' }}
            >
              <PlaylistPlayIcon sx={{ fontSize: 32 }} />
            </IconButton>
          ) : (
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={onSidebarToggle}
              sx={{ mr: 1, display: { md: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {onBack && (
            <Tooltip title="Back">
              <IconButton
                edge="start"
                onClick={onBack}
                sx={{ mr: 2, color: 'text.primary' }}
              >
                ←
              </IconButton>
            </Tooltip>
          )}

          {courseTitle ? (
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {courseTitle}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  mr: 1.5,
                }}
              >
                L
              </Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  color: '#1a1a1a',
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                LMS<span style={{ color: '#2196F3' }}>.</span>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Center Section: Search Bar (Hidden on mobile if needed, or course title takes precedence) */}
        {!courseTitle && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search for courses, skills..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>
        )}

        {/* If course title is present, push right section to the end */}
        {courseTitle && <Box sx={{ flexGrow: 1 }} />}

        {/* Right Section: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showProgress && progress !== undefined && (
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
              <CircularProgress variant="determinate" value={progress} size={36} thickness={4} sx={{ color: '#ff6b6b' }} />
              <Typography variant="caption" sx={{ position: 'absolute', fontWeight: 600, fontSize: '0.65rem' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}
          {rightActions}

          <Tooltip title="Daily Streak">
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ color: '#FF7043 !important', fontSize: '1.2rem' }} />}
              label="8 Days Streak"
              size="small"
              sx={{
                bgcolor: alpha('#FFF3E0', 0.6),
                color: '#E64A19',
                fontWeight: 600,
                border: '1px solid',
                borderColor: alpha('#FFB74D', 0.3),
                display: { xs: 'none', md: 'flex' }
              }}
            />
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ ml: 1, color: 'text.secondary' }}>
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 0.5,
              pr: 1,
              borderRadius: '8px',
              '&:hover': { bgcolor: alpha('#000', 0.04) }
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 38,
                height: 38,
                fontSize: '0.9rem',
                border: '2px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <KeyboardArrowDownIcon
              sx={{
                color: 'text.secondary',
                fontSize: '1.2rem',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.2s',
                display: { xs: 'none', sm: 'block' }
              }}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                mt: 1.5,
                width: 200,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderTop: '1px solid',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {user?.email || 'student@gmail.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
