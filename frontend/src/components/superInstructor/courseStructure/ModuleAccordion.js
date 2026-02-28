import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TopicCard from './TopicCard';

const ACTION_BUTTON_SX = {
  borderColor: '#1976d2',
  color: '#1976d2',
  textTransform: 'none',
  fontWeight: 600,
  bgcolor: '#fff',
  '&:hover': { bgcolor: '#f0f7ff' }
};

const ADD_ICON_BOX = (
  <Box sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: '4px', p: '2px', display: 'flex' }}>
    <AddIcon sx={{ fontSize: 14 }} />
  </Box>
);

const ModuleAccordion = ({
  module,
  index,
  onEditModule,
  onDeleteModule,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  getContentIcon,
  expanded,
  onChange,
}) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      key={module._id}
      sx={{
        mb: 2,
        borderRadius: '8px !important',
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
        bgcolor: '#f8f9fa',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { margin: '0 0 16px 0' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#1976d2' }} />}
        sx={{
          bgcolor: '#f8f9fa',
          minHeight: 56,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            my: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#333' }}>
            {index + 1}. {module.title}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onEditModule(module)}
              sx={{ color: 'text.secondary' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDeleteModule(module._id)}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
        {module.description && (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, ml: 4 }}>
            {module.description}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          {module.topics && module.topics.length > 0 ? (
            <List disablePadding>
              {module.topics.map((topic, i) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  index={i}
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
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No topics yet.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons Row */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', userSelect: 'none' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAddTopic(module)}
            startIcon={ADD_ICON_BOX}
            sx={ACTION_BUTTON_SX}
          >
            Lesson
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={ADD_ICON_BOX}
            sx={ACTION_BUTTON_SX}
          >
            Quiz
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={ADD_ICON_BOX}
            sx={ACTION_BUTTON_SX}
          >
            Assignments
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideoCameraBackIcon />}
            sx={ACTION_BUTTON_SX}
          >
            Zoom Live Lesson
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            sx={ACTION_BUTTON_SX}
          >
            Import Quiz
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ModuleAccordion;
