const Course = require('../schemas/Course');
const CourseContent = require('../schemas/CourseContent');
const Enrollment = require('../schemas/Enrollment');
const Module = require('../schemas/Module');
const Topic = require('../schemas/Topic');
const TopicContent = require('../schemas/TopicContent');
const { deleteFile, stripR2Signature } = require('../utils/r2Client');

// Create course
const createCourse = async (courseData) => {
  const course = await Course.create(courseData);
  return course;
};

// Get all courses
const getAllCourses = async (filters = {}) => {
  const query = {};

  // Handle specific query mode for instructor access (Owned OR Assigned)
  if (filters.instructor || (filters.assignedCourses && filters.assignedCourses.length > 0)) {
    const orConditions = [];

    if (filters.instructor) {
      orConditions.push({ instructor: filters.instructor });
    }

    if (filters.assignedCourses && filters.assignedCourses.length > 0) {
      orConditions.push({ _id: { $in: filters.assignedCourses } });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }
  }

  if (filters.isVisible !== undefined) {
    query.isVisible = filters.isVisible;
  }

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });
  return courses;
};

// Get course by ID
const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course) {
    throw new Error('Course not found');
  }
  return course;
};

// Update course
const updateCourse = async (courseId, updateData) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!course) {
    throw new Error('Course not found');
  }
  return course;
};

// Delete course
const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // 1. Handle CourseContent (Legacy/Direct specific content)
  const courseContents = await CourseContent.find({ courseId });
  for (const content of courseContents) {
    if (content.contentType === 'video' && content.contentData && content.contentData.includes('r2.cloudflarestorage.com')) {
      const url = stripR2Signature(content.contentData);
      const match = url.match(/lms_videos\/.*$/);
      if (match) {
        await deleteFile(match[0]);
      }
    }
  }

  // 2. Handle Cascading Deletion for Modules -> Topics -> TopicContent
  const modules = await Module.find({ courseId });
  const moduleIds = modules.map(m => m._id);
  
  const topics = await Topic.find({ moduleId: { $in: moduleIds } });
  const topicIds = topics.map(t => t._id);

  const topicContents = await TopicContent.find({ topicId: { $in: topicIds } });
  for (const content of topicContents) {
    if (content.contentType === 'video' && content.contentData && content.contentData.includes('r2.cloudflarestorage.com')) {
      const url = stripR2Signature(content.contentData);
      const match = url.match(/lms_videos\/.*$/);
      if (match) {
        await deleteFile(match[0]);
      }
    }
  }

  // Delete everything from DB
  await TopicContent.deleteMany({ topicId: { $in: topicIds } });
  await Topic.deleteMany({ moduleId: { $in: moduleIds } });
  await Module.deleteMany({ courseId });
  await CourseContent.deleteMany({ courseId });
  await Enrollment.deleteMany({ courseId });
  await Course.findByIdAndDelete(courseId);

  return course;
};

// Toggle course visibility
const toggleCourseVisibility = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }
  course.isVisible = !course.isVisible;
  await course.save();
  return course;
};

// Get courses for student
const getStudentCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId })
    .populate({
      path: 'courseId',
      match: { isVisible: true },
      populate: { path: 'instructor', select: 'name email' },
    })
    .sort({ enrolledAt: -1 });

  return enrollments.filter((enrollment) => enrollment.courseId !== null);
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseVisibility,
  getStudentCourses,
};
