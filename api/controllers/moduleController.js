const moduleService = require('../services/moduleService');
const courseService = require('../services/courseService');

// @desc    Create module
// @route   POST /api/super-instructor/courses/:courseId/modules
// @access  Private/SuperInstructor
const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseById(courseId);
    
    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add modules to this course',
      });
    }

    const moduleData = {
      ...req.body,
      courseId,
    };
    const module = await moduleService.createModule(moduleData);
    res.status(201).json({
      success: true,
      data: module,
    });
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
    const course = await courseService.getCourseById(courseId);
    
    // Verify ownership
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view modules for this course',
      });
    }

    const modules = await moduleService.getModulesByCourse(courseId);
    res.json({
      success: true,
      count: modules.length,
      data: modules,
    });
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
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this module',
      });
    }

    res.json({
      success: true,
      data: { module, topics },
    });
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
    const { module } = await moduleService.getModuleById(id);
    
    // Verify ownership
    const course = await courseService.getCourseById(module.courseId._id);
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this module',
      });
    }

    const updatedModule = await moduleService.updateModule(id, req.body);
    res.json({
      success: true,
      data: updatedModule,
    });
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
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this module',
      });
    }

    await moduleService.deleteModule(id);
    res.json({
      success: true,
      message: 'Module deleted successfully',
    });
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
