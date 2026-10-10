const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    language: String,
    tone: String,
    isDemoFallback: Boolean,
    provider: String
  }
}, { _id: false });

const companionSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'Companion Chat'
    },
    language: {
      type: String,
      enum: ['Hinglish', 'English', 'Hindi'],
      default: 'Hinglish'
    },
    tone: {
      type: String,
      enum: ['Warm', 'Friendly', 'Calm', 'Supportive'],
      default: 'Warm'
    },
    messages: [chatMessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanionSession', companionSessionSchema);
