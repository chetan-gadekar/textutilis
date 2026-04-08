const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const assignmentService = require('../services/assignmentService');
const studentService = require('../services/studentService');
const performanceService = require('../services/performanceService');
const courseStructureService = require('../services/courseStructureService');
const Enrollment = require('../schemas/Enrollment');
// Pre-loaded schemas for saveVideoProgress (avoids repeated require() on every call)
const TopicContent = require('../schemas/TopicContent');
const ModuleSchema = require('../schemas/Module');
const TopicSchema = require('../schemas/Topic');
const Progress = require('../schemas/Progress');

// @desc    Get student's enrolled courses
// @route   GET /api/student/courses
// @access  Private/Student
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getStudentCourses(req.user.id);
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course structure (Course > Module > Topic > Content)
// @route   GET /api/student/courses/:courseId/structure
// @access  Private/Student
const getCourseStructure = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const structure = await courseStructureService.getCourseStructureForStudent(
      courseId,
      req.user.id
    );
    res.json({
      success: true,
      data: structure,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course content (legacy - for backward compatibility)
// @route   GET /api/student/courses/:courseId/content
// @access  Private/Student
const getCourseContent = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId,
    });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Use new structure service
    const structure = await courseStructureService.getCourseStructureForStudent(
      courseId,
      req.user.id
    );
    res.json({
      success: true,
      data: structure,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific content item
// @route   GET /api/student/content/:contentId
// @access  Private/Student
const getContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const data = await courseStructureService.getContentForStudent(
      contentId,
      req.user.id
    );
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get video progress
// @route   GET /api/student/content/:contentId/progress
// @access  Private/Student
const getVideoProgress = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const progress = await studentService.getVideoProgress(req.user.id, contentId);
    res.json({
      success: true,
      data: progress || { videoPosition: 0, isCompleted: false },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save video progress
// @route   POST /api/student/content/progress
// @access  Private/Student
const saveVideoProgress = async (req, res, next) => {
  try {
    const { contentId, topicId, moduleId, courseId, videoPosition, isCompleted } = req.body;
    const progressData = {
      studentId: req.user.id,
      contentId,
      topicId,
      moduleId,
      courseId,
      videoPosition,
      isCompleted,
    };

    // Save the progress record and fetch existing records in parallel
    // We only need the total counts and completed count to update the enrollment percentage
    const [progress, modules, allProgress] = await Promise.all([
      studentService.saveVideoProgress(progressData),
      ModuleSchema.find({ courseId }, '_id').lean(),
      Progress.find({ studentId: req.user.id, courseId, isCompleted: true }, 'contentId').lean(),
    ]);

    const moduleIds = modules.map(m => m._id);
    const topics = await TopicSchema.find({ moduleId: { $in: moduleIds } }, '_id').lean();
    const topicIds = topics.map(t => t._id);

    // Get total content count and current completion in parallel
    const [courseAllContentCount, enrollment] = await Promise.all([
      TopicContent.countDocuments({ topicId: { $in: topicIds } }),
      Enrollment.findOne({ studentId: req.user.id, courseId }),
    ]);

    const completedCount = allProgress.length;
    const overallProgress = courseAllContentCount > 0
      ? Math.round((completedCount / courseAllContentCount) * 100)
      : 0;

    // Only update if progress has actually changed to save a DB write
    if (enrollment && enrollment.progress !== overallProgress) {
      enrollment.progress = overallProgress;
      await enrollment.save();
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course progress
// @route   GET /api/student/courses/:courseId/progress
// @access  Private/Student
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    // Fetch progress records and enrollment simultaneously - they are independent
    const [progress, enrollment] = await Promise.all([
      studentService.getStudentProgressInCourse(req.user.id, courseId),
      Enrollment.findOne({ studentId: req.user.id, courseId }).lean(),
    ]);
    res.json({
      success: true,
      data: {
        enrollment: enrollment || null,
        contentProgress: progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for course
// @route   GET /api/student/courses/:courseId/assignments
// @access  Private/Student
const getAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId,
    });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    const assignments = await assignmentService.getAssignmentsByCourse(courseId);
    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my assignments with status and filters
// @route   GET /api/student/my-assignments
// @access  Private/Student
const getMyAssignments = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate, status } = req.query;
    const filters = {
      page,
      limit,
      startDate,
      endDate,
      status,
    };

    const result = await assignmentService.getStudentAssignmentsWithStatus(req.user.id, filters);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Submit assignment
// @route   POST /api/student/assignments/:assignmentId/submit
// @access  Private/Student
const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { fileUrl, fileName } = req.body;

    const submissionData = {
      assignmentId,
      studentId: req.user.id,
      fileUrl,
      fileName,
    };
    const submission = await assignmentService.submitAssignment(submissionData);
    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile with performance
// @route   GET /api/student/profile
// @access  Private/Student
const getMyProfile = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.user.id);
    const performance = await performanceService.getStudentPerformances(req.user.id);
    res.json({
      success: true,
      data: {
        student,
        performance,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get my submissions
// @route   GET /api/student/submissions
// @access  Private/Student
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await assignmentService.getSubmissionsByStudent(req.user.id);
    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCourses,
  getCourseStructure,
  getCourseContent,
  getContent,
  getVideoProgress,
  saveVideoProgress,
  getCourseProgress,
  getAssignments,
  submitAssignment,
  getMyProfile,
  getMyAssignments,
  getMySubmissions,
};
