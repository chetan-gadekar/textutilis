const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    console.warn('Cloudflare R2 credentials not fully configured. Set CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_PUBLIC_URL in .env');
}

const r2Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// Public URL for serving files — if R2 bucket has public access enabled,
// files are accessible at: https://<public-domain>/<key>
// The user should set this to their R2 public bucket URL or custom domain
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

/**
 * Generate a signed GET URL for a file in R2.
 * @param {string} fileKey - The key of the file in the bucket.
 * @param {number} expiresIn - Expiration time in seconds (default 10 seconds for testing).
 */
const getSignedGetUrl = async (fileKey, expiresIn = 10) => {
    try {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
        });

        return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
        console.error('Error generating signed GET URL:', error);
        return null;
    }
};

/**
 * Helper to strip S3/R2 signature parameters from a URL, 
 * leaving only the static base URL for storage in DB.
 */
const stripR2Signature = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('r2.cloudflarestorage.com')) return url;
    
    try {
        const urlObj = new URL(url);
        // Remove all X-Amz-* parameters
        const params = urlObj.searchParams;
        const keysToRemove = [];
        for (const key of params.keys()) {
            if (key.startsWith('X-Amz-')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => params.delete(key));
        return urlObj.toString().split('?')[0]; // Return base URL without trailing ?
    } catch (err) {
        return url;
    }
};

/**
 * Recursively search for R2 URLs in an object/array and sign them.
 */
const signR2Urls = async (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = await signR2Urls(data[i]);
        }
        return data;
    }

    if (typeof data === 'object') {
        const isContent = data.contentType === 'video' && data.contentData;
        if (isContent && data.contentData.includes('r2.cloudflarestorage.com')) {
            const url = stripR2Signature(data.contentData);
            const match = url.match(/lms_videos\/.*$/);
            if (match) {
                const fileKey = match[0];
                console.log(`Signing R2 URL for key: ${fileKey}`);
                const signedUrl = await getSignedGetUrl(fileKey);
                if (signedUrl) {
                    data.contentData = signedUrl;
                    console.log(`Successfully signed URL for: ${fileKey}`);
                } else {
                    console.error(`Failed to sign URL for: ${fileKey}`);
                }
            } else {
                console.warn(`Could not extract key from R2 URL: ${url}`);
            }
        }

        // Handle generic keys like fileUrl, url, contentData, attachments
        for (const key in data) {
            const value = data[key];
            if (typeof value === 'string' && value.includes('r2.cloudflarestorage.com')) {
                const url = stripR2Signature(value);
                const match = url.match(/lms_videos\/.*$/);
                if (match) {
                    const fileKey = match[0];
                    console.log(`Signing R2 URL in field ${key} for key: ${fileKey}`);
                    const signedUrl = await getSignedGetUrl(fileKey);
                    if (signedUrl) data[key] = signedUrl;
                }
            } else if (typeof value === 'object' && value !== null) {
                data[key] = await signR2Urls(value);
            }
        }
    }

    return data;
};

module.exports = {
    r2Client,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL,
    getSignedGetUrl,
    stripR2Signature,
    signR2Urls,
};
