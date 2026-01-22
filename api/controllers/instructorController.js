const teachingPointService = require('../services/teachingPointService');
const assignmentService = require('../services/assignmentService');

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

module.exports = {
  updateTodayTeachingPoints,
  getTodayTeachingPoints,
  getSubmissions,
};
