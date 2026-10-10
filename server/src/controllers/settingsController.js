const storageService = require('../services/storageService');
const { getDbStatus } = require('../config/db');
const config = require('../config/env');

const getSettings = async (req, res, next) => {
  try {
    const user = req.user;
    const dbStatus = getDbStatus();

    return res.json({
      success: true,
      settings: {
        userId: user._id || user.id,
        email: user.email,
        name: user.name,
        isGuest: user.isGuest,
        aiConsentGranted: user.aiConsentGranted,
        preferences: user.preferences || { language: 'Hinglish', tone: 'Warm' },
        system: {
          storageMode: dbStatus.mode,
          isMongoConnected: dbStatus.isConnected,
          aiProvider: config.aiProvider,
          aiModel: config.aiModel,
          maxUploadSizeMb: config.maxUploadSizeMb,
          maxContextMessages: config.maxContextMessages,
          dataRetentionDays: config.dataRetentionDays
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, preferences, aiConsentGranted } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (aiConsentGranted !== undefined) updateData.aiConsentGranted = Boolean(aiConsentGranted);
    if (preferences) {
      updateData.preferences = {
        ...req.user.preferences,
        ...preferences
      };
    }

    const updated = await storageService.updateUser(userId, updateData);

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      user: {
        id: updated._id || updated.id,
        name: updated.name,
        email: updated.email,
        aiConsentGranted: updated.aiConsentGranted,
        preferences: updated.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const wipeData = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await storageService.wipeAllUserData(userId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  wipeData
};
