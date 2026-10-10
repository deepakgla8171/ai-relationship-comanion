const { parseWhatsAppChat } = require('../services/whatsappParser');
const { analyzeConversation } = require('../services/aiService');
const storageService = require('../services/storageService');
const { SAMPLE_WHATSAPP_CHAT_TEXT } = require('../utils/sampleChats');
const config = require('../config/env');

const uploadChat = async (req, res, next) => {
  try {
    let rawText = '';
    let fileName = 'chat_export.txt';
    let fileSizeBytes = 0;

    // Check if uploaded via Multer file
    if (req.file) {
      // Validate file extension
      if (!req.file.originalname.toLowerCase().endsWith('.txt')) {
        return res.status(400).json({
          success: false,
          error: 'Only .txt WhatsApp chat export files are supported in this version.'
        });
      }

      // Validate size
      fileSizeBytes = req.file.size;
      const maxBytes = config.maxUploadSizeMb * 1024 * 1024;
      if (fileSizeBytes > maxBytes) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds the limit of ${config.maxUploadSizeMb} MB.`
        });
      }

      rawText = req.file.buffer.toString('utf-8');
      fileName = req.file.originalname;
    } else if (req.body.sample === true || req.body.sample === 'true') {
      // Load synthetic sample chat
      rawText = SAMPLE_WHATSAPP_CHAT_TEXT;
      fileName = 'synthetic_sample_chat.txt';
      fileSizeBytes = Buffer.byteLength(rawText, 'utf-8');
    } else if (req.body.rawContent && typeof req.body.rawContent === 'string') {
      // Direct raw text upload
      rawText = req.body.rawContent;
      fileName = req.body.fileName || 'pasted_chat.txt';
      fileSizeBytes = Buffer.byteLength(rawText, 'utf-8');
    } else {
      return res.status(400).json({
        success: false,
        error: 'No file or chat text provided. Please upload a .txt WhatsApp export file.'
      });
    }

    // Parse WhatsApp text
    const parsed = parseWhatsAppChat(rawText);

    // Optional participant mapping from body
    let participantMapping = {};
    if (req.body.participantMapping && typeof req.body.participantMapping === 'object') {
      participantMapping = req.body.participantMapping;
    }

    const userId = req.user._id || req.user.id;

    // Save parsed conversation to storage
    const saved = await storageService.createConversation({
      userId,
      fileName,
      fileSizeBytes,
      rawMessageCount: parsed.rawMessageCount,
      parsedMessageCount: parsed.parsedMessageCount,
      participants: parsed.participants,
      participantMapping,
      dateRange: parsed.dateRange,
      messages: parsed.messages
    });

    return res.status(201).json({
      success: true,
      chat: {
        id: saved._id || saved.id,
        fileName: saved.fileName,
        fileSizeBytes: saved.fileSizeBytes,
        parsedMessageCount: saved.parsedMessageCount,
        participants: saved.participants,
        participantStats: parsed.participantStats,
        dateRange: saved.dateRange,
        systemMessageCount: parsed.systemMessageCount,
        omittedMediaCount: parsed.omittedMediaCount,
        deletedMessageCount: parsed.deletedMessageCount,
        previewMessages: saved.messages.slice(0, 5)
      }
    });
  } catch (error) {
    if (error.message.includes('No valid WhatsApp messages found') || error.message.includes('empty')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const chats = await storageService.findConversationsByUser(userId);
    return res.json({
      success: true,
      chats
    });
  } catch (error) {
    next(error);
  }
};

const getChatById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const chat = await storageService.findConversationById(req.params.id, userId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or you do not have permission to view it.'
      });
    }

    return res.json({
      success: true,
      chat
    });
  } catch (error) {
    next(error);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const deleted = await storageService.deleteConversation(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or already deleted.'
      });
    }

    return res.json({
      success: true,
      message: 'Conversation successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};

const analyzeChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const chat = await storageService.findConversationById(req.params.id, userId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found.'
      });
    }

    // Check user consent if external AI is required
    const userConsentGranted = req.body.consentGranted === true || req.user.aiConsentGranted === true;

    // Run analysis
    const analysis = await analyzeConversation({
      messages: chat.messages,
      participants: chat.participants,
      userConsentGranted
    });

    // Save analysis to the conversation
    const updated = await storageService.updateConversationAnalysis(chat._id || chat.id, userId, analysis);

    return res.json({
      success: true,
      analysis: updated.analysis
    });
  } catch (error) {
    next(error);
  }
};

const getSampleChat = (req, res) => {
  return res.json({
    success: true,
    sampleText: SAMPLE_WHATSAPP_CHAT_TEXT,
    description: 'Realistic Hinglish synthetic sample chat export between Priya and Deepak.'
  });
};

module.exports = {
  uploadChat,
  getChats,
  getChatById,
  deleteChat,
  analyzeChat,
  getSampleChat
};
