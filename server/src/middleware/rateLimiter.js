const rateLimit = require('express-rate-limit');

// General API rate limiter

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per 15 min window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP. Please try again after a few minutes.'
    }
});
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per 15 min window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP. Please try again after a few minutes.'
    }
});
// Stricter limiter for AI endpoints to prevent abuse / runaway costs
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'AI request limit reached. Please wait a moment before sending another prompt.'
    }
});

// Stricter limiter for file upload parsing
const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Max 20 file uploads per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Upload limit reached. Please wait a few minutes before uploading another file.'
    }
});

module.exports = {
    generalLimiter,
    aiLimiter,
    uploadLimiter
};