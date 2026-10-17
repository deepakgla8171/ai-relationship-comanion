const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
    // Do not log raw message contents or private user messages
    console.error(`❌ [Error ${req.method} ${req.originalUrl}]:`, err.message || err);

    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

    // Never leak internal stack traces to the client in production or demo
    const response = {
        success: false,
        error: err.message || 'Internal Server Error'
    };
    if (config.nodeEnv === 'development' && err.stack) {
        response.stack = err.stack;
    }
    if (config.nodeEnv === 'development' && err.stack) {
        response.stack = err.stack;
    }


    res.status(statusCode).json(response);
};