const express = require('express');
const router = express.Router();
const { getDbStatus } = require('../config/db');
const config = require('../config/env');

router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  return res.json({
    status: 'healthy',
    service: 'AI Relationship Companion API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: {
      connected: dbStatus.isConnected,
      mode: dbStatus.mode
    },
    ai: {
      provider: config.aiProvider,
      model: config.aiModel,
      isDemoMode: config.aiProvider === 'demo'
    }
  });
});

module.exports = router;
