const CourseContent = require('../schemas/CourseContent');
const Course = require('../schemas/Course');

// Create course content
const createContent = async (contentData) => {
  // Verify course exists
  const course = await Course.findById(contentData.courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const content = await CourseContent.create(contentData);
  return content;
};

// Get content by course
const getContentByCourse = async (courseId) => {
  const content = await CourseContent.find({ courseId })
    .sort({ moduleOrder: 1, createdAt: 1 });
  return content;
};

// Get content by ID
const getContentById = async (contentId) => {
  const content = await CourseContent.findById(contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  return content;
};

// Update content
const updateContent = async (contentId, updateData) => {
  const content = await CourseContent.findByIdAndUpdate(
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
  const content = await CourseContent.findByIdAndDelete(contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  return content;
};

module.exports = {
  createContent,
  getContentByCourse,
  getContentById,
  updateContent,
  deleteContent,
};
