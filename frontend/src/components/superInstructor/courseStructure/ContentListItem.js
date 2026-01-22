import React from 'react';
import {
  ListItem,
  Box,
  ListItemText,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ContentListItem = ({ content, onEdit, onDelete, getContentIcon }) => {
  return (
    <ListItem
      key={content._id}
      secondaryAction={
        <Box>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        {getContentIcon(content.contentType)}
        <ListItemText
          primary={content.title}
          secondary={
            <Box>
              <Chip
                label={content.contentType.toUpperCase()}
                size="small"
                sx={{ mr: 1 }}
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
    </ListItem>
  );
};

export default ContentListItem;
