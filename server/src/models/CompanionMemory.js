const mongoose = require('mongoose');

const companionMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['preference', 'language', 'tone', 'topic', 'boundary', 'other'],
      default: 'preference'
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },
    source: {
      type: String,
      enum: ['user_explicit', 'conversation_approved', 'system_default'],
      default: 'user_explicit'
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate memories for the same user
companionMemorySchema.index({ userId: 1, content: 1 }, { unique: true });

module.exports = mongoose.model('CompanionMemory', companionMemorySchema);
