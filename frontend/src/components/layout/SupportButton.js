import React from 'react';
import { Fab } from '@mui/material';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';

const SupportButton = () => {
  return (
    <Fab
      color="error"
      aria-label="support"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        bgcolor: '#ff5722',
        '&:hover': {
          bgcolor: '#e64a19',
        },
      }}
      onClick={() => {
        // Handle support click - could open a dialog or navigate
        window.open('mailto:support@lms.com', '_blank');
      }}
    >
      <HeadsetMicIcon />
    </Fab>
  );
};

export default SupportButton;
