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
      if (videoId.startsWith('http')) {
        // Direct URL (e.g., Cloudinary)
        setVideo({
          playback: { hls: videoId, direct: videoId },
          status: { state: 'ready' },
          isDirectUrl: true
        });
        setLoading(false);
      } else {
        fetchVideoDetails(videoId);
      }
    }
  }, [videoId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      if (initialPosition > 0 && videoElement.duration) {
        videoElement.currentTime = initialPosition * videoElement.duration;
      }
    };

    // Handle progress updates
    const handleTimeUpdate = () => {
      if (videoElement.duration && onProgress) {
        const progress = videoElement.currentTime / videoElement.duration;
        onProgress(progress);
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Update progress every 5 seconds
    progressIntervalRef.current = setInterval(() => {
      if (videoElement.duration && onProgress) {
        const progress = videoElement.currentTime / videoElement.duration;
        onProgress(progress);
      }
    }, 5000);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
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

  const containerStyle = {
    width: '100%',
    aspectRatio: '16/9',
    maxHeight: '70vh',
    bgcolor: 'black',
    borderRadius: 1,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  if (loading) {
    return (
      <Box sx={containerStyle}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Box sx={containerStyle}>
        <Alert severity="error">
          {error || 'Video not found'}
        </Alert>
      </Box>
    );
  }

  const isReady = video.status?.state === 'ready';
  const playbackUrl = video.isDirectUrl ? video.playback.direct : (video.playback?.hls || video.playback?.dash);

  return (
    <Box sx={containerStyle}>
      {!isReady ? (
        <Alert severity="warning">
          <Typography variant="h6">Video is processing...</Typography>
          <Typography variant="body2">
            Status: {video.status?.state || 'Unknown'}
            {video.status?.pct && ` (${video.status.pct}% complete)`}
          </Typography>
        </Alert>
      ) : playbackUrl ? (
        <video
          ref={videoRef}
          controls
          controlsList="nodownload" // Prevents download option
          disablePictureInPicture
          preload="auto"
          playsInline
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '70vh',
            display: 'block',
            objectFit: 'contain',
            backgroundColor: 'black'
          }}
          poster={video.thumbnail || undefined}
        >
          <source src={playbackUrl} type={video.isDirectUrl ? "video/mp4" : "application/x-mpegURL"} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <Alert severity="error">No playback URL available</Alert>
      )}
    </Box>
  );
};

export default VideoPlayer;
