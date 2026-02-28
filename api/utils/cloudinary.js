const cloudinary = require('cloudinary').v2;

// Cloudinary URL should be in format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
} else {
    console.warn('CLOUDINARY_URL not found in environment variables');
}

module.exports = cloudinary;
