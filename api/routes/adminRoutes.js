const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));


router.get('/students', adminController.getAllStudents);
router.patch('/students/:id/toggle-status', adminController.toggleStudentStatus);
router.post('/students/:id/assign-courses', adminController.assignCoursesToStudent);
router.get('/students/:id/enrollments', adminController.getStudentEnrollments);

router.get('/faculty', adminController.getAllFaculty);
router.post('/faculty', adminController.createFaculty);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);
router.post('/faculty/:id/assign-courses', adminController.assignCoursesToFaculty);


router.get('/teaching-points', adminController.getAllTeachingPoints);
router.get('/courses', adminController.getAllCourses);

module.exports = router;
