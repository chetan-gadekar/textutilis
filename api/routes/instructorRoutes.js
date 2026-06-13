const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const performanceController = require('../controllers/performanceController');
const { protect, authorize } = require('../middlewares/auth');
const { validateTeachingPoint } = require('../middlewares/validator');

// All routes require instructor or super_instructor role
router.use(protect);
router.use(authorize('instructor', 'super_instructor'));

router.put('/teaching-points/today', validateTeachingPoint, instructorController.updateTodayTeachingPoints);
router.get('/teaching-points/today', instructorController.getTodayTeachingPoints);
router.get('/assignments/:assignmentId/submissions', instructorController.getSubmissions);
router.get('/submissions', instructorController.getAllSubmissions);
router.put('/submissions/:submissionId/remark', instructorController.addRemark);
router.get('/students', instructorController.getStudents);

// Course viewing routes (same access as student, no enrollment required)
router.get('/courses', instructorController.getMyCourses);
router.get('/courses/:courseId/structure', instructorController.getCourseStructure);
router.get('/courses/:courseId/assignments', instructorController.getCourseAssignments);
router.get('/content/:contentId', instructorController.getContent);

// Performance routes
router.get('/performance', performanceController.getInstructorStudentsPerformance);
router.put('/performance/:studentId/:courseId', performanceController.saveInstructorAssessment);

module.exports = router;

