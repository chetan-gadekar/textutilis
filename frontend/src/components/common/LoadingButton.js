import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';

/**
 * A dynamic, reusable LoadingButton component.
 * Standardizes button behavior for async operations across the app.
 * 
 * @param {boolean} loading - Whether the button is in a loading state. 
 * @param {boolean} disabled - Whether the button is disabled (overrides loading logic).
 * @param {React.ReactNode} children - Button label/content.
 * @param {string} loadingText - Text to show during loading (optional).
 * @param {string} variant - MUI button variant ('contained', 'outlined', 'text').
 * @param {string} color - MUI button color ('primary', 'secondary', 'error', etc.).
 * @param {object} sx - MUI system styles.
 * @param {string} className - Optional tailwind classes for custom styling.
 */
const LoadingButton = ({ 
  loading, 
  disabled, 
  children, 
  loadingText, 
  variant = 'contained', 
  color = 'primary', 
  sx = {}, 
  className = '',
  ...props 
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={loading || disabled}
      className={className}
      sx={{
        position: 'relative',
        textTransform: 'none',
        fontWeight: 600,
        ...sx
      }}
      {...props}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <CircularProgress size={20} color="inherit" thickness={5} />
          {loadingText && (
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {loadingText}
            </span>
          )}
        </Box>
      )}
    </Button>
  );
};

export default LoadingButton;
