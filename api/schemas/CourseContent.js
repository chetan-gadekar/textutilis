const mongoose = require('mongoose');

const courseContentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  moduleTitle: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  moduleOrder: {
    type: Number,
    required: true,
    default: 0,
  },
  contentType: {
    type: String,
    enum: ['video', 'ppt', 'text'],
    required: [true, 'Content type is required'],
  },
  contentData: {
    // For videos: Cloudflare Stream UID
    // For PPTs: File URL or Cloudflare Stream UID
    // For text: Text content
    type: String,
    required: [true, 'Content data is required'],
  },
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // in seconds for videos
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

courseContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

courseContentSchema.index({ courseId: 1, moduleOrder: 1 });

module.exports = mongoose.model('CourseContent', courseContentSchema);
