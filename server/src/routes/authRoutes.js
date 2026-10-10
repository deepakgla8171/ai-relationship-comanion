const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { register, login, guestLogin, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/guest', guestLogin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
