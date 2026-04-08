import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import LoadingButton from '../common/LoadingButton';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MainLayout from '../layout/MainLayout';
import ModuleDialog from './courseStructure/ModuleDialog';
import TopicDialog from './courseStructure/TopicDialog';
import ContentDialog from './courseStructure/ContentDialog';
import ModuleAccordion from './courseStructure/ModuleAccordion';
import AssignmentFormDialog from './assignment/AssignmentFormDialog';
import courseService from '../../services/courseService';
import moduleService from '../../services/moduleService';
import topicService from '../../services/topicService';
import topicContentService from '../../services/topicContentService';
import assignmentService from '../../services/assignmentService';
import notify from '../../utils/notify';
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
  const [expandedModule, setExpandedModule] = useState(false);

  // ── Assignment dialog state ────────────────────────────────────────────────
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentAttachments, setAssignmentAttachments] = useState([]);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  const handleOpenAssignmentDialog = useCallback(() => {
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentAttachments([]);
    setAssignmentDialogOpen(true);
  }, []);

  const handleCloseAssignmentDialog = useCallback(() => {
    setAssignmentDialogOpen(false);
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentAttachments([]);
  }, []);

  const handleAssignmentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!assignmentTitle || !assignmentDescription || !assignmentDueDate) {
      notify.error('Please fill in all required assignment fields');
      return;
    }
    try {
      setAssignmentSubmitting(true);
      await assignmentService.createAssignment(courseId, {
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: assignmentDueDate,
        attachments: assignmentAttachments,
        courseId,
      });
      notify.success('Assignment created successfully!');
      handleCloseAssignmentDialog();
    } catch (err) {
      notify.error(err.message || 'Failed to create assignment');
    } finally {
      setAssignmentSubmitting(false);
    }
  }, [assignmentTitle, assignmentDescription, assignmentDueDate, assignmentAttachments, courseId, handleCloseAssignmentDialog]);

  // ──────────────────────────────────────────────────────────────────────────

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
    } catch (err) {
      notify.error(err.message || 'Failed to fetch course data');
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
    isSaving,
  } = useCourseStructure(courseId, fetchCourseData);

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
            <Button
              color="inherit"
              onClick={() => navigate('/super-instructor/courses')}
              sx={{ mb: 1, textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
            >
              ← Back to Courses
            </Button>
            <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
              Course Builder
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'background.paper',
            minHeight: '60vh',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
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
                  onAddAssignment={handleOpenAssignmentDialog}
                  getContentIcon={getContentIcon}
                />
              ))}
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 3 }}>
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModuleDialog(null, modules.length)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Add new topic
          </LoadingButton>
        </Box>

        <ModuleDialog
          open={moduleDialogOpen}
          onClose={handleCloseModuleDialog}
          module={selectedModule}
          formData={moduleForm}
          onFormChange={setModuleForm}
          onSave={handleSaveModule}
          loading={isSaving}
        />

        <TopicDialog
          open={topicDialogOpen}
          onClose={handleCloseTopicDialog}
          topic={selectedTopic}
          module={selectedModule}
          formData={topicForm}
          onFormChange={setTopicForm}
          onSave={handleSaveTopic}
          loading={isSaving}
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
          loading={isSaving}
        />

        {/* Assignment creation dialog — course is locked to current course */}
        <AssignmentFormDialog
          open={assignmentDialogOpen}
          onClose={handleCloseAssignmentDialog}
          courses={course ? [course] : []}
          selectedCourse={courseId}
          onCourseChange={() => {}}
          lockedCourse={course}
          title={assignmentTitle}
          onTitleChange={(e) => setAssignmentTitle(e.target.value)}
          description={assignmentDescription}
          onDescriptionChange={(e) => setAssignmentDescription(e.target.value)}
          dueDate={assignmentDueDate}
          onDueDateChange={(e) => setAssignmentDueDate(e.target.value)}
          attachments={assignmentAttachments}
          onAddAttachment={(url, name) => setAssignmentAttachments(prev => [...prev, { fileUrl: url, fileName: name }])}
          onRemoveAttachment={(i) => setAssignmentAttachments(prev => prev.filter((_, idx) => idx !== i))}
          onSubmit={handleAssignmentSubmit}
          submitting={assignmentSubmitting}
          editing={false}
        />
      </Box>
    </MainLayout>
  );
};

export default CourseStructureManager;
