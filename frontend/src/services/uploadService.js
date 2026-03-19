import api from './api';

const uploadService = {
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
     * Upload video to Cloudflare R2 with real-time progress tracking.
     * Flow:
     *   1. Get presigned URL from backend
     *   2. Upload directly to R2 with progress callback
     *   3. Confirm upload with backend to get public URL
     *
     * @param {File} file - Video file to upload
     * @param {Function} onProgress - Callback with progress percentage (0-100)
     * @returns {Promise<Object>} Upload result with url, fileName, etc.
     */
    uploadVideo: async (file, onProgress) => {
        // Step 1: Get presigned URL from backend
        const presignedResponse = await api.post('/upload/video', {
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
                    onProgress(percentage);
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
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });

        // Step 3: Confirm upload with backend
        const confirmResponse = await api.post('/upload/video/confirm', {
            fileKey,
            fileName: file.name,
        });

        if (!confirmResponse.data.success) {
            throw new Error(confirmResponse.data.message || 'Failed to confirm upload');
        }

        return confirmResponse.data;
    }
};

export default uploadService;
