const mongoose = require('mongoose');

const topicContentSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
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
  order: {
    type: Number,
    required: true,
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

topicContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

topicContentSchema.index({ topicId: 1, order: 1 });

module.exports = mongoose.model('TopicContent', topicContentSchema);
