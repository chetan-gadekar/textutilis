import React from 'react';
import {
  ListItem,
  Box,
  ListItemText,
  IconButton,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CONTENT_BOX_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mr: 2
};

const CHIP_SX = { mr: 1 };

const ContentListItem = ({ content, onEdit, onDelete, getContentIcon }) => {
  return (
    <ListItem
      key={content._id}
      sx={{
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
        mb: 0.5
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Content">
            <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Content">
            <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <Box sx={CONTENT_BOX_SX}>
        {getContentIcon(content.contentType)}
        <ListItemText
          primary={content.title}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Chip
                label={content.contentType.toUpperCase()}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mr: 1, height: 20, fontSize: '0.7rem' }}
              />
              {content.contentType === 'video' && content.duration && (
                <Typography variant="caption" color="text.secondary">
                  {Math.round(content.duration / 60)} min
                </Typography>
              )}
            </Box>
          }
        />
      </Box>
    </ListItem >
  );
};

export default ContentListItem;
