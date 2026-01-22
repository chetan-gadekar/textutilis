const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const assignmentService = require('../services/assignmentService');

// Helper to check if user has access to course (Owner or Assigned)
const checkAccess = (course, user) => {
  // Admin bypass
  if (user.role === 'admin') return true;

  // Owner check
  if (course.instructor && course.instructor._id.toString() === user.id) return true;
  if (course.instructor && course.instructor.toString() === user.id) return true; // Handle unpopulated

  // Assigned check
  if (user.assignedCourses && user.assignedCourses.some(id => id.toString() === course._id.toString())) {
    return true;
  }

  return false;
};

// @desc    Create course
// @route   POST /api/super-instructor/courses
// @access  Private/SuperInstructor
const createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id,
    };
    const course = await courseService.createCourse(courseData);
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses
// @route   GET /api/super-instructor/courses
// @access  Private/SuperInstructor
const getCourses = async (req, res, next) => {
  try {
    const filters = {
      instructor: req.user.id,
      assignedCourses: req.user.assignedCourses || []
    };
    const courses = await courseService.getAllCourses(filters);
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/super-instructor/courses/:id
// @access  Private/SuperInstructor
const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/super-instructor/courses/:id
// @access  Private/SuperInstructor
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);

    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const updatedCourse = await courseService.updateCourse(id, req.body);
    res.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/super-instructor/courses/:id
// @access  Private/SuperInstructor
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);

    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await courseService.deleteCourse(id);
    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course content
// @route   POST /api/super-instructor/courses/:courseId/content
// @access  Private/SuperInstructor
const createContent = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add content to this course',
      });
    }

    const contentData = {
      ...req.body,
      courseId,
    };
    const content = await contentService.createContent(contentData);
    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course content
// @route   GET /api/super-instructor/courses/:courseId/content
// @access  Private/SuperInstructor
const getContent = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this course content',
      });
    }

    const content = await contentService.getContentByCourse(courseId);
    res.json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course content
// @route   PUT /api/super-instructor/content/:id
// @access  Private/SuperInstructor
const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await contentService.getContentById(id);
    const course = await courseService.getCourseById(content.courseId);

    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content',
      });
    }

    const updatedContent = await contentService.updateContent(id, req.body);
    res.json({
      success: true,
      data: updatedContent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course content
// @route   DELETE /api/super-instructor/content/:id
// @access  Private/SuperInstructor
const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await contentService.getContentById(id);
    const course = await courseService.getCourseById(content.courseId);

    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content',
      });
    }

    await contentService.deleteContent(id);
    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/super-instructor/courses/:courseId/assignments
// @access  Private/SuperInstructor
const createAssignment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignment for this course',
      });
    }

    const assignmentData = {
      ...req.body,
      courseId,
      createdBy: req.user.id,
    };
    const assignment = await assignmentService.createAssignment(assignmentData);
    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for course
// @route   GET /api/super-instructor/courses/:courseId/assignments
// @access  Private/SuperInstructor
const getAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view assignments for this course',
      });
    }

    const assignments = await assignmentService.getAssignmentsByCourse(courseId);
    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/super-instructor/assignments/:id
// @access  Private/SuperInstructor
const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await assignmentService.getAssignmentById(id);
    const course = await courseService.getCourseById(assignment.courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    const updatedAssignment = await assignmentService.updateAssignment(id, req.body);
    res.json({
      success: true,
      data: updatedAssignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/super-instructor/assignments/:id
// @access  Private/SuperInstructor
const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await assignmentService.getAssignmentById(id);
    const course = await courseService.getCourseById(assignment.courseId);

    // Verify ownership or assignment
    if (!checkAccess(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment',
      });
    }

    await assignmentService.deleteAssignment(id);
    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  createContent,
  getContent,
  updateContent,
  deleteContent,
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
};
