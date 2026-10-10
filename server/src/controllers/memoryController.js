const storageService = require('../services/storageService');
const { MAX_MEMORY_LENGTH } = require('../../../shared/constants');

const getMemories = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const memories = await storageService.findMemoriesByUser(userId);
    return res.json({
      success: true,
      memories
    });
  } catch (error) {
    next(error);
  }
};

const createMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { content, category, source, isApproved } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Memory content cannot be empty.'
      });
    }

    if (content.trim().length > MAX_MEMORY_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Memory content exceeds maximum allowed length of ${MAX_MEMORY_LENGTH} characters.`
      });
    }

    const memory = await storageService.createMemory(userId, {
      content: content.trim(),
      category: category || 'preference',
      source: source || 'user_explicit',
      isApproved: isApproved !== false
    });

    return res.status(201).json({
      success: true,
      memory
    });
  } catch (error) {
    next(error);
  }
};

const updateMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { content, category, isApproved } = req.body;

    const updateData = {};
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Memory content cannot be empty.'
        });
      }
      if (content.trim().length > MAX_MEMORY_LENGTH) {
        return res.status(400).json({
          success: false,
          error: `Memory content exceeds maximum allowed length of ${MAX_MEMORY_LENGTH} characters.`
        });
      }
      updateData.content = content.trim();
    }
    if (category !== undefined) updateData.category = category;
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);

    const updated = await storageService.updateMemory(id, userId, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found or you do not have permission to edit it.'
      });
    }

    return res.json({
      success: true,
      memory: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const deleted = await storageService.deleteMemory(id, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found or already deleted.'
      });
    }

    return res.json({
      success: true,
      message: 'Memory deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const clearAllMemories = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await storageService.deleteAllMemoriesByUser(userId);
    return res.json({
      success: true,
      message: 'All memories cleared successfully.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories
};
