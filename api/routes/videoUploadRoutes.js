const express = require('express');
const router = express.Router();
const videoUploadController = require('../controllers/videoUploadController');
const { protect, authorize } = require('../middlewares/auth');

// Video upload route - restricted to instructors/admins
// POST /api/upload/video
router.post('/', protect, authorize('super_instructor', 'instructor', 'admin'), videoUploadController.uploadVideo);

module.exports = router;
