const Module = require('../schemas/Module');
const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Course = require('../schemas/Course');
const { deleteFile, stripR2Signature } = require('../utils/r2Client');

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
  const module = await Module.findById(moduleId);
  if (!module) {
    throw new Error('Module not found');
  }
  
  // Find all topics for this module
  const topics = await Topic.find({ moduleId });
  const topicIds = topics.map(t => t._id);

  // Find all content for these topics
  const contents = await TopicContent.find({ topicId: { $in: topicIds } });
  
  // Delete R2 files for each video content
  for (const content of contents) {
    if (content.contentType === 'video' && content.contentData && content.contentData.includes('r2.cloudflarestorage.com')) {
      const url = stripR2Signature(content.contentData);
      const match = url.match(/lms_videos\/.*$/);
      if (match) {
        const fileKey = match[0];
        await deleteFile(fileKey);
      }
    }
  }

  // Delete related topics and content from DB
  await TopicContent.deleteMany({ topicId: { $in: topicIds } });
  await Topic.deleteMany({ moduleId });
  
  // Delete module from DB
  await Module.findByIdAndDelete(moduleId);
  
  return module;
};

module.exports = {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
};
