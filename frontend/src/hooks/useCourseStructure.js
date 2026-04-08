import { useState } from 'react';
import moduleService from '../services/moduleService';
import topicService from '../services/topicService';
import topicContentService from '../services/topicContentService';
import notify from '../utils/notify';

export const useCourseStructure = (courseId, onRefresh) => {
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 0 });
  const [topicForm, setTopicForm] = useState({ title: '', description: '', order: 0 });
  const [contentForm, setContentForm] = useState({
    contentType: 'video',
    title: '',
    description: '',
    contentData: '',
    duration: 0,
    order: 0,
  });

  // Module handlers
  const handleOpenModuleDialog = (module = null, modulesLength = 0) => {
    if (module) {
      setModuleForm({ title: module.title, description: module.description || '', order: module.order });
      setSelectedModule(module);
    } else {
      setModuleForm({ title: '', description: '', order: modulesLength });
      setSelectedModule(null);
    }
    setModuleDialogOpen(true);
  };

  const handleCloseModuleDialog = () => {
    setModuleDialogOpen(false);
    setSelectedModule(null);
    setModuleForm({ title: '', description: '', order: 0 });
  };

  const handleSaveModule = async () => {
    try {
      setIsSaving(true);
      if (selectedModule) {
        await moduleService.updateModule(selectedModule._id, moduleForm);
      } else {
        await moduleService.createModule(courseId, moduleForm);
      }
      onRefresh();
      notify.success(`Module ${selectedModule ? 'updated' : 'created'} successfully`);
      handleCloseModuleDialog();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save module');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure? This will delete all topics and content in this module.')) {
      return;
    }
    try {
      await moduleService.deleteModule(moduleId);
      notify.success('Module deleted successfully');
      onRefresh();
    } catch (err) {
      notify.error(err.message || 'Failed to delete module');
    }
  };

  // Topic handlers
  const handleOpenTopicDialog = (module, topic = null) => {
    setSelectedModule(module);
    if (topic) {
      setTopicForm({ title: topic.title, description: topic.description || '', order: topic.order });
      setSelectedTopic(topic);
    } else {
      const topicCount = module.topics?.length || 0;
      setTopicForm({ title: '', description: '', order: topicCount });
      setSelectedTopic(null);
    }
    setTopicDialogOpen(true);
  };

  const handleCloseTopicDialog = () => {
    setTopicDialogOpen(false);
    setSelectedModule(null);
    setSelectedTopic(null);
    setTopicForm({ title: '', description: '', order: 0 });
  };

  const handleSaveTopic = async () => {
    try {
      setIsSaving(true);
      if (selectedTopic) {
        await topicService.updateTopic(selectedTopic._id, topicForm);
      } else {
        await topicService.createTopic(selectedModule._id, topicForm);
      }
      onRefresh();
      notify.success(`Topic ${selectedTopic ? 'updated' : 'created'} successfully`);
      handleCloseTopicDialog();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save topic');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure? This will delete all content in this topic.')) {
      return;
    }
    try {
      await topicService.deleteTopic(topicId);
      notify.success('Topic deleted successfully');
      onRefresh();
    } catch (err) {
      notify.error(err.message || 'Failed to delete topic');
    }
  };

  // Content handlers
  const handleOpenContentDialog = (topic, content = null) => {
    setSelectedTopic(topic);
    if (content) {
      setContentForm({
        contentType: content.contentType,
        title: content.title,
        description: content.description || '',
        contentData: content.contentData,
        duration: content.duration || 0,
        order: content.order,
        _id: content._id,
      });
    } else {
      const contentCount = topic.content?.length || 0;
      setContentForm({
        contentType: 'video',
        title: '',
        description: '',
        contentData: '',
        duration: 0,
        order: contentCount,
      });
    }
    setContentDialogOpen(true);
  };

  const handleCloseContentDialog = () => {
    setContentDialogOpen(false);
    setSelectedTopic(null);
    setContentForm({
      contentType: 'video',
      title: '',
      description: '',
      contentData: '',
      duration: 0,
      order: 0,
    });
    setUploadingVideo(false);
  };

  const handleSaveContent = async () => {
    try {
      if (!contentForm.contentData) {
        notify.error('Content data is required');
        return;
      }
      
      setIsSaving(true);
      const contentData = { ...contentForm };
      delete contentData._id;

      if (contentForm._id) {
        await topicContentService.updateContent(contentForm._id, contentData);
      } else {
        await topicContentService.createContent(selectedTopic._id, contentData);
      }
      onRefresh();
      notify.success(`Content ${contentForm._id ? 'updated' : 'created'} successfully`);
      handleCloseContentDialog();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }
    try {
      await topicContentService.deleteContent(contentId);
      notify.success('Content deleted successfully');
      onRefresh();
    } catch (err) {
      notify.error(err.message || 'Failed to delete content');
    }
  };

  return {
    // Dialog states
    moduleDialogOpen,
    topicDialogOpen,
    contentDialogOpen,
    selectedModule,
    selectedTopic,
    uploadingVideo,
    setUploadingVideo,
    isSaving,
    // Forms
    moduleForm,
    setModuleForm,
    topicForm,
    setTopicForm,
    contentForm,
    setContentForm,
    // Handlers
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
  };
};
