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
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg">
        {editing ? 'Edit Assignment' : 'Create Assignment'}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent className="font-poppins overflow-y-auto px-5 py-3" style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Select Course *</label>
              <select
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all disabled:opacity-50"
                value={selectedCourse}
                onChange={onCourseChange}
                required
                disabled={editing}
              >
                <option value="" disabled>Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Assignment Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
                value={title}
                onChange={onTitleChange}
                required
                placeholder="e.g. Midterm Report"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all resize-none"
                value={description}
                onChange={onDescriptionChange}
                required
                placeholder="Details about the assignment..."
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Due Date *</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
                value={dueDate}
                onChange={onDueDateChange}
                required
              />
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Assignment Attachments (PDF, DOC, EXCEL, CSV, etc.)</label>

              <FileUpload
                label="Select Files"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
                multiple
                onUploadSuccess={(url, name) => onAddAttachment(url, name)}
              />

              {attachments.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
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

              <p className="text-xs text-gray-500 mt-2">
                You can upload multiple files including documents, spreadsheets (Excel/CSV), and presentations.
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-3 px-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 text-sm bg-theme hover:bg-theme-dark text-white font-medium rounded-md shadow-sm transition-colors ml-2 disabled:opacity-50"
          >
            {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Assignment' : 'Create Assignment')}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignmentFormDialog;
