const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Module = require('../schemas/Module');

// Create topic
const createTopic = async (topicData) => {
  // Verify module exists
  const module = await Module.findById(topicData.moduleId);
  if (!module) {
    throw new Error('Module not found');
  }

  const topic = await Topic.create(topicData);
  return topic;
};

// Get topics by module
const getTopicsByModule = async (moduleId) => {
  const topics = await Topic.find({ moduleId })
    .sort({ order: 1, createdAt: 1 });
  return topics;
};

// Get topic by ID with content
const getTopicById = async (topicId) => {
  const topic = await Topic.findById(topicId).populate('moduleId', 'title');
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  // Get content for this topic
  const content = await TopicContent.find({ topicId: topic._id })
    .sort({ order: 1, createdAt: 1 });
  
  return { topic, content };
};

// Update topic
const updateTopic = async (topicId, updateData) => {
  const topic = await Topic.findByIdAndUpdate(
    topicId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!topic) {
    throw new Error('Topic not found');
  }
  return topic;
};

// Delete topic
const deleteTopic = async (topicId) => {
  const topic = await Topic.findByIdAndDelete(topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  // Delete related content
  await TopicContent.deleteMany({ topicId });
  
  return topic;
};

module.exports = {
  createTopic,
  getTopicsByModule,
  getTopicById,
  updateTopic,
  deleteTopic,
};
