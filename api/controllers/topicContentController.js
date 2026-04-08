const topicContentService = require('../services/topicContentService');
const topicService = require('../services/topicService');
const moduleService = require('../services/moduleService');
const courseService = require('../services/courseService');

// ─── Ownership helper ─────────────────────────────────────────────────────────

/**
 * Verify that the requesting user owns (or has bypass on) the course that
 * contains the given topic. Returns { allowed, topic, module, course }.
 */
const verifyTopicOwnership = async (topicId, user) => {
  const { topic } = await topicService.getTopicById(topicId);
  const { module } = await moduleService.getModuleById(topic.moduleId._id);
  const course = await courseService.getCourseById(module.courseId._id);

  const hasBypass = user.role === 'admin' || user.role === 'super_instructor';
  const isOwner = course.instructor && (
    (course.instructor._id && course.instructor._id.toString() === user.id) ||
    (course.instructor.toString() === user.id)
  );
  return { allowed: isOwner || hasBypass, topic, module, course };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Create topic content
// @route   POST /api/super-instructor/topics/:topicId/content
// @access  Private/SuperInstructor
const createContent = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { allowed } = await verifyTopicOwnership(topicId, req.user);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add content to this topic',
      });
    }

    const contentData = { ...req.body, topicId };
    const content = await topicContentService.createContent(contentData);
    res.status(201).json({ success: true, data: content });
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
    // Run auth check and content fetch in parallel
    const [{ allowed }, content] = await Promise.all([
      verifyTopicOwnership(topicId, req.user),
      topicContentService.getContentByTopic(topicId),
    ]);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view content for this topic',
      });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ success: true, count: content.length, data: content });
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
    // Fetch content metadata and apply update in parallel
    const [content, updatedContent] = await Promise.all([
      topicContentService.getContentById(id),
      topicContentService.updateContent(id, req.body),
    ]);

    const { allowed } = await verifyTopicOwnership(content.topicId, req.user);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content',
      });
    }

    res.json({ success: true, data: updatedContent });
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
    const { allowed } = await verifyTopicOwnership(content.topicId, req.user);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content',
      });
    }

    await topicContentService.deleteContent(id);
    res.json({ success: true, message: 'Content deleted successfully' });
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
