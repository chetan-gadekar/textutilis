const topicContentService = require('../services/topicContentService');
const topicService = require('../services/topicService');
const moduleService = require('../services/moduleService');
const courseService = require('../services/courseService');

// @desc    Create topic content
// @route   POST /api/super-instructor/topics/:topicId/content
// @access  Private/SuperInstructor
const createContent = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { topic } = await topicService.getTopicById(topicId);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add content to this topic',
      });
    }

    const contentData = {
      ...req.body,
      topicId,
    };
    const content = await topicContentService.createContent(contentData);
    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content for topic
// @route   GET /api/super-instructor/topics/:topicId/content
// @access  Private/SuperInstructor
const getContent = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { topic } = await topicService.getTopicById(topicId);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view content for this topic',
      });
    }

    const content = await topicContentService.getContentByTopic(topicId);
    res.json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update content
// @route   PUT /api/super-instructor/content/:id
// @access  Private/SuperInstructor
const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await topicContentService.getContentById(id);
    const { topic } = await topicService.getTopicById(content.topicId);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content',
      });
    }

    const updatedContent = await topicContentService.updateContent(id, req.body);
    res.json({
      success: true,
      data: updatedContent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete content
// @route   DELETE /api/super-instructor/content/:id
// @access  Private/SuperInstructor
const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await topicContentService.getContentById(id);
    const { topic } = await topicService.getTopicById(content.topicId);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content',
      });
    }

    await topicContentService.deleteContent(id);
    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContent,
  getContent,
  updateContent,
  deleteContent,
};
