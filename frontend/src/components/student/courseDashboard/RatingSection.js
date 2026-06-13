import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const RatingSection = ({ contentId }) => {
  const [note, setNote] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Load note from localStorage when contentId changes
  useEffect(() => {
    if (contentId) {
      const savedNote = localStorage.getItem(`note_${contentId}`);
      setNote(savedNote || '');
    }
  }, [contentId]);

  const handleSave = () => {
    if (contentId) {
      localStorage.setItem(`note_${contentId}`, note);
      setShowToast(true);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: '#37474F', 
            fontFamily: 'Poppins',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Lecture Notes
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          placeholder="Jot down key points, questions, or ideas from this lecture..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              bgcolor: '#FAFAFA',
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#6A4E9E',
              '&:hover': {
                bgcolor: '#5A3E8E',
              }
            }}
          >
            Save Note
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={showToast} 
        autoHideDuration={3000} 
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          Notes saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RatingSection;
