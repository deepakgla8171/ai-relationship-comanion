const express = require('express');
const router = express.Router();
const {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories
} = require('../controllers/memoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdParam } = require('../middleware/validateRequest');

router.use(authMiddleware);

// GET /api/companion/memories
router.get('/', getMemories);

// POST /api/companion/memories
router.post('/', createMemory);

// PATCH /api/companion/memories/:id
router.patch('/:id', validateIdParam('id'), updateMemory);

// DELETE /api/companion/memories/:id
router.delete('/:id', validateIdParam('id'), deleteMemory);

// DELETE /api/companion/memories
router.delete('/', clearAllMemories);

module.exports = router;
