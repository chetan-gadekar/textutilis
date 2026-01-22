const User = require('../schemas/User');
const Enrollment = require('../schemas/Enrollment');
const Progress = require('../schemas/Progress');
const Performance = require('../schemas/Performance');

// Get all students
const getAllStudents = async (filters = {}) => {
  const query = { role: 'student' };
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const students = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 });
  return students;
};

// Get student by ID
const getStudentById = async (studentId) => {
  const student = await User.findById(studentId).select('-password');
  if (!student || student.role !== 'student') {
    throw new Error('Student not found');
  }
  return student;
};

// Activate/Deactivate student
const toggleStudentStatus = async (studentId) => {
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    throw new Error('Student not found');
  }
  student.isActive = !student.isActive;
  await student.save();
  return student;
};

// Enroll student in course
const enrollStudent = async (studentId, courseId) => {
  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
  if (existingEnrollment) {
    throw new Error('Student already enrolled in this course');
  }

  const enrollment = await Enrollment.create({ studentId, courseId });
  return enrollment;
};

// Get student enrollments
const getStudentEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId })
    .populate('courseId')
    .sort({ enrolledAt: -1 });
  return enrollments;
};

// Update enrollment progress
const updateEnrollmentProgress = async (studentId, courseId, progress) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  enrollment.progress = Math.min(Math.max(progress, 0), 100);
  if (progress === 100) {
    enrollment.completedAt = new Date();
  }
  await enrollment.save();
  return enrollment;
};

// Save video progress
const saveVideoProgress = async (progressData) => {
  const { studentId, contentId, topicId, moduleId, courseId, videoPosition, isCompleted } = progressData;

  const progress = await Progress.findOneAndUpdate(
    { studentId, contentId },
    {
      studentId,
      contentId,
      topicId,
      moduleId,
      courseId,
      videoPosition,
      isCompleted,
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return progress;
};

// Get video progress
const getVideoProgress = async (studentId, contentId) => {
  const progress = await Progress.findOne({ studentId, contentId });
  return progress;
};

// Get all progress for student in course
const getStudentProgressInCourse = async (studentId, courseId) => {
  const progress = await Progress.find({ studentId, courseId });
  return progress;
};

module.exports = {
  getAllStudents,
  getStudentById,
  toggleStudentStatus,
  enrollStudent,
  getStudentEnrollments,
  updateEnrollmentProgress,
  saveVideoProgress,
  getVideoProgress,
  getStudentProgressInCourse,
};
