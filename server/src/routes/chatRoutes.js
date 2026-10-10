const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadChat,
  getChats,
  getChatById,
  deleteChat,
  analyzeChat,
  getSampleChat
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadLimiter, aiLimiter } = require('../middleware/rateLimiter');
const { validateIdParam } = require('../middleware/validateRequest');
const config = require('../config/env');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024
  }
});

router.use(authMiddleware);

// Get synthetic sample chat text
router.get('/sample', getSampleChat);

// Upload and parse WhatsApp chat
router.post('/upload', uploadLimiter, upload.single('file'), uploadChat);

// Get all uploaded chats for user
router.get('/', getChats);

// Get single chat by ID
router.get('/:id', validateIdParam('id'), getChatById);

// Delete chat by ID
router.delete('/:id', validateIdParam('id'), deleteChat);

// Analyze conversation
router.post('/:id/analyze', validateIdParam('id'), aiLimiter, analyzeChat);

module.exports = router;
