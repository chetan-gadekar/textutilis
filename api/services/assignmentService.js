const { Assignment, Submission } = require('../schemas/Assignment');
const Enrollment = require('../schemas/Enrollment');
const { signR2Urls, stripR2Signature } = require('../utils/r2Client');

// Create assignment
const createAssignment = async (assignmentData) => {
  // Sanitize R2 URLs in attachments
  if (assignmentData.attachments) {
    assignmentData.attachments = assignmentData.attachments.map(att => ({
      ...att,
      fileUrl: stripR2Signature(att.fileUrl)
    }));
  }
  const assignment = await Assignment.create(assignmentData);
  return assignment;
};

// Get assignments by course
const getAssignmentsByCourse = async (courseId) => {
  const assignments = await Assignment.find({ courseId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  return await signR2Urls(assignments);
};

// Get all assignments with pagination and filters
const getAllAssignments = async (filters = {}) => {
  const { page = 1, limit = 10, title, startDate, endDate } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  // Search by title
  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  // Date range filter
  if (startDate || endDate) {
    query.dueDate = {};
    if (startDate) {
      query.dueDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.dueDate.$lte = new Date(endDate);
    }
  }

  const total = await Assignment.countDocuments(query);
  const assignments = await Assignment.find(query)
    .populate('createdBy', 'name email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return {
    assignments: await signR2Urls(assignments),
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  };
};

// Get assignment by ID
const getAssignmentById = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('createdBy', 'name email')
    .populate('courseId', 'title')
    .lean();
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  return await signR2Urls(assignment);
};

// Update assignment
const updateAssignment = async (assignmentId, updateData) => {
  // Sanitize R2 URLs in attachments
  if (updateData.attachments) {
    updateData.attachments = updateData.attachments.map(att => ({
      ...att,
      fileUrl: stripR2Signature(att.fileUrl)
    }));
  }
  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  return await signR2Urls(assignment);
};

// Delete assignment
const deleteAssignment = async (assignmentId) => {
  const assignment = await Assignment.findByIdAndDelete(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // Delete related submissions
  await Submission.deleteMany({ assignmentId });

  return assignment;
};

// Submit assignment
const submitAssignment = async (submissionData) => {
  // Sanitize R2 URL
  submissionData.fileUrl = stripR2Signature(submissionData.fileUrl);

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    assignmentId: submissionData.assignmentId,
    studentId: submissionData.studentId,
  });

  if (existingSubmission) {
    // Update existing submission
    existingSubmission.fileUrl = submissionData.fileUrl;
    existingSubmission.fileName = submissionData.fileName;
    existingSubmission.submittedAt = new Date();
    existingSubmission.status = 'pending';
    await existingSubmission.save();
    return await signR2Urls(existingSubmission.toObject());
  }

  const submission = await Submission.create(submissionData);
  return await signR2Urls(submission.toObject());
};

// Get submissions by assignment
const getSubmissionsByAssignment = async (assignmentId) => {
  const submissions = await Submission.find({ assignmentId })
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 })
    .lean();
  return await signR2Urls(submissions);
};

// Get submissions by student
const getSubmissionsByStudent = async (studentId) => {
  const submissions = await Submission.find({ studentId })
    .populate('assignmentId')
    .populate({
      path: 'assignmentId',
      populate: { path: 'courseId', select: 'title' },
    })
    .sort({ submittedAt: -1 })
    .lean();
  return await signR2Urls(submissions);
};

// Get all submissions with pagination and filters
const getAllSubmissions = async (filters = {}) => {
  const { page = 1, limit = 10, studentId, startDate, endDate, assignmentTitle } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  // Student filter
  if (studentId) {
    query.studentId = studentId;
  }

  // Date range filter
  if (startDate || endDate) {
    query.submittedAt = {};
    if (startDate) {
      query.submittedAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.submittedAt.$lte = new Date(endDate);
    }
  }

  // Assignment Title filter (requires join/lookup or manual filtering)
  // For better performance, we'll fetch assignment IDs first if title is provided
  if (assignmentTitle) {
    const assignments = await Assignment.find({
      title: { $regex: assignmentTitle, $options: 'i' }
    }).select('_id');
    query.assignmentId = { $in: assignments.map(a => a._id) };
  }

  const total = await Submission.countDocuments(query);
  const submissions = await Submission.find(query)
    .populate('studentId', 'name email')
    .populate({
      path: 'assignmentId',
      populate: { path: 'courseId', select: 'title' }
    })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    submissions: await signR2Urls(submissions),
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  };
};

// Get student assignments with status filter
const getStudentAssignmentsWithStatus = async (studentId, filters = {}) => {
  const { page = 1, limit = 10, startDate, endDate, status } = filters;

  // 1. Get enrolled courses
  const enrollments = await Enrollment.find({ studentId }).lean();
  const courseIds = enrollments.map(e => e.courseId);

  // 2. Build assignment query
  const assignmentQuery = { courseId: { $in: courseIds } };

  if (startDate || endDate) {
    assignmentQuery.dueDate = {};
    if (startDate) {
      assignmentQuery.dueDate.$gte = new Date(startDate);
    }
    if (endDate) {
      assignmentQuery.dueDate.$lte = new Date(endDate);
    }
  }

  // 3. Fetch assignments and student submissions in parallel (independent queries)
  const [assignments, submissions] = await Promise.all([
    Assignment.find(assignmentQuery)
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .lean(),
    Submission.find({ studentId }).lean(),
  ]);

  // 4. Build submission lookup map
  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub.assignmentId.toString()] = sub;
  });

  // 5. Merge and determine status
  let studentAssignments = assignments.map(assignment => {
    const submission = submissionMap[assignment._id.toString()];
    const status = submission ? 'submitted' : 'pending';
    return {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      attachments: assignment.attachments || [],
      course: assignment.courseId,
      status: status,
      submission: submission || null
    };
  });

  // 6. Filter by status if requested
  if (status && status !== 'all') {
    if (status === 'submitted') {
      studentAssignments = studentAssignments.filter(a => a.status === 'submitted');
    } else if (status === 'pending') {
      studentAssignments = studentAssignments.filter(a => a.status === 'pending');
    }
  }

  // 7. Manual Pagination
  const total = studentAssignments.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedAssignments = studentAssignments.slice(startIndex, endIndex);

  return {
    assignments: await signR2Urls(paginatedAssignments),
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  };
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  getAllSubmissions,
  getStudentAssignmentsWithStatus,
};
