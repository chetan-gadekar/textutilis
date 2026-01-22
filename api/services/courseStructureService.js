const Course = require('../schemas/Course');
const Module = require('../schemas/Module');
const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Enrollment = require('../schemas/Enrollment');
const Progress = require('../schemas/Progress');

// Get full course structure for student
const getCourseStructureForStudent = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course || !course.isVisible) {
    throw new Error('Course not found or not visible');
  }

  // Get all modules
  const modules = await Module.find({ courseId })
    .sort({ order: 1, createdAt: 1 });

  // Get all topics for all modules
  const moduleIds = modules.map(m => m._id);
  const topics = await Topic.find({ moduleId: { $in: moduleIds } })
    .sort({ order: 1, createdAt: 1 });

  // Get all content for all topics
  const topicIds = topics.map(t => t._id);
  const content = await TopicContent.find({ topicId: { $in: topicIds } })
    .sort({ order: 1, createdAt: 1 });

  // Get all progress for student
  const progressRecords = await Progress.find({
    studentId,
    courseId,
    contentId: { $in: content.map(c => c._id) },
  });

  // Create progress map
  const progressMap = {};
  progressRecords.forEach(p => {
    progressMap[p.contentId.toString()] = p;
  });

  // Structure the data
  const structuredModules = modules.map(module => {
    const moduleTopics = topics
      .filter(t => t.moduleId.toString() === module._id.toString())
      .map(topic => {
        const topicContent = content
          .filter(c => c.topicId.toString() === topic._id.toString())
          .map(c => {
            const progress = progressMap[c._id.toString()] || null;
            return {
              ...c.toObject(),
              progress: progress ? {
                videoPosition: progress.videoPosition,
                isCompleted: progress.isCompleted,
                lastAccessedAt: progress.lastAccessedAt,
              } : null,
            };
          });

        // Calculate topic progress
        const completedContent = topicContent.filter(c => c.progress?.isCompleted).length;
        const topicProgress = topicContent.length > 0
          ? Math.round((completedContent / topicContent.length) * 100)
          : 0;

        return {
          ...topic.toObject(),
          content: topicContent,
          progress: topicProgress,
          completedCount: completedContent,
          totalCount: topicContent.length,
        };
      });

    // Calculate module progress
    const allModuleContent = moduleTopics.flatMap(t => t.content);
    const completedModuleContent = allModuleContent.filter(c => c.progress?.isCompleted).length;
    const moduleProgress = allModuleContent.length > 0
      ? Math.round((completedModuleContent / allModuleContent.length) * 100)
      : 0;

    return {
      ...module.toObject(),
      topics: moduleTopics,
      progress: moduleProgress,
      completedCount: completedModuleContent,
      totalCount: allModuleContent.length,
    };
  });

  // Calculate overall course progress
  const allContent = content;
  const completedContent = progressRecords.filter(p => p.isCompleted).length;
  const courseProgress = allContent.length > 0
    ? Math.round((completedContent / allContent.length) * 100)
    : 0;

  return {
    course: {
      ...course.toObject(),
      progress: courseProgress,
      completedCount: completedContent,
      totalCount: allContent.length,
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
    });

  if (!content) {
    throw new Error('Content not found');
  }

  const courseId = content.topicId.moduleId.courseId._id;

  // Verify enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  // Get progress
  const progress = await Progress.findOne({ studentId, contentId });

  return {
    content: content.toObject(),
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
