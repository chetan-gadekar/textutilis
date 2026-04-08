import React, { useState, useRef } from 'react';
import axios from 'axios';
import notify from '../utils/notify';

const UploadVideo = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoName, setVideoName] = useState('');
  
  const [uploadStats, setUploadStats] = useState({ loadedMB: 0, totalMB: 0, speedMBps: 0 });
  const startTimeRef = useRef(Date.now());

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        notify.error('Please select a valid video file');
        return;
      }
      // Check file size (3GB limit)
      if (selectedFile.size > 3 * 1024 * 1024 * 1024) {
        notify.error('File size must be less than 3GB');
        return;
      }
      setFile(selectedFile);
      if (!videoName) {
        setVideoName(selectedFile.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      notify.error('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStats({ loadedMB: 0, totalMB: 0, speedMBps: 0 });
    startTimeRef.current = Date.now();

    const formData = new FormData();
    formData.append('video', file);
    if (videoName) {
      formData.append('name', videoName);
    }

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          
          const now = Date.now();
          const elapsedTime = (now - startTimeRef.current) / 1000; // in seconds
          
          let currentSpeedMBps = "0.00";
          if (elapsedTime > 0) {
            const speedBytesPerSec = progressEvent.loaded / elapsedTime;
            currentSpeedMBps = (speedBytesPerSec / (1024 * 1024)).toFixed(2);
          }
          
          setUploadStats({
            loadedMB: (progressEvent.loaded / (1024 * 1024)).toFixed(2),
            totalMB: (progressEvent.total / (1024 * 1024)).toFixed(2),
            speedMBps: currentSpeedMBps
          });
        },
      });

      notify.success('Video uploaded successfully!');
      setFile(null);
      setVideoName('');
      setUploadProgress(0);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.video);
      }
    } catch (error) {
      console.error('Upload error:', error);
      notify.error(
        error.response?.data?.error || 
        error.response?.data?.details?.errors?.[0]?.message ||
        'Failed to upload video. Please check your Cloudflare credentials.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Upload Video to Cloudflare</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="videoName" className="form-label">
                  Video Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="videoName"
                  value={videoName}
                  onChange={(e) => setVideoName(e.target.value)}
                  placeholder="Enter video name"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="videoFile" className="form-label">
                  Select Video File
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="videoFile"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {file && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </small>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mb-3">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2 text-muted small">
                    <span>
                      {uploadStats.loadedMB} MB / {uploadStats.totalMB} MB
                    </span>
                    <span>
                      {uploadStats.speedMBps} MB/s
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary w-100"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>

              <div className="mt-3">
                <small className="text-muted">
                  <strong>Note:</strong> Make sure to configure your Cloudflare credentials in the .env file
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
