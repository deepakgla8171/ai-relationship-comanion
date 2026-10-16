const jwt = require('jsonwebtoken');
const config = require('../config/env');
const storageService = require('../services/storageService');



const token = authHeader.split(' ')[1];
let decoded;
try {
    decoded = jwt.verify(token, config.jwtSecret);
} catch (err) {
    return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
    });
}

const user = await storageService.findUserById(decoded.userId);
if (!user) {
    return res.status(401).json({
        success: false,
        error: 'User account not found.'
    });
}

req.user = user;
next();
}
catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
        success: false,
        error: 'Authentication failed internally.'
    });
}
};

module.exports = authMiddleware;