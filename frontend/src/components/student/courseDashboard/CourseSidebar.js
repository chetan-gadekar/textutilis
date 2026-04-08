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
  ListItemIcon,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardBackspace as ArrowBackIcon,
  Sensors as SensorsIcon, // For "System Design Live" style icon
  PlayCircleOutline as PlayIcon,
  ArticleOutlined as ArticleIcon,
  QuizOutlined as QuizIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Lock as LockIcon,
  FolderOpen as FolderIcon,
  Topic as TopicIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PptIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const CourseSidebar = ({
  course,
  modules,
  expandedModules,
  selectedContent,
  onModuleToggle,
  onContentClick,
  drawerWidth = 320,
  variant = 'permanent',
  open = true,
  onClose,
  isMobile = false,
}) => {
  const theme = useTheme();

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        zIndex: isMobile ? 1205 : undefined,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: isMobile ? 0 : 64, // Keep spacing below app bar on desktop
          left: isMobile ? 0 : 80, // Keep offset for main sidebar
          height: isMobile ? '100%' : 'calc(100% - 64px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          fontFamily: "'Poppins', sans-serif !important",
          zIndex: isMobile ? 1300 : 1100, // Higher z-index on mobile
        },
        '& .MuiTypography-root, & *': {
          fontFamily: "'Poppins', sans-serif !important",
        }
      }}
    >
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 90, borderBottom: '1px solid #e0e0e0' }}>
          <IconButton onClick={onClose} sx={{ color: '#1a1a1a' }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      )}

      {/* Course Header - Removed as per user code */}

      {/* Modules List */}
      <List sx={{
        overflowY: 'auto',
        flexGrow: 1,
        py: 0,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#e0e0e0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#bdbdbd',
        },
      }}>
        {modules.map((module, index) => (
          <React.Fragment key={module._id}>
            <ListItem disablePadding sx={{
              display: 'block'
            }}>
              <ListItemButton
                onClick={() => onModuleToggle(module._id)}
                sx={{
                  py: 2,
                  bgcolor: '#fff', // White background
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: '#fafafa',
                  },
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#616161" sx={{ fontSize: '1.2rem', fontFamily: 'Poppins' }}>
                    Module {(index + 1).toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.title}
                  </Typography>
                </Box>
                {expandedModules[module._id] ? (
                  <ExpandLessIcon color="action" />
                ) : (
                  <ExpandMoreIcon color="action" />
                )}
              </ListItemButton>
            </ListItem>

            <Collapse in={expandedModules[module._id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: '#fff', position: 'relative', py: 2 }}>

                {/* 
                    Flatten topics to render a continuous timeline. 
                    This allows checking index === 0 and index === length - 1 for the line logic.
                */}
                {module.topics.flatMap(chat => chat.content).map((content, index, array) => {
                  const isSelected = selectedContent?._id === content._id;
                  const isCompleted = content.progress?.isCompleted || false;
                  const isFirst = index === 0;
                  const isLast = index === array.length - 1;

                  const getIcon = () => {
                    if (isCompleted) return <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
                    switch (content.contentType) {
                      case 'video': return <PlayIcon sx={{ fontSize: 18, color: isSelected ? '#6A4E9E' : '#757575' }} />;
                      case 'ppt': return <PdfIcon sx={{ fontSize: 18, color: isSelected ? '#6A4E9E' : '#757575' }} />;
                      case 'text': return <DescriptionIcon sx={{ fontSize: 18, color: isSelected ? '#6A4E9E' : '#757575' }} />;
                      default: return <DescriptionIcon sx={{ fontSize: 18, color: '#757575' }} />;
                    }
                  };

                  return (
                    <Box key={content._id} sx={{ position: 'relative' }}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => onContentClick(content)}
                        sx={{
                          pl: 7,
                          pr: 2,
                          py: 1.5,
                          position: 'relative',
                          alignItems: 'flex-start',
                          borderLeft: isSelected ? '4px solid #6A4E9E' : '4px solid transparent',
                          bgcolor: isSelected ? alpha('#6A4E9E', 0.05) : 'transparent',
                          '&:hover': { bgcolor: alpha('#6A4E9E', 0.02) },
                          '&.Mui-selected': { bgcolor: alpha('#6A4E9E', 0.05) },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Per-item Timeline Line */}
                        {!isFirst && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 28,
                              top: 0,
                              height: '30px', // Reach down to icon center
                              borderLeft: '2px dashed #e0e0e0', // Slightly thicker and lighter
                              zIndex: 1
                            }}
                          />
                        )}
                        {!isLast && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 28,
                              top: '30px', // Start from icon center
                              bottom: 0,
                              borderLeft: '2px dashed #e0e0e0',
                              zIndex: 1
                            }}
                          />
                        )}

                        {/* Timeline Node (Icon) */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 14,
                            top: 16,
                            zIndex: 2,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: isCompleted ? alpha('#4caf50', 0.1) : (isSelected ? alpha('#6A4E9E', 0.1) : '#fafafa'),
                            border: '1px solid',
                            borderColor: isCompleted ? alpha('#4caf50', 0.3) : (isSelected ? alpha('#6A4E9E', 0.3) : '#eeeeee'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isSelected ? `0 0 10px ${alpha('#6A4E9E', 0.2)}` : 'none',
                          }}
                        >
                          {getIcon()}
                        </Box>

                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 600 : 400,
                                color: '#616161', // Dark Grey
                                fontSize: '1.1rem',
                                mb: 0.5,
                                lineHeight: 1.3,
                                fontFamily: 'Poppins'
                              }}
                            >
                              {content.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.9rem', fontFamily: 'Poppins' }}>
                              {content.createdAt ? new Date(content.createdAt).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }).replace(',', '') : 'Date not available'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </Box>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default CourseSidebar;
