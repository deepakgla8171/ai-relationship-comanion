const { z } = require('zod');

// Helper to validate 24-hex-char MongoDB ObjectIds
const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

// Middleware factory for validating request body with Zod
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Invalid request payload format.'
    });
  }
};

// Middleware to validate :id parameter as MongoDB ObjectId
const validateIdParam = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid identifier format for '${paramName}'. Must be a 24-character hexadecimal string.`
    });
  }
  next();
};

module.exports = {
  isValidObjectId,
  validateBody,
  validateIdParam
};
