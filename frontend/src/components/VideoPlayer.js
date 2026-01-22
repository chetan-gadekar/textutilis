import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import videoService from '../services/videoService';

const VideoPlayer = ({ videoId, onProgress, initialPosition = 0 }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set initial position if provided
    if (initialPosition > 0 && videoElement.readyState >= 2) {
      videoElement.currentTime = initialPosition * videoElement.duration;
    }

    // Handle progress updates
    const handleTimeUpdate = () => {
      if (videoElement.duration && onProgress) {
        const progress = videoElement.currentTime / videoElement.duration;
        onProgress(progress);
      }
    };

    // Update progress every 5 seconds
    progressIntervalRef.current = setInterval(() => {
      if (videoElement.duration && onProgress) {
        const progress = videoElement.currentTime / videoElement.duration;
        onProgress(progress);
      }
    }, 5000);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onProgress, video, initialPosition]);

  const fetchVideoDetails = async (id) => {
    try {
      setLoading(true);
      const response = await videoService.getVideo(id);
      setVideo(response.video);
      setError(null);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Alert severity="error">
        {error || 'Video not found'}
      </Alert>
    );
  }

  const isReady = video.status?.state === 'ready';
  const playbackUrl = video.playback?.hls || video.playback?.dash;

  return (
    <Box>
      {!isReady ? (
        <Alert severity="warning">
          <Typography variant="h6">Video is processing...</Typography>
          <Typography variant="body2">
            Status: {video.status?.state || 'Unknown'}
            {video.status?.pct && ` (${video.status.pct}% complete)`}
          </Typography>
        </Alert>
      ) : playbackUrl ? (
        <Box sx={{ width: '100%', bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
          <video
            ref={videoRef}
            controls
            controlsList="nodownload" // Prevents download option
            disablePictureInPicture
            style={{
              width: '100%',
              maxHeight: '70vh',
              display: 'block',
            }}
            poster={video.thumbnail || undefined}
            onLoadedMetadata={() => {
              // Set initial position when metadata is loaded
              if (videoRef.current && initialPosition > 0) {
                videoRef.current.currentTime = initialPosition * videoRef.current.duration;
              }
            }}
          >
            <source src={playbackUrl} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>
        </Box>
      ) : (
        <Alert severity="error">No playback URL available</Alert>
      )}
    </Box>
  );
};

export default VideoPlayer;
