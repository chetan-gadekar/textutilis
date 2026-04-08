const moduleService = require('../services/moduleService');
const courseService = require('../services/courseService');

// ─── Ownership helper ─────────────────────────────────────────────────────────

const verifyModuleOwnership = async (moduleId, user) => {
  const { module } = await moduleService.getModuleById(moduleId);
  const course = await courseService.getCourseById(module.courseId._id);
  const hasBypass = user.role === 'admin' || user.role === 'super_instructor';
  const isOwner = course.instructor && (
    (course.instructor._id && course.instructor._id.toString() === user.id) ||
    (course.instructor.toString() === user.id)
  );
  return { allowed: isOwner || hasBypass, module, course };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Create module
// @route   POST /api/super-instructor/courses/:courseId/modules
// @access  Private/SuperInstructor
const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);
    
    // Verify ownership or bypass for admin/super_instructor
    const isOwner = course.instructor && (
      (course.instructor._id && course.instructor._id.toString() === req.user.id) ||
      (course.instructor.toString() === req.user.id)
    );
    const hasBypass = req.user.role === 'admin' || req.user.role === 'super_instructor';

    if (!isOwner && !hasBypass) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add modules to this course',
      });
    }

    const moduleData = { ...req.body, courseId };
    const module = await moduleService.createModule(moduleData);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

// @desc    Get modules for course
// @route   GET /api/super-instructor/courses/:courseId/modules
// @access  Private/SuperInstructor
const getModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    // Fetch course (for auth check) and modules list in parallel
    const [course, modules] = await Promise.all([
      courseService.getCourseById(courseId),
      moduleService.getModulesByCourse(courseId),
    ]);
    
    // Verify ownership or bypass
    const isOwner = course.instructor && (
      (course.instructor._id && course.instructor._id.toString() === req.user.id) ||
      (course.instructor.toString() === req.user.id)
    );
    const hasBypass = req.user.role === 'admin' || req.user.role === 'super_instructor';

    if (!isOwner && !hasBypass) {
      console.log(`Auth failed for user ${req.user.id} (${req.user.role}) on course ${courseId}. Instructor: ${course.instructor?._id || course.instructor || 'null'}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view modules for this course',
      });
    }

    res.json({ success: true, count: modules.length, data: modules });
  } catch (error) {
    next(error);
  }
};

// @desc    Get module by ID
// @route   GET /api/super-instructor/modules/:id
// @access  Private/SuperInstructor
const getModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { module, topics } = await moduleService.getModuleById(id);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    const isOwner = course.instructor && (
      (course.instructor._id && course.instructor._id.toString() === req.user.id) ||
      (course.instructor.toString() === req.user.id)
    );
    const hasBypass = req.user.role === 'admin' || req.user.role === 'super_instructor';

    if (!isOwner && !hasBypass) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this module',
      });
    }

    res.json({ success: true, data: { module, topics } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update module
// @route   PUT /api/super-instructor/modules/:id
// @access  Private/SuperInstructor
const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Fetch module metadata for auth check and apply update in parallel
    const [{ module }, updatedModule] = await Promise.all([
      moduleService.getModuleById(id),
      moduleService.updateModule(id, req.body),
    ]);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    const isOwner = course.instructor && (
      (course.instructor._id && course.instructor._id.toString() === req.user.id) ||
      (course.instructor.toString() === req.user.id)
    );
    const hasBypass = req.user.role === 'admin' || req.user.role === 'super_instructor';

    if (!isOwner && !hasBypass) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this module',
      });
    }

    res.json({ success: true, data: updatedModule });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete module
// @route   DELETE /api/super-instructor/modules/:id
// @access  Private/SuperInstructor
const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { module } = await moduleService.getModuleById(id);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    const isOwner = course.instructor && (
      (course.instructor._id && course.instructor._id.toString() === req.user.id) ||
      (course.instructor.toString() === req.user.id)
    );
    const hasBypass = req.user.role === 'admin' || req.user.role === 'super_instructor';

    if (!isOwner && !hasBypass) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this module',
      });
    }

    await moduleService.deleteModule(id);
    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createModule,
  getModules,
  getModule,
  updateModule,
  deleteModule,
};
