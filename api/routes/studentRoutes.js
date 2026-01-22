const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require student role
router.use(protect);
router.use(authorize('student'));

router.get('/courses', studentController.getMyCourses);
router.get('/courses/:courseId/structure', studentController.getCourseStructure);
router.get('/courses/:courseId/content', studentController.getCourseContent);
router.get('/courses/:courseId/progress', studentController.getCourseProgress);
router.get('/courses/:courseId/assignments', studentController.getAssignments);

router.get('/content/:contentId', studentController.getContent);
router.get('/content/:contentId/progress', studentController.getVideoProgress);
router.post('/content/progress', studentController.saveVideoProgress);

router.get('/submissions', studentController.getMySubmissions);
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

router.get('/profile', studentController.getMyProfile);

module.exports = router;
