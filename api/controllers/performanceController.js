const performanceService = require('../services/performanceService');

// @desc    Get instructor's students' performance
// @route   GET /api/instructor/performance
// @access  Private/Instructor
const getInstructorStudentsPerformance = async (req, res, next) => {
    try {
        const filters = {
            courseId: req.query.courseId,
            studentName: req.query.studentName,
        };
        const performances = await performanceService.getInstructorStudentsPerformance(req.user.id, filters);
        res.json({
            success: true,
            count: performances.length,
            data: performances,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all students' performance
// @route   GET /api/super-instructor/performance
// @access  Private/SuperInstructor
const getAllStudentsPerformance = async (req, res, next) => {
    try {
        console.log("req.query", req.query);

        const filters = {
            courseId: req.query.courseId,
            studentName: req.query.studentName,
        };
        console.log("filters", filters);
        const performances = await performanceService.getAllStudentsPerformance(filters);
        res.json({
            success: true,
            count: performances.length,
            data: performances,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student's own performance
// @route   GET /api/student/performance
// @access  Private/Student
const getMyPerformance = async (req, res, next) => {
    try {
        const performances = await performanceService.getStudentPerformances(req.user.id);
        res.json({
            success: true,
            count: performances.length,
            data: performances,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save self evaluation
// @route   PUT /api/student/performance/self-evaluation
// @access  Private/Student
const saveSelfEvaluation = async (req, res, next) => {
    try {
        const { courseId, updateData } = req.body;
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'courseId is required' });
        }
        const performance = await performanceService.updateSelfEvaluation(req.user.id, courseId, updateData);
        res.json({
            success: true,
            data: performance,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save instructor assessment
// @route   PUT /api/instructor/performance/:studentId/:courseId
// @route   PUT /api/super-instructor/performance/:studentId/:courseId
// @access  Private/Instructor/SuperInstructor
const saveInstructorAssessment = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.params;
        const { updateData } = req.body;

        // Minimal verification - could be enhanced to check if instructor actually teaches this course
        const performance = await performanceService.updateInstructorAssessment(
            studentId,
            courseId,
            updateData,
            req.user.id
        );

        res.json({
            success: true,
            data: performance,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInstructorStudentsPerformance,
    getAllStudentsPerformance,
    getMyPerformance,
    saveSelfEvaluation,
    saveInstructorAssessment,
};
