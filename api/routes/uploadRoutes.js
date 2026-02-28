const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');

// Generic upload route
router.post('/', protect, uploadController.uploadFile);

module.exports = router;
