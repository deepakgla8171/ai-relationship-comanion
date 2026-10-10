const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

describe('REST API Endpoints Integration Test Suite', () => {
  let guestToken = '';
  let guestUserId = '';
  let uploadedChatId = '';
  let createdMemoryId = '';

  it('GET /api/health should return 200 OK and valid health payload', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.ok(res.body.database);
    assert.ok(res.body.ai);
  });

  it('POST /api/auth/guest should issue a session JWT for instant demo testing', async () => {
    const res = await request(app).post('/api/auth/guest');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.isGuest, true);

    guestToken = res.body.token;
    guestUserId = res.body.user.id;
  });

  it('Protected routes should reject requests without Authorization header with 401', async () => {
    const res = await request(app).get('/api/chats');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/chats/upload should reject empty uploads with 400', async () => {
    const res = await request(app)
      .post('/api/chats/upload')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({});
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/chats/upload with sample=true should parse and store synthetic chat', async () => {
    const res = await request(app)
      .post('/api/chats/upload')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ sample: true });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.chat);
    assert.ok(res.body.chat.id);
    assert.ok(res.body.chat.participants.includes('Priya'));
    assert.ok(res.body.chat.participants.includes('Deepak'));
    assert.ok(res.body.chat.parsedMessageCount > 0);

    uploadedChatId = res.body.chat.id;
  });

  it('GET /api/chats should list all uploaded chats for user', async () => {
    const res = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.chats));
    assert.ok(res.body.chats.length >= 1);
  });

  it('GET /api/chats/:id with invalid ObjectId format should return 400', async () => {
    const res = await request(app)
      .get('/api/chats/not-a-valid-id')
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.error.includes('24-character'));
  });

  it('GET /api/chats/:id should return conversation with messages', async () => {
    const res = await request(app)
      .get(`/api/chats/${uploadedChatId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.chat);
    assert.ok(Array.isArray(res.body.chat.messages));
  });

  it('POST /api/chats/:id/analyze should run emotion and tone analysis', async () => {
    const res = await request(app)
      .post(`/api/chats/${uploadedChatId}/analyze`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ consentGranted: true });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.analysis);
    assert.strictEqual(typeof res.body.analysis.sentimentLabel, 'string');
    assert.strictEqual(res.body.analysis.isDemoMode, true);
    assert.ok(Array.isArray(res.body.analysis.topics));
  });

  it('POST /api/companion/message should generate empathetic companion response', async () => {
    const res = await request(app)
      .post('/api/companion/message')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        message: 'Aaj office mein bohot kaam tha, thoda stress lag raha hai.',
        language: 'Hinglish',
        tone: 'Warm'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.reply);
    assert.ok(Array.isArray(res.body.history));
  });

  it('POST /api/companion/memories should create a memory with user approval', async () => {
    const res = await request(app)
      .post('/api/companion/memories')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        content: 'Prefers 5-minute breathing break when stressed',
        category: 'preference',
        isApproved: true
      });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.memory);
    assert.strictEqual(res.body.memory.content, 'Prefers 5-minute breathing break when stressed');

    createdMemoryId = res.body.memory._id || res.body.memory.id;
  });

  it('PATCH /api/companion/memories/:id should update memory content', async () => {
    const res = await request(app)
      .patch(`/api/companion/memories/${createdMemoryId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        content: 'Prefers 10-minute relaxing break when stressed'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.memory.content, 'Prefers 10-minute relaxing break when stressed');
  });

  it('DELETE /api/companion/memories/:id should delete the specific memory', async () => {
    const res = await request(app)
      .delete(`/api/companion/memories/${createdMemoryId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/chats/:id should remove the imported conversation', async () => {
    const res = await request(app)
      .delete(`/api/chats/${uploadedChatId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });
});
