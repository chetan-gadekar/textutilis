const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { protect } = require('../middlewares/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Cloudflare Stream API configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_STREAM_API = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

// Upload video to Cloudflare Stream
router.post('/upload', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return res.status(500).json({
        error: 'Cloudflare credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env file',
      });
    }

    // Create form data for Cloudflare Stream API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Optional: Add metadata
    if (req.body.name) {
      formData.append('meta', JSON.stringify({ name: req.body.name }));
    }

    // Upload to Cloudflare Stream
    const response = await axios.post(CLOUDFLARE_STREAM_API, formData, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json({
      success: true,
      video: {
        uid: response.data.result.uid,
        playback: response.data.result.playback,
        status: response.data.result.status,
        meta: response.data.result.meta,
      },
    });
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to upload video',
      details: error.response?.data || error.message,
    });
  }
});

// Get video details
router.get('/:videoId', protect, async (req, res) => {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return res.status(500).json({
        error: 'Cloudflare credentials not configured',
      });
    }

    const response = await axios.get(`${CLOUDFLARE_STREAM_API}/${req.params.videoId}`, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    res.json({
      success: true,
      video: response.data.result,
    });
  } catch (error) {
    console.error('Get video error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get video details',
      details: error.response?.data || error.message,
    });
  }
});

// List all videos
router.get('/', protect, async (req, res) => {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return res.status(500).json({
        error: 'Cloudflare credentials not configured',
      });
    }

    const response = await axios.get(CLOUDFLARE_STREAM_API, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      params: {
        page: req.query.page || 1,
        per_page: req.query.per_page || 20,
      },
    });

    res.json({
      success: true,
      videos: response.data.result,
      pagination: response.data.result_info,
    });
  } catch (error) {
    console.error('List videos error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to list videos',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
