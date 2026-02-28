import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  Divider,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentListItem from './ContentListItem';
import MenuIcon from '@mui/icons-material/Menu';

const PAPER_SX = {
  mb: 1,
  borderRadius: 1,
  borderColor: '#e0e0e0',
  overflow: 'hidden',
  boxShadow: 'none'
};

const HEADER_BOX_SX = {
  display: 'flex',
  alignItems: 'center',
  p: 2,
  bgcolor: '#fff',
  gap: 2
};

const TopicCard = ({
  topic,
  index,
  module,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  getContentIcon,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Paper variant="outlined" sx={PAPER_SX}>
      <Box sx={HEADER_BOX_SX}>
        <MenuIcon sx={{ color: '#9e9e9e', cursor: 'grab' }} />

        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500, color: '#424242' }}>
          Lesson {index + 1}: {topic.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onEditTopic(module, topic)}
            sx={{ color: '#757575' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDeleteTopic(topic._id)}
            sx={{ color: '#757575' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Expandable Content Area */}
      <Collapse in={true}>
        <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
          {topic.description && (
            <Typography variant="caption" color="text.secondary" paragraph>
              {topic.description}
            </Typography>
          )}

          <Box sx={{ mb: 1 }}>
            {topic.content && topic.content.length > 0 ? (
              <List disablePadding>
                {topic.content.map((content, idx) => (
                  <React.Fragment key={content._id}>
                    <ContentListItem
                      content={content}
                      topic={topic}
                      onEdit={() => onEditContent(topic, content)}
                      onDelete={() => onDeleteContent(content._id)}
                      getContentIcon={getContentIcon}
                    />
                    {idx < topic.content.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : null}
          </Box>

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onAddContent(topic)}
            sx={{ textTransform: 'none', color: '#1976d2', fontWeight: 500 }}
          >
            Add Content to Lesson
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TopicCard;
