const mongoose = require('mongoose');

const messageSubSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false },
  rawTimestamp: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  isSystem: { type: Boolean, default: false }
}, { _id: false });

const analysisSubSchema = new mongoose.Schema({
  analyzedAt: { type: Date, default: Date.now },
  sentimentLabel: { 
    type: String, 
    enum: ['Happy', 'Sad', 'Frustrated', 'Worried', 'Affectionate', 'Neutral', 'Mixed', 'Unclear'],
    default: 'Neutral'
  },
  possibleEmotionalTone: { type: String, default: 'Neutral and conversational' },
  confidenceScore: { type: Number, min: 0, max: 1, default: 0.8 },
  topics: [{ type: String }],
  explicitCommunicationPreferences: [{ type: String }],
  neutralSummary: { type: String },
  suggestedResponses: [{ type: String }],
  isDemoMode: { type: Boolean, default: true }
}, { _id: false });

const importedConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSizeBytes: {
      type: Number,
      required: true
    },
    rawMessageCount: {
      type: Number,
      default: 0
    },
    parsedMessageCount: {
      type: Number,
      default: 0
    },
    participants: [{
      type: String
    }],
    participantMapping: {
      type: Map,
      of: String,
      default: {}
    },
    dateRange: {
      startDate: { type: Date },
      endDate: { type: Date }
    },
    messages: [messageSubSchema],
    analysis: {
      type: analysisSubSchema,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImportedConversation', importedConversationSchema);
