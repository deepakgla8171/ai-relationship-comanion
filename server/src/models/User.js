const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: function() {
        return !this.isGuest;
      }
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    aiConsentGranted: {
      type: Boolean,
      default: false
    },
    preferences: {
      language: {
        type: String,
        enum: ['Hinglish', 'English', 'Hindi'],
        default: 'Hinglish'
      },
      tone: {
        type: String,
        enum: ['Warm', 'Friendly', 'Calm', 'Supportive'],
        default: 'Warm'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
