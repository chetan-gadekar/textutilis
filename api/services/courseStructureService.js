const Course = require('../schemas/Course');
const Module = require('../schemas/Module');
const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Enrollment = require('../schemas/Enrollment');
const Progress = require('../schemas/Progress');

// Get full course structure for student
const getCourseStructureForStudent = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId }).lean();
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .lean();

  if (!course || !course.isVisible) {
    throw new Error('Course not found or not visible');
  }

  // Get all modules, topics, and content metadata (lean and projected)
  const modules = await Module.find({ courseId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const moduleIds = modules.map(m => m._id);
  const topics = await Topic.find({ moduleId: { $in: moduleIds } })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const topicIds = topics.map(t => t._id);
  // Optimization: Exclude heavy content data during initial structure fetch
  const contentMetadata = await TopicContent.find({ topicId: { $in: topicIds } })
    .select('-contentData -description')
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // Get student progress
  const progressRecords = await Progress.find({
    studentId,
    courseId,
    contentId: { $in: contentMetadata.map(c => c._id) },
  }).lean();

  // Create lookup maps for performance
  const progressMap = new Map(progressRecords.map(p => [p.contentId.toString(), p]));
  const topicsByModule = new Map();
  const contentByTopic = new Map();

  contentMetadata.forEach(c => {
    const tid = c.topicId.toString();
    if (!contentByTopic.has(tid)) contentByTopic.set(tid, []);

    const progress = progressMap.get(c._id.toString());
    contentByTopic.get(tid).push({
      ...c,
      progress: progress ? {
        videoPosition: progress.videoPosition,
        isCompleted: progress.isCompleted,
        lastAccessedAt: progress.lastAccessedAt,
      } : null,
    });
  });

  topics.forEach(t => {
    const mid = t.moduleId.toString();
    if (!topicsByModule.has(mid)) topicsByModule.set(mid, []);

    const topicContent = contentByTopic.get(t._id.toString()) || [];
    const completedCount = topicContent.filter(c => c.progress?.isCompleted).length;

    topicsByModule.get(mid).push({
      ...t,
      content: topicContent,
      completedCount,
      totalCount: topicContent.length,
      progress: topicContent.length > 0 ? Math.round((completedCount / topicContent.length) * 100) : 0,
    });
  });

  const structuredModules = modules.map(module => {
    const moduleTopics = topicsByModule.get(module._id.toString()) || [];
    const allModuleContent = moduleTopics.flatMap(t => t.content);
    const completedCount = allModuleContent.filter(c => c.progress?.isCompleted).length;

    return {
      ...module,
      topics: moduleTopics,
      completedCount,
      totalCount: allModuleContent.length,
      progress: allModuleContent.length > 0 ? Math.round((completedCount / allModuleContent.length) * 100) : 0,
    };
  });

  const totalContentCount = contentMetadata.length;
  const totalCompletedCount = progressRecords.filter(p => p.isCompleted).length;

  return {
    course: {
      ...course,
      progress: totalContentCount > 0 ? Math.round((totalCompletedCount / totalContentCount) * 100) : 0,
      completedCount: totalCompletedCount,
      totalCount: totalContentCount,
    },
    modules: structuredModules,
    enrollment: {
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    },
  };
};

// Get specific content for student
const getContentForStudent = async (contentId, studentId) => {
  const content = await TopicContent.findById(contentId)
    .populate({
      path: 'topicId',
      populate: {
        path: 'moduleId',
        populate: {
          path: 'courseId',
        },
      },
    })
    .lean();

  if (!content) {
    throw new Error('Content not found');
  }

  const courseId = content.topicId.moduleId.courseId._id;

  // Verify enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId }).lean();
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  // Get progress
  const progress = await Progress.findOne({ studentId, contentId }).lean();

  return {
    content: content,
    progress: progress ? {
      videoPosition: progress.videoPosition,
      isCompleted: progress.isCompleted,
      lastAccessedAt: progress.lastAccessedAt,
    } : null,
  };
};

module.exports = {
  getCourseStructureForStudent,
  getContentForStudent,
};
