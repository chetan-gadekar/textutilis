import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Box,
} from '@mui/material';
import FileUpload from '../../common/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AssignmentFormDialog = ({
  open,
  onClose,
  courses,
  selectedCourse,
  onCourseChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  onSubmit,
  submitting,
  editing,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Select Course *</InputLabel>
            <Select
              value={selectedCourse}
              onChange={onCourseChange}
              label="Select Course *"
              required
              disabled={editing} // Usually course shouldn't be changed during edit
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Assignment Title"
            value={title}
            onChange={onTitleChange}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={onDescriptionChange}
            multiline
            rows={4}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={onDueDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Assignment Attachments (PDF, DOC, EXCEL, CSV, etc.)
            </Typography>

            <FileUpload
              label="Select Files"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
              multiple
              onUploadSuccess={(url, name) => onAddAttachment(url, name)}
            />

            {attachments.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, bgcolor: '#fbfbfb' }}>
                <List dense>
                  {attachments.map((file, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => onRemoveAttachment(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AttachmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.fileName}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              You can upload multiple files including documents, spreadsheets (Excel/CSV), and presentations.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignmentFormDialog;
