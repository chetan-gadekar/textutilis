const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { protect, authorize } = require('../middlewares/auth');
const { validateTeachingPoint } = require('../middlewares/validator');

// All routes require instructor or super_instructor role
router.use(protect);
router.use(authorize('instructor', 'super_instructor'));

router.put('/teaching-points/today', validateTeachingPoint, instructorController.updateTodayTeachingPoints);
router.get('/teaching-points/today', instructorController.getTodayTeachingPoints);
router.get('/assignments/:assignmentId/submissions', instructorController.getSubmissions);

module.exports = router;
