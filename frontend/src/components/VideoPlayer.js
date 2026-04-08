import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import notify from '../utils/notify';
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
      notify.error('Failed to load video details');
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
      <Box sx={{ ...containerStyle, flexDirection: 'column', gap: 2, p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
          {error || 'Video not found'}
        </Typography>
        <Typography variant="body2" color="gray">
          Please check the video source or try again later.
        </Typography>
      </Box>
    );
  }

  const isReady = video.status?.state === 'ready';
  const playbackUrl = video.isDirectUrl ? video.playback.direct : (video.playback?.hls || video.playback?.dash);

  return (
    <Box sx={containerStyle}>
      {!isReady ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
          <CircularProgress size={48} sx={{ mb: 3, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Video is processing...</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Status: {video.status?.state || 'Unknown'}
            {video.status?.pct ? ` (${video.status.pct}% complete)` : ''}
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic', opacity: 0.5 }}>
            This usually takes a few minutes depending on file size.
          </Typography>
        </Box>
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
        <Typography color="error" variant="body2">No playback URL available</Typography>
      )}
    </Box>
  );
};

export default VideoPlayer;
