const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_companion_super_secure_key_12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri: process.env.MONGODB_URI || '',
  aiProvider: process.env.AI_PROVIDER || 'demo',
  aiModel: process.env.AI_MODEL || 'demo-relationship-v1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  requireExternalAiConsent: process.env.REQUIRE_EXTERNAL_AI_CONSENT !== 'false',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 5,
  maxContextMessages: parseInt(process.env.MAX_CONTEXT_MESSAGES, 10) || 15,
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 30
};

module.exports = config;
