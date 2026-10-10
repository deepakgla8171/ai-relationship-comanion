const crypto = require('crypto');
const { getDbStatus } = require('../config/db');
const User = require('../models/User');
const ImportedConversation = require('../models/ImportedConversation');
const CompanionMemory = require('../models/CompanionMemory');
const CompanionSession = require('../models/CompanionSession');

// Helper to generate a 24-hex-char MongoDB-compatible ID
const generateId = () => crypto.randomBytes(12).toString('hex');

// In-Memory Storage collections for demo mode
const inMemoryStore = {
  users: new Map(),
  conversations: new Map(),
  memories: new Map(),
  sessions: new Map()
};

// Seed initial demo data for guests
const seedInitialUser = () => {
  const guestId = '000000000000000000000001';
  if (!inMemoryStore.users.has(guestId)) {
    inMemoryStore.users.set(guestId, {
      _id: guestId,
      id: guestId,
      email: 'demo@relationship-companion.local',
      name: 'Demo User',
      isGuest: true,
      aiConsentGranted: true,
      preferences: { language: 'Hinglish', tone: 'Warm' },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed a couple default approved memories for demo experience
    const mem1Id = '000000000000000000000011';
    inMemoryStore.memories.set(mem1Id, {
      _id: mem1Id,
      id: mem1Id,
      userId: guestId,
      category: 'language',
      content: 'Prefers Hinglish responses for natural emotional warmth',
      source: 'system_default',
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const mem2Id = '000000000000000000000012';
    inMemoryStore.memories.set(mem2Id, {
      _id: mem2Id,
      id: mem2Id,
      userId: guestId,
      category: 'tone',
      content: 'Appreciates gentle reassurance during stressful workdays',
      source: 'conversation_approved',
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

seedInitialUser();

const storageService = {
  isUsingMongo() {
    return getDbStatus().isConnected && !getDbStatus().isDemoStorage;
  },

  // ----------------- USER -----------------
  async createUser(userData) {
    if (this.isUsingMongo()) {
      return await User.create(userData);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...userData,
      preferences: userData.preferences || { language: 'Hinglish', tone: 'Warm' },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.users.set(id, doc);
    return doc;
  },

  async findUserByEmail(email) {
    if (this.isUsingMongo()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    for (const user of inMemoryStore.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async findUserById(id) {
    if (this.isUsingMongo()) {
      return await User.findById(id);
    }
    return inMemoryStore.users.get(id.toString()) || null;
  },

  async updateUser(id, updateData) {
    if (this.isUsingMongo()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    }
    const user = inMemoryStore.users.get(id.toString());
    if (!user) return null;
    const updated = { ...user, ...updateData, updatedAt: new Date() };
    inMemoryStore.users.set(id.toString(), updated);
    return updated;
  },

  // ----------------- CONVERSATIONS -----------------
  async createConversation(convData) {
    if (this.isUsingMongo()) {
      return await ImportedConversation.create(convData);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...convData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.conversations.set(id, doc);
    return doc;
  },

  async findConversationsByUser(userId) {
    if (this.isUsingMongo()) {
      return await ImportedConversation.find({ userId }).select('-messages').sort({ createdAt: -1 });
    }
    const list = [];
    for (const conv of inMemoryStore.conversations.values()) {
      if (conv.userId.toString() === userId.toString()) {
        const { messages, ...summary } = conv;
        list.push(summary);
      }
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  async findConversationById(id, userId) {
    if (this.isUsingMongo()) {
      return await ImportedConversation.findOne({ _id: id, userId });
    }
    const conv = inMemoryStore.conversations.get(id.toString());
    if (conv && conv.userId.toString() === userId.toString()) {
      return conv;
    }
    return null;
  },

  async updateConversationAnalysis(id, userId, analysis) {
    if (this.isUsingMongo()) {
      return await ImportedConversation.findOneAndUpdate(
        { _id: id, userId },
        { analysis, updatedAt: new Date() },
        { new: true }
      );
    }
    const conv = inMemoryStore.conversations.get(id.toString());
    if (conv && conv.userId.toString() === userId.toString()) {
      conv.analysis = analysis;
      conv.updatedAt = new Date();
      inMemoryStore.conversations.set(id.toString(), conv);
      return conv;
    }
    return null;
  },

  async deleteConversation(id, userId) {
    if (this.isUsingMongo()) {
      const res = await ImportedConversation.deleteOne({ _id: id, userId });
      return res.deletedCount > 0;
    }
    const conv = inMemoryStore.conversations.get(id.toString());
    if (conv && conv.userId.toString() === userId.toString()) {
      inMemoryStore.conversations.delete(id.toString());
      return true;
    }
    return false;
  },

  async deleteAllConversationsByUser(userId) {
    if (this.isUsingMongo()) {
      return await ImportedConversation.deleteMany({ userId });
    }
    let count = 0;
    for (const [key, conv] of inMemoryStore.conversations.entries()) {
      if (conv.userId.toString() === userId.toString()) {
        inMemoryStore.conversations.delete(key);
        count++;
      }
    }
    return { deletedCount: count };
  },

  // ----------------- MEMORIES -----------------
  async findMemoriesByUser(userId) {
    if (this.isUsingMongo()) {
      return await CompanionMemory.find({ userId }).sort({ createdAt: -1 });
    }
    const list = [];
    for (const mem of inMemoryStore.memories.values()) {
      if (mem.userId.toString() === userId.toString()) {
        list.push(mem);
      }
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  async createMemory(userId, memoryData) {
    const trimmed = (memoryData.content || '').trim();
    if (!trimmed) {
      throw new Error('Memory content is required');
    }

    if (this.isUsingMongo()) {
      // Check duplicate
      const existing = await CompanionMemory.findOne({ userId, content: trimmed });
      if (existing) {
        return existing;
      }
      return await CompanionMemory.create({
        userId,
        content: trimmed,
        category: memoryData.category || 'preference',
        source: memoryData.source || 'user_explicit',
        isApproved: memoryData.isApproved !== false
      });
    }

    // Check duplicate in memory
    for (const mem of inMemoryStore.memories.values()) {
      if (mem.userId.toString() === userId.toString() && mem.content.toLowerCase() === trimmed.toLowerCase()) {
        return mem;
      }
    }

    const id = generateId();
    const doc = {
      _id: id,
      id,
      userId: userId.toString(),
      content: trimmed,
      category: memoryData.category || 'preference',
      source: memoryData.source || 'user_explicit',
      isApproved: memoryData.isApproved !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.memories.set(id, doc);
    return doc;
  },

  async updateMemory(id, userId, updateData) {
    if (this.isUsingMongo()) {
      return await CompanionMemory.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    }
    const mem = inMemoryStore.memories.get(id.toString());
    if (mem && mem.userId.toString() === userId.toString()) {
      const updated = { ...mem, ...updateData, updatedAt: new Date() };
      inMemoryStore.memories.set(id.toString(), updated);
      return updated;
    }
    return null;
  },

  async deleteMemory(id, userId) {
    if (this.isUsingMongo()) {
      const res = await CompanionMemory.deleteOne({ _id: id, userId });
      return res.deletedCount > 0;
    }
    const mem = inMemoryStore.memories.get(id.toString());
    if (mem && mem.userId.toString() === userId.toString()) {
      inMemoryStore.memories.delete(id.toString());
      return true;
    }
    return false;
  },

  async deleteAllMemoriesByUser(userId) {
    if (this.isUsingMongo()) {
      return await CompanionMemory.deleteMany({ userId });
    }
    let count = 0;
    for (const [key, mem] of inMemoryStore.memories.entries()) {
      if (mem.userId.toString() === userId.toString()) {
        inMemoryStore.memories.delete(key);
        count++;
      }
    }
    return { deletedCount: count };
  },

  // ----------------- COMPANION SESSIONS & CHAT HISTORY -----------------
  async getOrCreateSession(userId) {
    if (this.isUsingMongo()) {
      let session = await CompanionSession.findOne({ userId }).sort({ updatedAt: -1 });
      if (!session) {
        session = await CompanionSession.create({
          userId,
          title: 'Daily Chat',
          messages: []
        });
      }
      return session;
    }

    for (const sess of inMemoryStore.sessions.values()) {
      if (sess.userId.toString() === userId.toString()) {
        return sess;
      }
    }

    const id = generateId();
    const doc = {
      _id: id,
      id,
      userId: userId.toString(),
      title: 'Daily Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.sessions.set(id, doc);
    return doc;
  },

  async addMessageToSession(userId, message) {
    if (this.isUsingMongo()) {
      const session = await this.getOrCreateSession(userId);
      session.messages.push(message);
      session.updatedAt = new Date();
      await session.save();
      return session;
    }

    const session = await this.getOrCreateSession(userId);
    session.messages.push(message);
    session.updatedAt = new Date();
    inMemoryStore.sessions.set(session._id.toString(), session);
    return session;
  },

  async clearSessionMessages(userId) {
    if (this.isUsingMongo()) {
      return await CompanionSession.findOneAndUpdate(
        { userId },
        { messages: [], updatedAt: new Date() },
        { new: true }
      );
    }
    for (const sess of inMemoryStore.sessions.values()) {
      if (sess.userId.toString() === userId.toString()) {
        sess.messages = [];
        sess.updatedAt = new Date();
        return sess;
      }
    }
    return null;
  },

  async wipeAllUserData(userId) {
    await this.deleteAllConversationsByUser(userId);
    await this.deleteAllMemoriesByUser(userId);
    await this.clearSessionMessages(userId);
    return { success: true, message: 'All personal data, imported chats, and memories removed.' };
  }
};

module.exports = storageService;
