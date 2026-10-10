const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, wipeData } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/wipe-data', wipeData);

module.exports = router;
