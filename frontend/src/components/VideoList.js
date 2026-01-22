import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VideoList = ({ onSelectVideo }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/videos');
      setVideos(response.data.videos || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
      toast.error('Failed to load videos. Please check your Cloudflare credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Your Videos</h3>
            <button className="btn btn-primary" onClick={fetchVideos}>
              Refresh
            </button>
          </div>
          
          {videos.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No videos found. Upload a video to get started!
            </div>
          ) : (
            <div className="row">
              {videos.map((video) => (
                <div key={video.uid} className="col-md-4 mb-4">
                  <div className="card shadow-sm">
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        className="card-img-top"
                        alt={video.meta?.name || 'Video thumbnail'}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">
                        {video.meta?.name || `Video ${video.uid.substring(0, 8)}`}
                      </h5>
                      <p className="card-text">
                        <small className="text-muted">
                          Status: <span className={`badge ${
                            video.status?.state === 'ready' ? 'bg-success' : 'bg-warning'
                          }`}>
                            {video.status?.state || 'Unknown'}
                          </span>
                        </small>
                      </p>
                      {video.status?.state === 'ready' && (
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => {
                            if (onSelectVideo) {
                              onSelectVideo(video.uid);
                            } else {
                              navigate(`/watch/${video.uid}`);
                            }
                          }}
                        >
                          Watch Video
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VideoList;
