import api from './api';

const uploadService = {
    /**
     * Upload an IMAGE to Cloudinary.
     * Use this for profile photos, course banners, thumbnails, etc.
     * @param {File} file - Image file
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Upload a VIDEO to Cloudflare R2 with real-time progress tracking.
     * Flow: Get presigned URL → Upload directly to R2 → Confirm with backend
     * @param {File} file - Video file
     * @param {Function} onProgress - Callback with progress percentage (0-100)
     */
    uploadVideo: async (file, onProgress) => {
        // Step 1: Get presigned URL from backend
        const presignedResponse = await api.post('/upload/file', {
            fileName: file.name,
            fileType: file.type,
        });

        if (!presignedResponse.data.success) {
            throw new Error(presignedResponse.data.message || 'Failed to get upload URL');
        }

        const { presignedUrl, fileKey } = presignedResponse.data.data;

        // Step 2: Upload directly to R2 using XMLHttpRequest for progress tracking
        await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    // Scale XHR progress to 0-95% so the last 5% represents backend confirmation
                    const percentage = Math.round((event.loaded / event.total) * 95);
                    onProgress(percentage, event.loaded, event.total);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload. If you are uploading a very large file, please ensure your internet connection is stable.'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });

        // Step 3: Confirm upload with backend
        const confirmResponse = await api.post('/upload/file/confirm', {
            fileKey,
            fileName: file.name,
        });

        if (!confirmResponse.data.success) {
            throw new Error(confirmResponse.data.message || 'Failed to confirm upload');
        }

        if (onProgress) onProgress(100);
        return confirmResponse.data;
    },

    /**
     * Upload a DOCUMENT (PDF, PPT, Word, Excel, etc.) to Cloudflare R2.
     * Uses the same presigned PUT flow as videos.
     * @param {File} file - Document file
     * @param {Function} onProgress - Optional progress callback (0-100)
     */
    uploadDocument: async (file, onProgress) => {
        // Step 1: Get presigned URL from backend
        const presignedResponse = await api.post('/upload/file', {
            fileName: file.name,
            fileType: file.type,
        });

        if (!presignedResponse.data.success) {
            throw new Error(presignedResponse.data.message || 'Failed to get upload URL');
        }

        const { presignedUrl, fileKey } = presignedResponse.data.data;

        // Step 2: Upload directly to R2
        await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentage = Math.round((event.loaded / event.total) * 95);
                    onProgress(percentage, event.loaded, event.total);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload.'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });

        // Step 3: Confirm upload with backend
        const confirmResponse = await api.post('/upload/file/confirm', {
            fileKey,
            fileName: file.name,
        });

        if (!confirmResponse.data.success) {
            throw new Error(confirmResponse.data.message || 'Failed to confirm upload');
        }

        if (onProgress) onProgress(100);
        return confirmResponse.data;
    },
};

export default uploadService;
