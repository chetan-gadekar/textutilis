import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  List,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TopicCard from './TopicCard';

const ModuleAccordion = ({
  module,
  onEditModule,
  onDeleteModule,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  getContentIcon,
}) => {
  return (
    <Accordion key={module._id} defaultExpanded={module.order === 0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="h6">{module.title}</Typography>
          <Chip label={`${module.topics?.length || 0} Topics`} size="small" />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEditModule(module);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteModule(module._id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {module.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {module.description}
          </Typography>
        )}

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" startIcon={<AddIcon />} onClick={() => onAddTopic(module)}>
            Add Topic
          </Button>
        </Box>

        {module.topics && module.topics.length > 0 ? (
          <List>
            {module.topics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                module={module}
                onEditTopic={onEditTopic}
                onDeleteTopic={onDeleteTopic}
                onAddContent={onAddContent}
                onEditContent={onEditContent}
                onDeleteContent={onDeleteContent}
                getContentIcon={getContentIcon}
              />
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No topics yet. Add a topic to this module.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ModuleAccordion;
