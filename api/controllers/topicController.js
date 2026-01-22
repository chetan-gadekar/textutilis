const topicService = require('../services/topicService');
const moduleService = require('../services/moduleService');
const courseService = require('../services/courseService');

// @desc    Create topic
// @route   POST /api/super-instructor/modules/:moduleId/topics
// @access  Private/SuperInstructor
const createTopic = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { module } = await moduleService.getModuleById(moduleId);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add topics to this module',
      });
    }

    const topicData = {
      ...req.body,
      moduleId,
    };
    const topic = await topicService.createTopic(topicData);
    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get topics for module
// @route   GET /api/super-instructor/modules/:moduleId/topics
// @access  Private/SuperInstructor
const getTopics = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { module } = await moduleService.getModuleById(moduleId);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view topics for this module',
      });
    }

    const topics = await topicService.getTopicsByModule(moduleId);
    res.json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get topic by ID
// @route   GET /api/super-instructor/topics/:id
// @access  Private/SuperInstructor
const getTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { topic, content } = await topicService.getTopicById(id);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this topic',
      });
    }

    res.json({
      success: true,
      data: { topic, content },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic
// @route   PUT /api/super-instructor/topics/:id
// @access  Private/SuperInstructor
const updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { topic } = await topicService.getTopicById(id);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this topic',
      });
    }

    const updatedTopic = await topicService.updateTopic(id, req.body);
    res.json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete topic
// @route   DELETE /api/super-instructor/topics/:id
// @access  Private/SuperInstructor
const deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { topic } = await topicService.getTopicById(id);
    
    // Verify ownership
    const { module } = await moduleService.getModuleById(topic.moduleId._id);
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this topic',
      });
    }

    await topicService.deleteTopic(id);
    res.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTopic,
  getTopics,
  getTopic,
  updateTopic,
  deleteTopic,
};
