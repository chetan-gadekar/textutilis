const teachingPointService = require('../services/teachingPointService');
const assignmentService = require('../services/assignmentService');
const studentService = require('../services/studentService');

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

module.exports = {
  updateTodayTeachingPoints,
  getTodayTeachingPoints,
  getSubmissions,
  getAllSubmissions,
  getStudents,
};
