const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
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

topicSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

topicSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model('Topic', topicSchema);
