const Module = require('../schemas/Module');
const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Course = require('../schemas/Course');

// Create module
const createModule = async (moduleData) => {
  // Verify course exists
  const course = await Course.findById(moduleData.courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const module = await Module.create(moduleData);
  return module;
};

// Get modules by course
const getModulesByCourse = async (courseId) => {
  const modules = await Module.find({ courseId })
    .sort({ order: 1, createdAt: 1 });
  return modules;
};

// Get module by ID with topics
const getModuleById = async (moduleId) => {
  const module = await Module.findById(moduleId).populate('courseId', 'title');
  if (!module) {
    throw new Error('Module not found');
  }
  
  // Get topics for this module
  const topics = await Topic.find({ moduleId: module._id })
    .sort({ order: 1, createdAt: 1 });
  
  return { module, topics };
};

// Update module
const updateModule = async (moduleId, updateData) => {
  const module = await Module.findByIdAndUpdate(
    moduleId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!module) {
    throw new Error('Module not found');
  }
  return module;
};

// Delete module
const deleteModule = async (moduleId) => {
  const module = await Module.findByIdAndDelete(moduleId);
  if (!module) {
    throw new Error('Module not found');
  }
  
  // Delete related topics and content
  const topics = await Topic.find({ moduleId });
  const topicIds = topics.map(t => t._id);
  await TopicContent.deleteMany({ topicId: { $in: topicIds } });
  await Topic.deleteMany({ moduleId });
  
  return module;
};

module.exports = {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
};
