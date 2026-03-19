const express = require('express');
const router = express.Router();
const videoUploadController = require('../controllers/videoUploadController');
const { protect, authorize } = require('../middlewares/auth');

// Get presigned URL for direct-to-R2 video upload
// POST /api/upload/video
router.post('/', protect, authorize('super_instructor', 'instructor', 'admin'), videoUploadController.getPresignedUrl);

// Confirm video upload completed
// POST /api/upload/video/confirm
router.post('/confirm', protect, authorize('super_instructor', 'instructor', 'admin'), videoUploadController.confirmUpload);

module.exports = router;
