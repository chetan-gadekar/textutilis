const Performance = require('../schemas/Performance');
const Enrollment = require('../schemas/Enrollment');
const courseService = require('./courseService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Bulk-fetch existing Performance documents for many (studentId, courseId) pairs
 * and create any that are missing, then return them all with population applied.
 * O(3) DB round-trips regardless of how many pairs are passed.
 */
const bulkGetOrCreatePerformances = async (pairs) => {
  if (!pairs.length) return [];

  // 1. Fetch all existing records in one query
  const existing = await Performance.find({
    $or: pairs.map(({ studentId, courseId }) => ({ studentId, courseId })),
  }).lean();

  // Build a Set of existing combos for O(1) lookup
  const existingSet = new Set(existing.map(p => `${p.studentId}_${p.courseId}`));

  // 2. Determine which pairs need to be created
  const missing = pairs.filter(
    ({ studentId, courseId }) => !existingSet.has(`${studentId}_${courseId}`)
  );

  // 3. Bulk-create missing records in parallel
  if (missing.length > 0) {
    const defaultRecord = ({ studentId, courseId }) => ({
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
      },
    });
    await Performance.insertMany(missing.map(defaultRecord), { ordered: false }).catch(() => {
      // Swallow duplicate-key errors that can occur under concurrent requests
    });
  }

  // 4. Fetch all records (now guaranteed to exist) with population in one query
  const all = await Performance.find({
    $or: pairs.map(({ studentId, courseId }) => ({ studentId, courseId })),
  })
    .populate('studentId', 'name email')
    .populate('courseId', 'title');

  return all;
};

// ─── Legacy single-record helper (used by update functions) ──────────────────

const getOrCreatePerformance = async (studentId, courseId) => {
  const [record] = await bulkGetOrCreatePerformances([{ studentId, courseId }]);
  return record;
};

// ─── Public API ──────────────────────────────────────────────────────────────

// Get single performance
const getPerformance = async (studentId, courseId) => {
  return await getOrCreatePerformance(studentId, courseId);
};

// Get all performances for a specific student (optimized: 2 DB calls total)
const getStudentPerformances = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId }).lean();
  const pairs = enrollments.map(e => ({ studentId, courseId: e.courseId }));
  return await bulkGetOrCreatePerformances(pairs);
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

// Get students' performance for instructor's courses (optimized: bulk $in)
const getInstructorStudentsPerformance = async (instructorId, filters = {}) => {
  // 1. Get courses taught/assigned to instructor
  const courses = await courseService.getAllCourses({ instructor: instructorId });
  const courseIds = courses.map(c => c._id);

  if (courseIds.length === 0) return [];

  // Filter by specific course if provided
  const targetCourseIds = filters.courseId
    ? [filters.courseId].filter(id => courseIds.some(cid => cid.toString() === id.toString()))
    : courseIds;

  // 2. Get enrollments for these courses (in parallel with any other work if needed)
  const enrollments = await Enrollment.find({ courseId: { $in: targetCourseIds } })
    .populate('studentId', 'name email')
    .lean();

  // Apply student name filter if provided
  let filteredEnrollments = enrollments;
  if (filters.studentName) {
    const searchRegex = new RegExp(filters.studentName, 'i');
    filteredEnrollments = enrollments.filter(e =>
      e.studentId && e.studentId.name && searchRegex.test(e.studentId.name)
    );
  }

  // 3. Bulk-resolve performances (no loop, no N+1)
  const pairs = filteredEnrollments
    .filter(e => e.studentId)
    .map(e => ({ studentId: e.studentId._id, courseId: e.courseId }));

  return await bulkGetOrCreatePerformances(pairs);
};

// Get all students' performance (for super instructor / admin)
const getAllStudentsPerformance = async (filters = {}) => {
  let enrollmentsQuery = {};
  if (filters.courseId) {
    enrollmentsQuery.courseId = filters.courseId;
  }

  const enrollments = await Enrollment.find(enrollmentsQuery)
    .populate('studentId', 'name email')
    .lean();

  // Apply student name filter if provided
  let filteredEnrollments = enrollments;
  if (filters.studentName) {
    const searchRegex = new RegExp(filters.studentName, 'i');
    filteredEnrollments = enrollments.filter(e =>
      e.studentId && e.studentId.name && searchRegex.test(e.studentId.name)
    );
  }

  // Bulk-resolve performances (no loop, no N+1)
  const pairs = filteredEnrollments
    .filter(e => e.studentId)
    .map(e => ({ studentId: e.studentId._id, courseId: e.courseId }));

  return await bulkGetOrCreatePerformances(pairs);
};

module.exports = {
  getPerformance,
  getStudentPerformances,
  updateSelfEvaluation,
  updateInstructorAssessment,
  getInstructorStudentsPerformance,
  getAllStudentsPerformance,
};
