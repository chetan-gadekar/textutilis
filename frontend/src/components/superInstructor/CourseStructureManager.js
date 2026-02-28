import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MainLayout from '../layout/MainLayout';
import ModuleDialog from './courseStructure/ModuleDialog';
import TopicDialog from './courseStructure/TopicDialog';
import ContentDialog from './courseStructure/ContentDialog';
import ModuleAccordion from './courseStructure/ModuleAccordion';
import courseService from '../../services/courseService';
import moduleService from '../../services/moduleService';
import topicService from '../../services/topicService';
import topicContentService from '../../services/topicContentService';
import { useCourseStructure } from '../../hooks/useCourseStructure';

const getContentIcon = (contentType) => {
  switch (contentType) {
    case 'video':
      return <PlayArrowIcon fontSize="small" />;
    case 'ppt':
      return <PictureAsPdfIcon fontSize="small" />;
    case 'text':
      return <DescriptionIcon fontSize="small" />;
    default:
      return <DescriptionIcon fontSize="small" />;
  }
};

const CourseStructureManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseResponse, modulesResponse] = await Promise.all([
        courseService.getCourse(courseId),
        moduleService.getModules(courseId),
      ]);

      setCourse(courseResponse.data);

      const modulesWithData = await Promise.all(
        modulesResponse.data.map(async (module) => {
          const topicsResponse = await topicService.getTopics(module._id);
          const topicsWithContent = await Promise.all(
            topicsResponse.data.map(async (topic) => {
              const contentResponse = await topicContentService.getContent(topic._id);
              return { ...topic, content: contentResponse.data || [] };
            })
          );
          return { ...module, topics: topicsWithContent };
        })
      );

      setModules(modulesWithData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleAccordionChange = useCallback((moduleId) => (event, isExpanded) => {
    setExpandedModule(isExpanded ? moduleId : false);
  }, []);

  const {
    moduleDialogOpen,
    topicDialogOpen,
    contentDialogOpen,
    selectedModule,
    selectedTopic,
    uploadingVideo,
    setUploadingVideo,
    moduleForm,
    setModuleForm,
    topicForm,
    setTopicForm,
    contentForm,
    setContentForm,
    handleOpenModuleDialog,
    handleCloseModuleDialog,
    handleSaveModule,
    handleDeleteModule,
    handleOpenTopicDialog,
    handleCloseTopicDialog,
    handleSaveTopic,
    handleDeleteTopic,
    handleOpenContentDialog,
    handleCloseContentDialog,
    handleSaveContent,
    handleDeleteContent,
  } = useCourseStructure(courseId, fetchCourseData, setError);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button onClick={() => navigate('/super-instructor/courses')} sx={{ mb: 1 }}>
              ← Back to Courses
            </Button>
            <Typography variant="h5" component="h1" fontWeight={700}>
              Course Builder
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', minHeight: '60vh' }}>
          {modules.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start building your course
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add your first topic to get started
              </Typography>
            </Box>
          ) : (
            <Box>
              {modules.map((module, index) => (
                <ModuleAccordion
                  key={module._id}
                  module={module}
                  index={index}
                  expanded={expandedModule === module._id}
                  onChange={handleAccordionChange(module._id)}
                  onEditModule={(m) => handleOpenModuleDialog(m, modules.length)}
                  onDeleteModule={handleDeleteModule}
                  onAddTopic={handleOpenTopicDialog}
                  onEditTopic={handleOpenTopicDialog}
                  onDeleteTopic={handleDeleteTopic}
                  onAddContent={handleOpenContentDialog}
                  onEditContent={handleOpenContentDialog}
                  onDeleteContent={handleDeleteContent}
                  getContentIcon={getContentIcon}
                />
              ))}
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModuleDialog(null, modules.length)}
            sx={{
              bgcolor: '#0288d1', // Specific blue from image
              '&:hover': { bgcolor: '#01579b' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Add new topic
          </Button>
        </Box>

        <ModuleDialog
          open={moduleDialogOpen}
          onClose={handleCloseModuleDialog}
          module={selectedModule}
          formData={moduleForm}
          onFormChange={setModuleForm}
          onSave={handleSaveModule}
        />

        <TopicDialog
          open={topicDialogOpen}
          onClose={handleCloseTopicDialog}
          topic={selectedTopic}
          module={selectedModule}
          formData={topicForm}
          onFormChange={setTopicForm}
          onSave={handleSaveTopic}
        />

        <ContentDialog
          open={contentDialogOpen}
          onClose={handleCloseContentDialog}
          content={contentForm._id ? contentForm : null}
          topic={selectedTopic}
          formData={contentForm}
          onFormChange={setContentForm}
          onSave={handleSaveContent}
          uploadingVideo={uploadingVideo}
          setUploadingVideo={setUploadingVideo}
          onError={setError}
        />
      </Box>
    </MainLayout>
  );
};

export default CourseStructureManager;
