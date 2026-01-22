const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const assignmentService = require('../services/assignmentService');
const studentService = require('../services/studentService');
const performanceService = require('../services/performanceService');
const courseStructureService = require('../services/courseStructureService');
const Enrollment = require('../schemas/Enrollment');

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
    const progress = await studentService.saveVideoProgress(progressData);
    
    // Update enrollment progress
    const TopicContent = require('../schemas/TopicContent');
    const Module = require('../schemas/Module');
    const Topic = require('../schemas/Topic');
    
    // Get all content for course
    const modules = await Module.find({ courseId });
    const moduleIds = modules.map(m => m._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } });
    const topicIds = topics.map(t => t._id);
    const allContent = await TopicContent.find({ topicId: { $in: topicIds } });
    
    // Calculate overall progress
    const allProgress = await Progress.find({
      studentId: req.user.id,
      courseId,
      contentId: { $in: allContent.map(c => c._id) },
    });
    
    const completedCount = allProgress.filter(p => p.isCompleted).length;
    const overallProgress = allContent.length > 0
      ? Math.round((completedCount / allContent.length) * 100)
      : 0;
    
    await Enrollment.findOneAndUpdate(
      { studentId: req.user.id, courseId },
      { progress: overallProgress }
    );
    
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
    const progress = await studentService.getStudentProgressInCourse(req.user.id, courseId);
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId,
    });
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
    const performance = await performanceService.getPerformanceByStudent(req.user.id);
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

module.exports = {
  getMyCourses,
  getCourseStructure,
  getCourseContent,
  getContent,
  getVideoProgress,
  saveVideoProgress,
  getCourseProgress,
  getAssignments,
  getMySubmissions,
  submitAssignment,
  getMyProfile,
};
