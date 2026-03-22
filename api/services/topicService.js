const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const Module = require('../schemas/Module');
const { deleteFile, stripR2Signature } = require('../utils/r2Client');

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
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }

  // Find all content for this topic
  const contents = await TopicContent.find({ topicId });
  
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

  // Delete related content from DB
  await TopicContent.deleteMany({ topicId });
  
  // Delete topic from DB
  await Topic.findByIdAndDelete(topicId);
  
  return topic;
};

module.exports = {
  createTopic,
  getTopicsByModule,
  getTopicById,
  updateTopic,
  deleteTopic,
};
