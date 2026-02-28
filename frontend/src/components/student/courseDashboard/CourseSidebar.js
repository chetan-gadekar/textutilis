import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  LinearProgress,
  Collapse,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const CourseSidebar = ({
  course,
  modules,
  expandedModules,
  selectedContent,
  onModuleToggle,
  onContentClick,
  drawerWidth = 320,
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: 64, // Below the app bar
          left: 80, // Start after the main sidebar (main sidebar is ~80px when collapsed)
          height: 'calc(100% - 64px)',
          borderRight: '1px solid #e0e0e0',
          bgcolor: '#fafafa',
          zIndex: 1100, // Above main sidebar (z-index: 1000)
        },
      }}
    >
      {/* Course Header */}
      <Box sx={{ p: 2.5, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {course.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4caf50',
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Box>

      {/* Module List */}
      <List sx={{ overflow: 'auto', flexGrow: 1, p: 0 }}>
        {modules.map((module, moduleIndex) => (
          <React.Fragment key={module._id}>
            {/* Module Header */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onModuleToggle(module._id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: expandedModules[module._id] ? '#e3f2fd' : 'white',
                  borderLeft: expandedModules[module._id] ? '4px solid #1976d2' : '4px solid transparent',
                  '&:hover': {
                    bgcolor: expandedModules[module._id] ? '#e3f2fd' : '#f5f5f5',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: expandedModules[module._id] ? '#1976d2' : '#424242',
                        fontSize: '0.9rem',
                      }}
                    >
                      Module {moduleIndex + 1}: {module.title}
                    </Typography>
                  }
                  secondary={
                    module.progress > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={module.progress}
                        sx={{
                          mt: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50',
                          },
                        }}
                      />
                    )
                  }
                />
                {expandedModules[module._id] ? (
                  <ExpandLessIcon sx={{ color: '#1976d2' }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: '#757575' }} />
                )}
              </ListItemButton>
            </ListItem>

            {/* Topics and Content */}
            <Collapse in={expandedModules[module._id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'white' }}>
                {module.topics.map((topic) => (
                  <React.Fragment key={topic._id}>
                    {/* Topic Title */}
                    <ListItem sx={{ pl: 4, py: 1, bgcolor: '#f9f9f9' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#616161',
                          fontSize: '0.85rem',
                        }}
                      >
                        {topic.title}
                      </Typography>
                    </ListItem>

                    {/* Content Items */}
                    {topic.content.map((content) => {
                      const isSelected = selectedContent?._id === content._id;
                      const isCompleted = content.progress?.isCompleted;

                      return (
                        <ListItem key={content._id} disablePadding>
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => onContentClick(content)}
                            sx={{
                              pl: 6,
                              py: 1.25,
                              '&.Mui-selected': {
                                bgcolor: '#e8f5e9',
                                borderLeft: '3px solid #4caf50',
                                '&:hover': {
                                  bgcolor: '#e8f5e9',
                                },
                              },
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                              },
                            }}
                          >
                            <Box sx={{ mr: 1.5 }}>
                              {isCompleted ? (
                                <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#bdbdbd' }} />
                              )}
                            </Box>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isSelected ? 600 : 400,
                                    color: isSelected ? '#2e7d32' : '#424242',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {content.title}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#9e9e9e',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {content.contentType === 'video' && content.duration
                                    ? `${Math.round(content.duration / 60)} min`
                                    : content.contentType}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>

            {moduleIndex < modules.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default CourseSidebar;
