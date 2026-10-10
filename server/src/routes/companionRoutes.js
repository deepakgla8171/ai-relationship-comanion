const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  clearHistory
} = require('../controllers/companionController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

// Send message to AI companion
router.post('/message', aiLimiter, sendMessage);

// Get companion conversation history
router.get('/history', getHistory);

// Clear companion conversation history
router.delete('/history', clearHistory);

module.exports = router;
