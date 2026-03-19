const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } = require('../utils/r2Client');

/**
 * Generate a presigned PUT URL for direct browser-to-R2 upload.
 * POST /api/upload/video
 * Body: { fileName, fileType }
 * Returns: { presignedUrl, fileKey, publicUrl }
 */
const getPresignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({
                success: false,
                message: 'fileName and fileType are required',
            });
        }

        // Validate video mime type
        if (!fileType.startsWith('video/')) {
            return res.status(400).json({
                success: false,
                message: 'Only video files are allowed',
            });
        }

        if (!R2_PUBLIC_URL) {
            return res.status(500).json({
                success: false,
                message: 'R2 public URL not configured. Set CLOUDFLARE_R2_PUBLIC_URL in .env',
            });
        }

        // Generate unique key: lms_videos/<uuid>-<sanitized-filename>
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileKey = `lms_videos/${uuidv4()}-${baseName}${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
            // Explicitly disable checksums which can cause 401/403 on R2 with some SDK versions
            ChecksumAlgorithm: undefined,
        });

        console.log(`Generating presigned URL for Bucket: ${R2_BUCKET_NAME}, Key: ${fileKey}`);

        // Presigned URL valid for 30 minutes
        const presignedUrl = await getSignedUrl(r2Client, command, { 
            expiresIn: 1800,
            unhoistableHeaders: new Set(['content-type']),
        });

        const publicUrl = `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${fileKey}`;

        res.json({
            success: true,
            data: {
                presignedUrl,
                fileKey,
                publicUrl,
            },
        });
    } catch (error) {
        console.error('Presigned URL generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload URL',
            error: error.message,
        });
    }
};

/**
 * Confirm that an upload to R2 completed successfully.
 * POST /api/upload/video/confirm
 * Body: { fileKey, fileName }
 * Returns: { url, fileName, fileKey }
 */
const confirmUpload = async (req, res) => {
    try {
        const { fileKey, fileName } = req.body;

        if (!fileKey) {
            return res.status(400).json({
                success: false,
                message: 'fileKey is required',
            });
        }

        // Check that the object actually exists in R2
        const headCommand = new HeadObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
        });

        const headResult = await r2Client.send(headCommand);

        const publicUrl = `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${fileKey}`;

        res.json({
            success: true,
            data: {
                url: publicUrl,
                fileName: fileName || fileKey,
                fileKey,
                size: headResult.ContentLength,
                contentType: headResult.ContentType,
            },
        });
    } catch (error) {
        console.error('Upload confirmation error:', error);

        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found. The file may not have been uploaded yet.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to confirm upload',
            error: error.message,
        });
    }
};

module.exports = {
    getPresignedUrl,
    confirmUpload,
};
