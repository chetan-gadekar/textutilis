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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const drawerWidth = 320;

const CourseSidebar = ({
  course,
  modules,
  expandedModules,
  selectedContent,
  onModuleToggle,
  onContentClick,
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
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          mt: 8,
          bgcolor: '#f5f5f5',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'white' }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', mb: 1 }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Progress: {course.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{
              flexGrow: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4caf50',
              },
            }}
          />
        </Box>
      </Box>

      <List sx={{ overflow: 'auto', flexGrow: 1, bgcolor: 'white' }}>
        {modules.map((module) => (
          <React.Fragment key={module._id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onModuleToggle(module._id)}
                sx={{
                  bgcolor: expandedModules[module._id] ? '#e3f2fd' : 'transparent',
                  borderLeft: expandedModules[module._id] ? '3px solid #1976d2' : 'none',
                  '&:hover': {
                    bgcolor: expandedModules[module._id] ? '#e3f2fd' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: expandedModules[module._id] ? '#4caf50' : 'inherit' }}
                      >
                        {module.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    module.progress > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={module.progress}
                        sx={{ mt: 0.5, height: 3, borderRadius: 2, bgcolor: '#e0e0e0' }}
                      />
                    )
                  }
                />
                {expandedModules[module._id] ? (
                  <ExpandLessIcon sx={{ color: '#4caf50' }} />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItemButton>
            </ListItem>

            <Collapse in={expandedModules[module._id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {module.topics.map((topic) => (
                  <React.Fragment key={topic._id}>
                    <ListItem disablePadding sx={{ pl: 3, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                            {topic.title}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {topic.content.map((content) => {
                      const isSelected = selectedContent?._id === content._id;
                      const isCompleted = content.progress?.isCompleted;

                      return (
                        <ListItem key={content._id} disablePadding sx={{ pl: 5 }}>
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => onContentClick(content)}
                            sx={{
                              py: 1,
                              '&.Mui-selected': {
                                bgcolor: '#e8f5e9',
                                '&:hover': {
                                  bgcolor: '#e8f5e9',
                                },
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: isCompleted ? '#4caf50' : '#e0e0e0',
                                  border: '2px solid',
                                  borderColor: isSelected ? '#4caf50' : 'transparent',
                                }}
                              />
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isSelected ? 600 : 400,
                                      color: isSelected ? '#4caf50' : 'text.primary',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {content.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {content.contentType === 'video' && content.duration
                                      ? `${Math.round(content.duration / 60)} min`
                                      : content.contentType.toUpperCase()}
                                  </Typography>
                                }
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default CourseSidebar;
