const TeachingPoint = require('../schemas/TeachingPoint');

// Create or update today's teaching points
const updateTodayTeachingPoints = async (instructorId, teachingPoints) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const teachingPoint = await TeachingPoint.findOneAndUpdate(
    { instructorId, date: today },
    {
      instructorId,
      date: today,
      teachingPoints,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return teachingPoint;
};

// Get today's teaching points for instructor
const getTodayTeachingPoints = async (instructorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const teachingPoint = await TeachingPoint.findOne({
    instructorId,
    date: today,
  });

  return teachingPoint;
};

// Get all teaching points (for admin)
const getAllTeachingPoints = async (filters = {}) => {
  const query = {};
  if (filters.instructorId) {
    query.instructorId = filters.instructorId;
  }
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  const teachingPoints = await TeachingPoint.find(query)
    .populate('instructorId', 'name email')
    .sort({ date: -1, createdAt: -1 });
  
  return teachingPoints;
};

module.exports = {
  updateTodayTeachingPoints,
  getTodayTeachingPoints,
  getAllTeachingPoints,
};
