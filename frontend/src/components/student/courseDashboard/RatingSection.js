import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';

const RatingSection = () => {
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="text" sx={{ textTransform: 'none' }}>
            Attachment
          </Button>
          <Button variant="text" sx={{ textTransform: 'none' }}>
            Notes
          </Button>
          <Button
            variant="text"
            sx={{
              textTransform: 'none',
              color: 'primary.main',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            Rating
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Rate your mentor
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Typography key={star} sx={{ fontSize: '2rem', color: '#e0e0e0', cursor: 'pointer' }}>
              ★
            </Typography>
          ))}
        </Box>
      </Paper>
    </>
  );
};

export default RatingSection;
