import React, { useState } from 'react';
import { Popover, Box, Typography, Button } from '@mui/material';
import LoadingButton from './LoadingButton';

const PopConfirm = ({ title, onConfirm, children, okText = "Yes", cancelText = "No" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
  };

  const handleConfirm = async (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'popconfirm-popover' : undefined;

  return (
    <>
      <span onClick={handleClick} style={{ display: 'inline-flex' }}>
        {children}
      </span>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 2,
            maxWidth: 250,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: '#37474F' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              size="small" 
              onClick={handleClose} 
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              {cancelText}
            </Button>
            <LoadingButton 
              size="small" 
              variant="contained" 
              color="error" 
              onClick={handleConfirm}
              loading={loading}
              sx={{ textTransform: 'none', borderRadius: 1 }}
            >
              {okText}
            </LoadingButton>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default PopConfirm;
