const studentService = require('../services/studentService');
const User = require('../schemas/User');

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const students = await studentService.getAllStudents(filters);
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate/Deactivate student
// @route   PATCH /api/admin/students/:id/toggle-status
// @access  Private/Admin
const toggleStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.toggleStudentStatus(id);
    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty (instructors and super instructors)
// @route   GET /api/admin/faculty
// @access  Private/Admin
const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find({
      role: { $in: ['instructor', 'super_instructor'] },
    })
      .select('-password')
      .populate('assignedCourses', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty user
// @route   POST /api/admin/faculty
// @access  Private/Admin
const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['instructor', 'super_instructor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either instructor or super_instructor',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const faculty = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        isActive: faculty.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty user
// @route   PUT /api/admin/faculty/:id
// @access  Private/Admin
const updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const faculty = await User.findById(id);
    if (!faculty || !['instructor', 'super_instructor'].includes(faculty.role)) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    if (email && email !== faculty.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      faculty.email = email;
    }

    if (name) faculty.name = name;
    if (role && ['instructor', 'super_instructor'].includes(role)) {
      faculty.role = role;
    }
    if (isActive !== undefined) faculty.isActive = isActive;

    await faculty.save();

    res.json({
      success: true,
      data: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        isActive: faculty.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete faculty user
// @route   DELETE /api/admin/faculty/:id
// @access  Private/Admin
const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await User.findById(id);
    if (!faculty || !['instructor', 'super_instructor'].includes(faculty.role)) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Faculty deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teaching points from all instructors
// @route   GET /api/admin/teaching-points
// @access  Private/Admin
const getAllTeachingPoints = async (req, res, next) => {
  try {
    const teachingPointService = require('../services/teachingPointService');
    const { instructorId, startDate, endDate } = req.query;

    const filters = {};
    if (instructorId) filters.instructorId = instructorId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const teachingPoints = await teachingPointService.getAllTeachingPoints(filters);
    res.json({
      success: true,
      count: teachingPoints.length,
      data: teachingPoints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (for admin)
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAllCourses = async (req, res, next) => {
  try {
    const courseService = require('../services/courseService');
    const courses = await courseService.getAllCourses({});
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign courses to student
// @route   POST /api/admin/students/:id/assign-courses
// @access  Private/Admin
const assignCoursesToStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseIds } = req.body; // Array of course IDs to assign

    const Enrollment = require('../schemas/Enrollment');
    const User = require('../schemas/User');

    // Verify student exists
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get current enrollments
    const currentEnrollments = await Enrollment.find({ studentId: id });
    const currentCourseIds = currentEnrollments.map(e => e.courseId.toString());

    // Determine courses to add and remove
    const coursesToAdd = courseIds.filter(cid => !currentCourseIds.includes(cid));
    const coursesToRemove = currentCourseIds.filter(cid => !courseIds.includes(cid));

    // Remove enrollments
    if (coursesToRemove.length > 0) {
      await Enrollment.deleteMany({
        studentId: id,
        courseId: { $in: coursesToRemove },
      });
    }

    // Add new enrollments
    if (coursesToAdd.length > 0) {
      const newEnrollments = coursesToAdd.map(courseId => ({
        studentId: id,
        courseId,
      }));
      await Enrollment.insertMany(newEnrollments);
    }

    res.json({
      success: true,
      message: 'Courses assigned successfully',
      data: {
        added: coursesToAdd.length,
        removed: coursesToRemove.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student enrollments
// @route   GET /api/admin/students/:id/enrollments
// @access  Private/Admin
const getStudentEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Enrollment = require('../schemas/Enrollment');

    const enrollments = await Enrollment.find({ studentId: id })
      .populate('courseId', 'title description');

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign courses to faculty
// @route   POST /api/admin/faculty/:id/assign-courses
// @access  Private/Admin
const assignCoursesToFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseIds } = req.body; // Array of course IDs

    const User = require('../schemas/User');

    const faculty = await User.findById(id);
    if (!faculty || !['instructor', 'super_instructor'].includes(faculty.role)) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    faculty.assignedCourses = courseIds;
    await faculty.save();

    await faculty.populate('assignedCourses', 'title');

    res.json({
      success: true,
      data: faculty,
      message: 'Courses assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  toggleStudentStatus,
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getAllTeachingPoints,
  getAllCourses,
  assignCoursesToStudent,
  getStudentEnrollments,
  assignCoursesToFaculty,
};
