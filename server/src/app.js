const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const companionRoutes = require('./routes/companionRoutes');




// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);
        // Allow configured client URL or localhost in development
        if (config.nodeEnv === 'development' || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive for initial deploy/preview, can be locked down
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to all API routes
app.use('/api', generalLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/companion/memories', memoryRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;