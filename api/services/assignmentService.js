const { Assignment, Submission } = require('../schemas/Assignment');

// Create assignment
const createAssignment = async (assignmentData) => {
  const assignment = await Assignment.create(assignmentData);
  return assignment;
};

// Get assignments by course
const getAssignmentsByCourse = async (courseId) => {
  const assignments = await Assignment.find({ courseId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  return assignments;
};

// Get assignment by ID
const getAssignmentById = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('createdBy', 'name email')
    .populate('courseId', 'title');
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  return assignment;
};

// Update assignment
const updateAssignment = async (assignmentId, updateData) => {
  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  return assignment;
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
    return existingSubmission;
  }

  const submission = await Submission.create(submissionData);
  return submission;
};

// Get submissions by assignment
const getSubmissionsByAssignment = async (assignmentId) => {
  const submissions = await Submission.find({ assignmentId })
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 });
  return submissions;
};

// Get submissions by student
const getSubmissionsByStudent = async (studentId) => {
  const submissions = await Submission.find({ studentId })
    .populate('assignmentId')
    .populate({
      path: 'assignmentId',
      populate: { path: 'courseId', select: 'title' },
    })
    .sort({ submittedAt: -1 });
  return submissions;
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
};
