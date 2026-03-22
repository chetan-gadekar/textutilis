const TopicContent = require('../schemas/TopicContent');
const Topic = require('../schemas/Topic');
const { signR2Urls, stripR2Signature, deleteFile } = require('../utils/r2Client');

// Create topic content
const createContent = async (contentData) => {
  // Sanitize R2 URL
  contentData.contentData = stripR2Signature(contentData.contentData);

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
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // Sign R2 URLs
  return await signR2Urls(content);
};

// Get content by ID
const getContentById = async (contentId) => {
  const content = await TopicContent.findById(contentId).lean();
  if (!content) {
    throw new Error('Content not found');
  }
  return await signR2Urls(content);
};

// Update content
const updateContent = async (contentId, updateData) => {
  // Sanitize R2 URL
  if (updateData.contentData) {
    updateData.contentData = stripR2Signature(updateData.contentData);
  }
  const content = await TopicContent.findByIdAndUpdate(
    contentId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();
  if (!content) {
    throw new Error('Content not found');
  }
  return await signR2Urls(content);
};

// Delete content
const deleteContent = async (contentId) => {
  const content = await TopicContent.findById(contentId);
  if (!content) {
    throw new Error('Content not found');
  }

  // If it's a video in R2, delete it
  if (content.contentType === 'video' && content.contentData && content.contentData.includes('r2.cloudflarestorage.com')) {
    const url = stripR2Signature(content.contentData);
    const match = url.match(/lms_videos\/.*$/);
    if (match) {
      const fileKey = match[0];
      await deleteFile(fileKey);
    }
  }

  await TopicContent.findByIdAndDelete(contentId);
  return content;
};

module.exports = {
  createContent,
  getContentByTopic,
  getContentById,
  updateContent,
  deleteContent,
};
