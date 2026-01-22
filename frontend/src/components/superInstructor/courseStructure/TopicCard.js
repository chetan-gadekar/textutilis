import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentListItem from './ContentListItem';

const TopicCard = ({
  topic,
  module,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  getContentIcon,
}) => {
  return (
    <Paper key={topic._id} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {topic.title}
        </Typography>
        <Box>
          <IconButton size="small" onClick={() => onEditTopic(module, topic)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDeleteTopic(topic._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      {topic.description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {topic.description}
        </Typography>
      )}

      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" startIcon={<AddIcon />} onClick={() => onAddContent(topic)}>
          Add Content
        </Button>
      </Box>

      {topic.content && topic.content.length > 0 ? (
        <List>
          {topic.content.map((content) => (
            <ContentListItem
              key={content._id}
              content={content}
              topic={topic}
              onEdit={() => onEditContent(topic, content)}
              onDelete={() => onDeleteContent(content._id)}
              getContentIcon={getContentIcon}
            />
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
          No content yet. Add content to this topic.
        </Typography>
      )}
    </Paper>
  );
};

export default TopicCard;
