const teachingPointService = require('../services/teachingPointService');
const assignmentService = require('../services/assignmentService');
const studentService = require('../services/studentService');
const courseService = require('../services/courseService');
const courseStructureService = require('../services/courseStructureService');

// @desc    Update today's teaching points
// @route   PUT /api/instructor/teaching-points/today
// @access  Private/Instructor
const updateTodayTeachingPoints = async (req, res, next) => {
  try {
    const { teachingPoints } = req.body;
    const teachingPoint = await teachingPointService.updateTodayTeachingPoints(
      req.user.id,
      teachingPoints
    );
    res.json({
      success: true,
      data: teachingPoint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's teaching points
// @route   GET /api/instructor/teaching-points/today
// @access  Private/Instructor
const getTodayTeachingPoints = async (req, res, next) => {
  try {
    const teachingPoint = await teachingPointService.getTodayTeachingPoints(req.user.id);
    res.json({
      success: true,
      data: teachingPoint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for assignment
// @route   GET /api/instructor/assignments/:assignmentId/submissions
// @access  Private/Instructor
const getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await assignmentService.getSubmissionsByAssignment(assignmentId);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions with filters
// @route   GET /api/instructor/submissions
// @access  Private/Instructor
const getAllSubmissions = async (req, res, next) => {
  try {
    const { page, limit, studentId, startDate, endDate, assignmentTitle } = req.query;
    const filters = {
      page,
      limit,
      studentId,
      startDate,
      endDate,
      assignmentTitle,
    };

    const { submissions, total, pages, currentPage } = await assignmentService.getAllSubmissions(filters);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      count: submissions.length,
      total,
      pages,
      currentPage,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (for autocomplete)
// @route   GET /api/instructor/students
// @access  Private/Instructor
const getStudents = async (req, res, next) => {
  try {
    const { name, limit } = req.query;
    const filters = {
      name,
      limit: limit || 50, // Default limit for autocomplete
    };

    const { students } = await studentService.getAllStudents(filters);
    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor's courses (owned or assigned)
// @route   GET /api/instructor/courses
// @access  Private/Instructor
const getMyCourses = async (req, res, next) => {
  try {
    const user = req.user;
    const filters = { instructor: user.id };
    if (user.assignedCourses && user.assignedCourses.length > 0) {
      filters.assignedCourses = user.assignedCourses;
    }
    const courses = await courseService.getAllCourses(filters);
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
// @route   GET /api/instructor/courses/:courseId/structure
// @access  Private/Instructor
const getCourseStructure = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const structure = await courseStructureService.getCourseStructureForInstructor(courseId);
    res.json({
      success: true,
      data: structure,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific content item
// @route   GET /api/instructor/content/:contentId
// @access  Private/Instructor
const getContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const data = await courseStructureService.getContentForInstructor(contentId);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for a course
// @route   GET /api/instructor/courses/:courseId/assignments
// @access  Private/Instructor
const getCourseAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
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

// @desc    Add remark to a submission
// @route   PUT /api/instructor/submissions/:submissionId/remark
// @access  Private/Instructor
const addRemark = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { remark } = req.body;
    if (!remark || !remark.trim()) {
      return res.status(400).json({ success: false, message: 'Remark text is required' });
    }
    const submission = await assignmentService.addRemark(submissionId, remark.trim(), req.user.id);
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateTodayTeachingPoints,
  getTodayTeachingPoints,
  getSubmissions,
  getAllSubmissions,
  getStudents,
  getMyCourses,
  getCourseStructure,
  getContent,
  getCourseAssignments,
  addRemark,
};
