const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('Only video files are allowed'), false);
        }
        cb(null, true);
    }
}).single('video');

const uploadVideo = (req, res) => {
    upload(req, res, async (err) => {
        // Handle multer errors
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        console.log(`Starting Cloudinary upload for: ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`);

        try {
            // Upload to Cloudinary using stream
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'lms_videos',
                    resource_type: 'video',
                    chunk_size: 6000000, // 6MB chunks
                    timeout: 120000 // 2 minute timeout
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Cloudinary upload failed',
                            error: error.message
                        });
                    }

                    console.log('Cloudinary upload successful:', result.public_id);

                    res.json({
                        success: true,
                        data: {
                            url: result.secure_url,
                            public_id: result.public_id,
                            fileName: req.file.originalname,
                            format: result.format,
                            duration: result.duration || 0,
                            size: result.bytes
                        }
                    });
                }
            );

            // Pipe the file buffer to Cloudinary
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

        } catch (error) {
            console.error('Video upload processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process video upload',
                error: error.message
            });
        }
    });
};

module.exports = {
    uploadVideo
};
