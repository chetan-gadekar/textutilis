import api from '../services/api';

/**
 * Downloads any file (Cloudinary raw/image/video, R2, etc.) with the correct filename.
 *
 * Strategy: calls our backend proxy endpoint (GET /api/upload/download) which fetches
 * the file server-side and streams it back with Content-Disposition: attachment.
 * This bypasses all CORS restrictions and works for every file type.
 *
 * Fallback: if the proxy fails, opens the URL in a new tab.
 *
 * @param {string} url       - The file URL to download
 * @param {string} fileName  - The filename to save as (e.g. "report.docx")
 */
export const downloadFile = async (url, fileName) => {
  if (!url || !fileName) return;

  try {
    // Request via our authenticated backend proxy as a blob
    const response = await api.get('/upload/download', {
      params: { url, fileName },
      responseType: 'blob',
    });

    // Build a temporary object URL from the blob
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });
    const blobUrl = URL.createObjectURL(blob);

    // Trigger synthetic download with correct filename
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Release memory after a short delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.warn('Proxy download failed, opening in new tab:', err.message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
