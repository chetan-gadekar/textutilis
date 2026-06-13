const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } = require('../utils/r2Client');

function uuidv4() {
    return crypto.randomUUID();
}

// Allowed non-image MIME types → stored in lms_documents/
const DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream', // fallback — browsers sometimes report this for PPT/PPTX/etc.
];

// Extensions that are always allowed as documents (fallback when MIME is octet-stream)
const DOCUMENT_EXTENSIONS = [
    '.pdf', '.ppt', '.pptx', '.doc', '.docx',
    '.xls', '.xlsx', '.csv', '.txt', '.zip', '.rar',
];

/**
 * Determine whether a file is a document based on MIME + extension.
 */
const isAllowedDocument = (fileType, fileName) => {
    if (DOCUMENT_MIME_TYPES.includes(fileType)) return true;
    // Fallback: check file extension for known document types
    const ext = path.extname(fileName).toLowerCase();
    return DOCUMENT_EXTENSIONS.includes(ext);
};

/**
 * @desc   Generate a presigned PUT URL for a direct browser-to-R2 upload.
 *         Supports both videos (lms_videos/) and documents (lms_documents/).
 * @route  POST /api/upload/file
 * @body   { fileName, fileType }
 * @access Private (instructors + admin)
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

        if (!R2_PUBLIC_URL) {
            return res.status(500).json({
                success: false,
                message: 'R2 public URL not configured. Set CLOUDFLARE_R2_PUBLIC_URL in .env',
            });
        }

        // Determine folder based on mime type + extension fallback
        let folder;
        if (fileType.startsWith('video/')) {
            folder = 'lms_videos';
        } else if (isAllowedDocument(fileType, fileName)) {
            folder = 'lms_documents';
        } else {
            return res.status(400).json({
                success: false,
                message: `File type "${fileType}" is not allowed. Only videos and documents (PDF, PPT, Word, Excel) are accepted.`,
            });
        }

        // Generate unique key
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileKey = `${folder}/${uuidv4()}-${baseName}${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
            ChecksumAlgorithm: undefined,
        });

        console.log(`[R2 Upload] Generating presigned URL → Bucket: ${R2_BUCKET_NAME}, Key: ${fileKey}`);

        // Presigned URL valid for 6 hours to accommodate large files
        const presignedUrl = await getSignedUrl(r2Client, command, {
            expiresIn: 21600,
            unhoistableHeaders: new Set(['content-type']),
        });

        const publicUrl = `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${fileKey}`;

        res.json({
            success: true,
            data: {
                presignedUrl,
                fileKey,
                publicUrl,
                folder,
            },
        });
    } catch (error) {
        console.error('[R2 Upload] Presigned URL generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload URL',
            error: error.message,
        });
    }
};

/**
 * @desc   Confirm a completed R2 upload by verifying the object exists.
 * @route  POST /api/upload/file/confirm
 * @body   { fileKey, fileName }
 * @access Private (instructors + admin)
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
        console.error('[R2 Upload] Confirmation error:', error);

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
