const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseWhatsAppChat, cleanUnicodeMarks, isSystemMessage } = require('../src/services/whatsappParser');

describe('WhatsApp Chat Parser Suite', () => {
  it('should parse standard Android 24-hour export format', () => {
    const raw = `12/05/2023, 14:30 - Alice: Hello Bob!
12/05/2023, 14:31 - Bob: Hey Alice! How are you?
12/05/2023, 14:32 - Alice: Doing great, thank you.`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 3);
    assert.deepStrictEqual(parsed.participants, ['Alice', 'Bob']);
    assert.strictEqual(parsed.messages[0].sender, 'Alice');
    assert.strictEqual(parsed.messages[0].text, 'Hello Bob!');
    assert.strictEqual(parsed.messages[1].sender, 'Bob');
    assert.strictEqual(parsed.participantStats['Alice'], 2);
    assert.strictEqual(parsed.participantStats['Bob'], 1);
  });

  it('should parse 12-hour AM/PM Android format', () => {
    const raw = `5/12/23, 9:15 AM - Priya: Good morning!
5/12/23, 9:20 AM - Deepak: Morning Priya! Chai time?
5/12/23, 8:45 PM - Priya: Heading home now.`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 3);
    assert.deepStrictEqual(parsed.participants, ['Priya', 'Deepak']);
    assert.strictEqual(parsed.messages[0].sender, 'Priya');
    assert.strictEqual(parsed.messages[2].sender, 'Priya');
  });

  it('should parse iOS bracketed timestamp format', () => {
    const raw = `[12/05/2023, 14:30:15] Alice: Hi from iOS!
[12/05/2023, 14:31:00] Bob: Awesome, looks clear.`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 2);
    assert.strictEqual(parsed.messages[0].sender, 'Alice');
    assert.strictEqual(parsed.messages[0].text, 'Hi from iOS!');
  });

  it('should correctly preserve multiline messages', () => {
    const raw = `12/05/2023, 10:00 - Alice: Here are our action items:
1. Finish the presentation
2. Review the slide deck
3. Send to team
Let me know if you need help!
12/05/2023, 10:05 - Bob: Got it!`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 2);
    assert.strictEqual(parsed.messages[0].sender, 'Alice');
    assert.ok(parsed.messages[0].text.includes('1. Finish the presentation'));
    assert.ok(parsed.messages[0].text.includes('Let me know if you need help!'));
    assert.strictEqual(parsed.messages[1].sender, 'Bob');
  });

  it('should handle messages with multiple colons and URLs in the body', () => {
    const raw = `12/05/2023, 11:00 - Deepak: Important note: please check this link: https://example.com/item?id=123:456`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 1);
    assert.strictEqual(parsed.messages[0].sender, 'Deepak');
    assert.strictEqual(parsed.messages[0].text, 'Important note: please check this link: https://example.com/item?id=123:456');
  });

  it('should detect system messages and encryption notices', () => {
    const raw = `12/05/2023, 09:00 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
12/05/2023, 09:01 - Alice: Hi!
12/05/2023, 09:02 - Bob: <Media omitted>
12/05/2023, 09:03 - This message was deleted`;

    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.systemMessageCount, 2); // encryption + deleted
    assert.strictEqual(parsed.omittedMediaCount, 1);
    assert.strictEqual(parsed.deletedMessageCount, 1);
    assert.strictEqual(parsed.messages[0].isSystem, true);
    assert.strictEqual(parsed.messages[1].isSystem, false);
  });

  it('should strip Unicode markers (BOM, LTR, RTL, narrow no-break space)', () => {
    const raw = `\uFEFF\u200E12/05/2023,\u202F14:30 - Alice: Testing unicode marks!`;
    const parsed = parseWhatsAppChat(raw);

    assert.strictEqual(parsed.parsedMessageCount, 1);
    assert.strictEqual(parsed.messages[0].sender, 'Alice');
    assert.strictEqual(parsed.messages[0].text, 'Testing unicode marks!');
  });

  it('should reject empty or whitespace files with clear error message', () => {
    assert.throws(() => {
      parseWhatsAppChat('');
    }, /Chat content is empty or invalid/);

    assert.throws(() => {
      parseWhatsAppChat('   \n  \n ');
    }, /empty/);
  });

  it('should reject non-WhatsApp text files', () => {
    assert.throws(() => {
      parseWhatsAppChat('Just a random shopping list:\nMilk\nEggs\nBread');
    }, /No valid WhatsApp messages found/);
  });
});
