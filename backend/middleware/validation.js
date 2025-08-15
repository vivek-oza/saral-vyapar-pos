const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// // User registration validation
// const validateSignup = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email address'),
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
//   handleValidationErrors
// ];

// // User login validation
// const validateLogin = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email address'),
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required'),
//   handleValidationErrors
// ];

// -- changed by cursor --

// User registration validation
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];


// Shop creation validation
const validateShopCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Shop name is required and must be less than 100 characters'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address is required and must be less than 500 characters'),
  body('gstNumber')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(value)) {
          throw new Error('GST number should be 15 characters (2 digits + 13 alphanumeric characters)');
        }
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (!/^[6-9]\d{9}$/.test(value)) {
          throw new Error('Phone number should be 10 digits starting with 6-9');
        }
      }
      return true;
    }),
  body('businessType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Business type must be less than 50 characters'),
  handleValidationErrors
];

// Password reset validation
// -- changed by cursor --
// const validatePasswordReset = [
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
//     // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     // .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
//   body('confirmPassword')
//     .custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error('Password confirmation does not match password');
//       }
//       return true;
//     }),
//   handleValidationErrors
// ];

// Password reset validation
// -- changed by cursor --
const validatePasswordReset = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

// Email verification validation
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateShopCreation,
  validatePasswordReset,
  validateEmailVerification,
  handleValidationErrors
};
