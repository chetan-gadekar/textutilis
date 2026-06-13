const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const fileUploadController = require('../controllers/fileUploadController');
const { protect, authorize } = require('../middlewares/auth');

// ── Images only → Cloudinary ──────────────────────────────────────────────────
// POST /api/upload
router.post('/', protect, uploadController.uploadFile);

// ── Videos, PPT, PDF, Docs → Cloudflare R2 (presigned) ───────────────────────
// Step 1: Get presigned PUT URL for direct browser-to-R2 upload
// POST /api/upload/file
router.post('/file', protect, authorize('super_instructor', 'instructor', 'admin'), fileUploadController.getPresignedUrl);

// Step 2: Confirm upload completed
// POST /api/upload/file/confirm
router.post('/file/confirm', protect, authorize('super_instructor', 'instructor', 'admin'), fileUploadController.confirmUpload);

// ── Download proxy ────────────────────────────────────────────────────────────
// GET /api/upload/download?url=<encoded_url>&fileName=<encoded_filename>
router.get('/download', protect, uploadController.downloadProxy);

module.exports = router;
