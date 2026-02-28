const TeachingPoint = require('../schemas/TeachingPoint');
const User = require('../schemas/User');

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
  const { page = 1, limit = 10, name, instructorId, startDate, endDate } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  let instructorIdFilters = [];

  // Name filter: Find instructor IDs first
  if (name) {
    const instructors = await User.find({
      name: { $regex: name, $options: 'i' },
      role: { $in: ['instructor', 'super_instructor'] }
    }).select('_id');
    const instructorIds = instructors.map(i => i._id);
    if (instructorIds.length > 0) {
      instructorIdFilters.push({ $in: instructorIds });
    } else {
      // If no instructors found by name, no teaching points will match
      return {
        teachingPoints: [],
        total: 0,
        pages: 0,
        currentPage: parseInt(page)
      };
    }
  }

  if (instructorId) {
    // Ensure instructorId is an array for $in operator if it's not already
    const ids = Array.isArray(instructorId) ? instructorId : [instructorId];
    instructorIdFilters.push({ $in: ids });
  }

  if (instructorIdFilters.length > 0) {
    query.instructorId = instructorIdFilters.length === 1 ? instructorIdFilters[0] : { $and: instructorIdFilters.map(f => ({ instructorId: f })) };
    // If multiple filters, it becomes { $and: [ { instructorId: { $in: [...] } }, { instructorId: { $in: [...] } } ] }
    // If only one, it's { instructorId: { $in: [...] } }
  }


  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const total = await TeachingPoint.countDocuments(query);
  const teachingPoints = await TeachingPoint.find(query)
    .populate('instructorId', 'name email')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return {
    teachingPoints,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  };
};

module.exports = {
  updateTodayTeachingPoints,
  getTodayTeachingPoints,
  getAllTeachingPoints,
};
