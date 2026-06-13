const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');
const https = require('https');
const http = require('http');

// Configure multer — images only
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow image files — all other files go to Cloudflare R2
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed via this route. For videos, PPTs, and PDFs please use the /api/upload/file route.'), false);
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

/**
 * @desc   Download-proxy: fetches any URL server-side and streams it back
 *         with a proper Content-Disposition header so the browser saves
 *         the file with the original filename, bypassing CORS entirely.
 * @route  GET /api/upload/download?url=<encoded>&fileName=<encoded>
 * @access Private
 */
const downloadProxy = (req, res, next) => {
    const { url, fileName } = req.query;

    if (!url || !fileName) {
        return res.status(400).json({ success: false, message: 'url and fileName are required' });
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).json({ success: false, message: 'Invalid URL' });
    }

    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const request = protocol.get(url, (upstream) => {
        const contentType = upstream.headers['content-type'] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(fileName)}"`
        );
        if (upstream.headers['content-length']) {
            res.setHeader('Content-Length', upstream.headers['content-length']);
        }

        upstream.pipe(res);
    });

    request.on('error', (err) => {
        console.error('Download proxy error:', err.message);
        next(err);
    });
};

module.exports = {
    uploadFile,
    downloadProxy,
};
