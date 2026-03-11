const mongoose = require('mongoose');

const assessmentFields = {
  problemIdentification: [{ type: Number, min: 1, max: 5 }],
  potentialSolution: [{ type: Number, min: 1, max: 5 }],
  detailing: [{ type: Number, min: 1, max: 5 }],
  implementation: [{ type: Number, min: 1, max: 5 }],
  problemSynthesizing: [{ type: Number, min: 1, max: 5 }],
  punctuality: [{ type: Number, min: 1, max: 5 }],
};

const performanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  selfEvaluation: {
    ...assessmentFields,
    submittedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  instructorAssessment: {
    ...assessmentFields,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: { type: Date, default: Date.now },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

performanceSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

performanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.isModified('selfEvaluation')) {
    this.selfEvaluation.updatedAt = Date.now();
  }
  if (this.isModified('instructorAssessment')) {
    this.instructorAssessment.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Performance', performanceSchema);
