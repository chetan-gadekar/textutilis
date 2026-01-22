const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TopicContent',
    required: [true, 'Content ID is required'],
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  videoPosition: {
    type: Number,
    default: 0, // in seconds
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

progressSchema.index({ studentId: 1, contentId: 1 }, { unique: true });
progressSchema.index({ studentId: 1, courseId: 1 });
progressSchema.index({ studentId: 1, moduleId: 1 });
progressSchema.index({ studentId: 1, topicId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
