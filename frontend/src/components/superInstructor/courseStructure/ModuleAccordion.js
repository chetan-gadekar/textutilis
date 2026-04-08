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
  Tooltip,
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
  textTransform: 'none',
  fontWeight: 600,
  bgcolor: 'background.paper',
  borderColor: 'divider',
  color: 'text.secondary',
  '&:hover': {
    borderColor: 'primary.main',
    color: 'primary.main',
    bgcolor: 'action.hover'
  }
};

const ADD_ICON_BOX = (
  <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, p: 0.5, display: 'flex' }}>
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
  onAddAssignment,
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
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { margin: '0 0 16px 0', borderColor: 'primary.main' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon color="primary" />}
        sx={{
          bgcolor: 'grey.50',
          minHeight: 56,
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            my: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <DragIndicatorIcon sx={{ color: 'action.active', cursor: 'grab' }} />
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {index + 1}. {module.title}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Module">
              <IconButton
                size="small"
                onClick={() => onEditModule(module)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Module">
              <IconButton
                size="small"
                onClick={() => onDeleteModule(module._id)}
                sx={{ color: 'text.secondary' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
            onClick={() => onAddAssignment && onAddAssignment(module)}
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
