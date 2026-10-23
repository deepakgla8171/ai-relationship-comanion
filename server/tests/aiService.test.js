const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
    analyzeConversation,
    generateCompanionResponse,
    generateDemoAnalysis,
    generateDemoCompanionReply
} = require('../src/services/aiService');


describe('AI Emotion Analysis and Companion Service Suite', () => {
    const sampleMessages = [
        { sender: 'Priya', text: 'Presentation review scheduled for today, thoda stressed feel ho raha hai.' },
        { sender: 'Deepak', text: 'Arre don\'t worry, you prepped so hard! Remember how well client demo went?' },
        { sender: 'Priya', text: 'Thanks Deepak! Jab tu remind karata hai na, confidence aa jata hai ❤️' },
        { sender: 'Priya', text: 'Presentation went amazingly well! Partner gave a shoutout 🎉' },
        { sender: 'Deepak', text: 'Wohooo! So proud of you Priya!! Smashed it.' }
    ];

    it('should return valid structured emotion analysis in Demo Mode', async() => {
        const analysis = await analyzeConversation({
            messages: sampleMessages,
            participants: ['Priya', 'Deepak'],
            userConsentGranted: false
        });

        assert.ok(analysis);
        assert.ok(EMOTION_LABELS.includes(analysis.sentimentLabel), `Invalid sentiment: ${analysis.sentimentLabel}`);
        assert.strictEqual(typeof analysis.possibleEmotionalTone, 'string');
        assert.ok(analysis.confidenceScore >= 0 && analysis.confidenceScore <= 1);
        assert.ok(Array.isArray(analysis.topics) && analysis.topics.length > 0);
        assert.ok(Array.isArray(analysis.explicitCommunicationPreferences));
        assert.strictEqual(typeof analysis.neutralSummary, 'string');
        assert.ok(Array.isArray(analysis.suggestedResponses));
        assert.strictEqual(analysis.isDemoMode, true);
        assert.strictEqual(analysis.safetyNotice, AI_DISCLAIMER);
    });

    it('should generate warm Hinglish companion responses with AI identification', async() => {
        const result = await generateCompanionResponse({
            userMessage: 'Hello, aaj main thoda exhausted feel kar raha hoon.',
            language: 'Hinglish',
            tone: 'Warm',
            userConsentGranted: false
        });

        assert.ok(result);
        assert.strictEqual(typeof result.reply, 'string');
        assert.ok(result.reply.length > 20);
        assert.strictEqual(result.metadata.language, 'Hinglish');
        assert.strictEqual(result.metadata.isDemoFallback, true);
    });

    it('should take approved memories into account when formulating responses', async() => {
        const memories = [
            { content: 'Prefers gentle reassurance when overwhelmed at office' }
        ];

        const result = await generateCompanionResponse({
            userMessage: 'Office mein kaam ka load kaafi zyada ho gaya hai.',
            memories,
            language: 'Hinglish',
            tone: 'Calm',
            userConsentGranted: false
        });

        assert.ok(result.reply);
        assert.ok(result.reply.includes('Prefers gentle reassurance'));
    });

    it('should switch correctly between Hinglish, Hindi, and English', async() => {
        const enResult = await generateCompanionResponse({
            userMessage: 'Hi there!',
            language: 'English',
            tone: 'Friendly',
            userConsentGranted: false
        });
        assert.ok(enResult.reply.includes('AI Relationship Companion'));

        const hiResult = await generateCompanionResponse({
            userMessage: 'Namaste!',
            language: 'Hindi',
            tone: 'Warm',
            userConsentGranted: false
        });
        assert.ok(hiResult.reply.includes('AI रिलेशनशिप साथी'));
    });
});