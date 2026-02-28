const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Reject video files
        if (file.mimetype.startsWith('video/')) {
            return cb(new Error('Video files are not allowed in this upload route'), false);
        }
        cb(null, true);
    }
}).single('file');

const uploadFile = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        try {
            // Create a stream to upload to Cloudinary
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'lms_uploads',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error });
                    }
                    res.json({
                        success: true,
                        data: {
                            url: result.secure_url,
                            fileName: req.file.originalname,
                            format: result.format,
                            size: result.bytes
                        }
                    });
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        } catch (error) {
            next(error);
        }
    });
};

module.exports = {
    uploadFile
};
