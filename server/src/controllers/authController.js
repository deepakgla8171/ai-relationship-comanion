const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const storageService = require('../services/storageService');

const generateToken = (userId) => {
  return jwt.sign({ userId: userId.toString() }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await storageService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await storageService.createUser({
      email,
      password: hashedPassword,
      name,
      isGuest: false,
      aiConsentGranted: false,
      preferences: { language: 'Hinglish', tone: 'Warm' }
    });

    const token = generateToken(newUser._id || newUser.id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id || newUser.id,
        email: newUser.email,
        name: newUser.name,
        isGuest: false,
        aiConsentGranted: newUser.aiConsentGranted,
        preferences: newUser.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await storageService.findUserByEmail(email);
    if (!user || user.isGuest || !user.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        isGuest: false,
        aiConsentGranted: user.aiConsentGranted,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const guestLogin = async (req, res, next) => {
  try {
    // Look up or create the local demo guest user
    let user = await storageService.findUserByEmail('demo@relationship-companion.local');
    if (!user) {
      user = await storageService.createUser({
        email: 'demo@relationship-companion.local',
        name: 'Demo Visitor',
        isGuest: true,
        aiConsentGranted: true,
        preferences: { language: 'Hinglish', tone: 'Warm' }
      });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        isGuest: true,
        aiConsentGranted: user.aiConsentGranted,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      email: req.user.email,
      name: req.user.name,
      isGuest: req.user.isGuest,
      aiConsentGranted: req.user.aiConsentGranted,
      preferences: req.user.preferences
    }
  });
};

module.exports = {
  register,
  login,
  guestLogin,
  getMe
};
