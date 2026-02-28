import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DescriptionIcon from '@mui/icons-material/Description';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const ModuleDialog = ({ open, onClose, module, formData, onFormChange, onSave }) => {
  const isFormValid = formData?.title && formData.title.trim() !== '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            bgcolor: '#e3f2fd',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GridViewIcon sx={{ color: '#1976d2' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {module ? 'Edit Module' : 'Create New Module'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a new section to your course
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField
            label="Module Title *"
            fullWidth
            placeholder="e.g., Introduction to Algorithms"
            value={formData?.title || ''}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextFieldsIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Description *"
            fullWidth
            multiline
            rows={3}
            placeholder="Briefly describe what students will learn in this module..."
            value={formData?.description || ''}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <DescriptionIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Sort Order *"
            type="number"
            fullWidth
            value={formData?.order || 0}
            onChange={(e) => onFormChange({ ...formData, order: parseInt(e.target.value) || 0 })}
            helperText="Determines the position in the list"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500, px: 2 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!isFormValid}
          startIcon={<SaveIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            borderRadius: 1.5,
            bgcolor: '#0288d1',
            '&:hover': { bgcolor: '#01579b' },
          }}
        >
          {module ? 'Update Module' : 'Create Module'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleDialog;
