const express = require('express');
const router = express.Router();
const superInstructorController = require('../controllers/superInstructorController');
const moduleController = require('../controllers/moduleController');
const topicController = require('../controllers/topicController');
const topicContentController = require('../controllers/topicContentController');
const performanceController = require('../controllers/performanceController');
const { protect, authorize } = require('../middlewares/auth');
const { validateCourse, validateContent, validateAssignment, validateTopicContent } = require('../middlewares/validator');

// All routes require super_instructor or instructor role
router.use(protect);
router.use(authorize('super_instructor', 'instructor'));

// Course routes
router.post('/courses', validateCourse, superInstructorController.createCourse);
router.get('/courses', superInstructorController.getCourses);
router.get('/courses/:id', superInstructorController.getCourse);
router.put('/courses/:id', validateCourse, superInstructorController.updateCourse);
router.delete('/courses/:id', superInstructorController.deleteCourse);

// Assignment routes
router.get('/assignments', superInstructorController.getAllAssignments);
router.post('/courses/:courseId/assignments', validateAssignment, superInstructorController.createAssignment);
router.get('/courses/:courseId/assignments', superInstructorController.getAssignments);
router.put('/assignments/:id', validateAssignment, superInstructorController.updateAssignment);
router.delete('/assignments/:id', superInstructorController.deleteAssignment);

// Module routes (Course > Module > Topic > Content structure)
router.post('/courses/:courseId/modules', moduleController.createModule);
router.get('/courses/:courseId/modules', moduleController.getModules);
router.get('/modules/:id', moduleController.getModule);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

// Topic routes
router.post('/modules/:moduleId/topics', topicController.createTopic);
router.get('/modules/:moduleId/topics', topicController.getTopics);
router.get('/topics/:id', topicController.getTopic);
router.put('/topics/:id', topicController.updateTopic);
router.delete('/topics/:id', topicController.deleteTopic);

// Topic Content routes
router.post('/topics/:topicId/content', validateTopicContent, topicContentController.createContent);
router.get('/topics/:topicId/content', topicContentController.getContent);
router.put('/content/:id', validateTopicContent, topicContentController.updateContent);
router.delete('/content/:id', topicContentController.deleteContent);

// Performance routes
router.get('/performance', performanceController.getAllStudentsPerformance);
router.put('/performance/:studentId/:courseId', performanceController.saveInstructorAssessment);

module.exports = router;
