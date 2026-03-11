const Performance = require('../schemas/Performance');
const Enrollment = require('../schemas/Enrollment');
const courseService = require('./courseService');

// Helper to ensure performance record exists
const getOrCreatePerformance = async (studentId, courseId) => {
  let performance = await Performance.findOne({ studentId, courseId })
    .populate('studentId', 'name email')
    .populate('courseId', 'title');

  if (!performance) {
    performance = await Performance.create({
      studentId,
      courseId,
      selfEvaluation: {
        problemIdentification: [],
        potentialSolution: [],
        detailing: [],
        implementation: [],
        problemSynthesizing: [],
        punctuality: [],
      },
      instructorAssessment: {
        problemIdentification: [],
        potentialSolution: [],
        detailing: [],
        implementation: [],
        problemSynthesizing: [],
        punctuality: [],
      }
    });
    // Re-fetch to apply population
    performance = await Performance.findById(performance._id)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');
  }
  return performance;
};

// Get single performance
const getPerformance = async (studentId, courseId) => {
  return await getOrCreatePerformance(studentId, courseId);
};

// Get all performances for a specific student
const getStudentPerformances = async (studentId) => {
  // Find all enrollments for this student
  const enrollments = await Enrollment.find({ studentId });
  const performances = [];

  for (const enrollment of enrollments) {
    const perf = await getOrCreatePerformance(studentId, enrollment.courseId);
    performances.push(perf);
  }
  return performances;
};

// Update self evaluation
const updateSelfEvaluation = async (studentId, courseId, updateData) => {
  const performance = await getOrCreatePerformance(studentId, courseId);
  performance.selfEvaluation = { ...performance.selfEvaluation.toObject(), ...updateData };
  performance.selfEvaluation.submittedAt = new Date();
  await performance.save();
  return performance;
};

// Update instructor assessment
const updateInstructorAssessment = async (studentId, courseId, updateData, updatedBy) => {
  const performance = await getOrCreatePerformance(studentId, courseId);
  performance.instructorAssessment = { ...performance.instructorAssessment.toObject(), ...updateData };
  performance.instructorAssessment.updatedBy = updatedBy;
  await performance.save();
  return performance;
};

// Get students' performance for instructor's courses
const getInstructorStudentsPerformance = async (instructorId, filters = {}) => {
  // 1. Get courses taught/assigned to instructor
  const courses = await courseService.getAllCourses({ instructor: instructorId });
  const courseIds = courses.map(c => c._id);

  if (courseIds.length === 0) return [];

  // Filter by specific course if provided
  const targetCourseIds = filters.courseId
    ? [filters.courseId].filter(id => courseIds.some(cid => cid.toString() === id.toString()))
    : courseIds;

  // 2. Get enrollments for these courses
  const enrollmentsQuery = { courseId: { $in: targetCourseIds } };
  const enrollments = await Enrollment.find(enrollmentsQuery).populate('studentId', 'name email');

  // Apply student name filter if provided
  let filteredEnrollments = enrollments;
  if (filters.studentName) {
    const searchRegex = new RegExp(filters.studentName, 'i');
    filteredEnrollments = enrollments.filter(e =>
      e.studentId && e.studentId.name && searchRegex.test(e.studentId.name)
    );
  }

  // 3. Get performance for each student/course pair
  const performances = [];
  for (const enrollment of filteredEnrollments) {
    if (!enrollment.studentId) continue;
    const perf = await getOrCreatePerformance(enrollment.studentId._id, enrollment.courseId);
    performances.push(perf);
  }

  return performances;
};

// Get all students' performance (for super instructor / admin)
const getAllStudentsPerformance = async (filters = {}) => {
  // Get enrollments based on filters
  let enrollmentsQuery = {};
  if (filters.courseId) {
    enrollmentsQuery.courseId = filters.courseId;
  }

  const enrollments = await Enrollment.find(enrollmentsQuery).populate('studentId', 'name email');

  // Apply student name filter if provided
  let filteredEnrollments = enrollments;
  if (filters.studentName) {
    const searchRegex = new RegExp(filters.studentName, 'i');
    filteredEnrollments = enrollments.filter(e =>
      e.studentId && e.studentId.name && searchRegex.test(e.studentId.name)
    );
  }

  const performances = [];
  for (const enrollment of filteredEnrollments) {
    if (!enrollment.studentId) continue;
    const perf = await getOrCreatePerformance(enrollment.studentId._id, enrollment.courseId);
    performances.push(perf);
  }

  return performances;
};

module.exports = {
  getPerformance,
  getStudentPerformances,
  updateSelfEvaluation,
  updateInstructorAssessment,
  getInstructorStudentsPerformance,
  getAllStudentsPerformance,
};
