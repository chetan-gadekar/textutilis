const TopicContent = require('../schemas/TopicContent');
const Topic = require('../schemas/Topic');

// Create topic content
const createContent = async (contentData) => {
  // Verify topic exists
  const topic = await Topic.findById(contentData.topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }

  const content = await TopicContent.create(contentData);
  return content;
};

// Get content by topic
const getContentByTopic = async (topicId) => {
  const content = await TopicContent.find({ topicId })
    .sort({ order: 1, createdAt: 1 });
  return content;
};

// Get content by ID
const getContentById = async (contentId) => {
  const content = await TopicContent.findById(contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  return content;
};

// Update content
const updateContent = async (contentId, updateData) => {
  const content = await TopicContent.findByIdAndUpdate(
    contentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!content) {
    throw new Error('Content not found');
  }
  return content;
};

// Delete content
const deleteContent = async (contentId) => {
  const content = await TopicContent.findByIdAndDelete(contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  return content;
};

module.exports = {
  createContent,
  getContentByTopic,
  getContentById,
  updateContent,
  deleteContent,
};
