const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    unique: true,
  },
  assignmentRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  caseStudyRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  assignmentCount: {
    type: Number,
    default: 0,
  },
  caseStudyCount: {
    type: Number,
    default: 0,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

performanceSchema.pre('save', function (next) {
  // Calculate total rating (average of assignment and case study ratings)
  this.totalRating = ((this.assignmentRating + this.caseStudyRating) / 2).toFixed(2);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Performance', performanceSchema);
