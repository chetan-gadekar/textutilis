const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'super_instructor', 'instructor', 'student']).withMessage('Invalid role'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateCourse = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').optional().trim(),
  handleValidationErrors,
];

const validateContent = [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('moduleTitle').trim().notEmpty().withMessage('Module title is required'),
  body('contentType').isIn(['video', 'ppt', 'text']).withMessage('Invalid content type'),
  body('contentData').notEmpty().withMessage('Content data is required'),
  body('title').trim().notEmpty().withMessage('Content title is required'),
  handleValidationErrors,
];

const validateTopicContent = [
  body('contentType').isIn(['video', 'ppt', 'text']).withMessage('Invalid content type'),
  body('contentData').notEmpty().withMessage('Content data is required'),
  body('title').trim().notEmpty().withMessage('Content title is required'),
  handleValidationErrors,
];

const validateAssignment = [
  body('title').trim().notEmpty().withMessage('Assignment title is required'),
  body('description').optional().trim(),
  handleValidationErrors,
];

const validateTeachingPoint = [
  body('teachingPoints').isArray().withMessage('Teaching points must be an array'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCourse,
  validateContent,
  validateTopicContent,
  validateAssignment,
  validateTeachingPoint,
  handleValidationErrors,
};
