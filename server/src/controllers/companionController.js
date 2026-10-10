const { generateCompanionResponse } = require('../services/aiService');
const storageService = require('../services/storageService');
const config = require('../config/env');

const sendMessage = async (req, res, next) => {
  try {
    const { message, language, tone, consentGranted } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message exceeds maximum length of 2000 characters.'
      });
    }

    const selectedLanguage = language || req.user.preferences?.language || 'Hinglish';
    const selectedTone = tone || req.user.preferences?.tone || 'Warm';
    const userConsentGranted = consentGranted === true || req.user.aiConsentGranted === true;

    // Fetch approved memories
    const allMemories = await storageService.findMemoriesByUser(userId);
    const approvedMemories = allMemories.filter(m => m.isApproved);

    // Fetch recent session messages for context
    const session = await storageService.getOrCreateSession(userId);
    const recentMessages = (session.messages || []).slice(-config.maxContextMessages);

    // Add user message to session
    const userMsgObj = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    await storageService.addMessageToSession(userId, userMsgObj);

    // Generate response
    const aiResult = await generateCompanionResponse({
      userMessage: message.trim(),
      history: recentMessages,
      memories: approvedMemories,
      language: selectedLanguage,
      tone: selectedTone,
      userConsentGranted
    });

    // Add companion response to session
    const companionMsgObj = {
      role: 'assistant',
      content: aiResult.reply,
      timestamp: new Date(),
      metadata: aiResult.metadata
    };
    const updatedSession = await storageService.addMessageToSession(userId, companionMsgObj);

    return res.json({
      success: true,
      reply: aiResult.reply,
      metadata: aiResult.metadata,
      history: updatedSession.messages
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const session = await storageService.getOrCreateSession(userId);
    return res.json({
      success: true,
      history: session.messages || []
    });
  } catch (error) {
    next(error);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await storageService.clearSessionMessages(userId);
    return res.json({
      success: true,
      message: 'Companion chat history cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory
};
