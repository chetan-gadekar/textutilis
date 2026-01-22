const Performance = require('../schemas/Performance');

// Get performance by student
const getPerformanceByStudent = async (studentId) => {
  let performance = await Performance.findOne({ studentId });
  
  if (!performance) {
    // Create default performance record
    performance = await Performance.create({ studentId });
  }
  
  return performance;
};

// Update performance
const updatePerformance = async (studentId, updateData, updatedBy) => {
  const { assignmentRating, caseStudyRating, assignmentCount, caseStudyCount } = updateData;

  const performance = await Performance.findOneAndUpdate(
    { studentId },
    {
      assignmentRating: assignmentRating !== undefined ? assignmentRating : undefined,
      caseStudyRating: caseStudyRating !== undefined ? caseStudyRating : undefined,
      assignmentCount: assignmentCount !== undefined ? assignmentCount : undefined,
      caseStudyCount: caseStudyCount !== undefined ? caseStudyCount : undefined,
      updatedBy,
      updatedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  // Recalculate total rating
  performance.totalRating = ((performance.assignmentRating + performance.caseStudyRating) / 2).toFixed(2);
  await performance.save();

  return performance;
};

module.exports = {
  getPerformanceByStudent,
  updatePerformance,
};
