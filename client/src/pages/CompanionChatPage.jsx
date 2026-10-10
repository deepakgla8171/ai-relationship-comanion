import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw, 
  Bot, 
  User, 
  ShieldCheck, 
  Globe, 
  Smile, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const QUICK_PROMPTS = [
  "Aaj office mein kaafi stress tha, how do I unwind?",
  "How can I express appreciation more effectively?",
  "Help me formulate a gentle boundary with my partner",
  "Partner ko encourage karne ke liye acche words suggest karo"
];

export const CompanionChatPage = () => {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(initialPrompt);
  const [language, setLanguage] = useState(user?.preferences?.language || 'Hinglish');
  const [tone, setTone] = useState(user?.preferences?.tone || 'Warm');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat session history
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.companion.getHistory();
        if (res.success && res.history) {
          if (res.history.length === 0) {
            // Seed a friendly welcome message
            setMessages([
              {
                role: 'assistant',
                content: "Hello! Main aapka AI Relationship Companion hoon. Main ek AI hoon, koi insaan ya human partner nahi, but main aapki baatein sunne, communication reflect karne, aur relationship dynamics samajhne mein help karne ke liye yahan hoon. Aaj aap kis baare mein baat karna chahte hain?",
                timestamp: new Date().toISOString(),
                metadata: { language: 'Hinglish', tone: 'Warm', isDemoFallback: true }
              }
            ]);
          } else {
            setMessages(res.history);
          }
        }
      } catch (err) {
        console.error('History load failed:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setError(null);
    setInputText('');

    // Optimistically append user message
    const optimisticUserMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setLoading(true);

    try {
      const res = await api.companion.sendMessage({
        message: text,
        language,
        tone,
        consentGranted: true
      });

      if (res.success && res.reply) {
        const companionMsg = {
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toISOString(),
          metadata: res.metadata
        };
        setMessages((prev) => [...prev, companionMsg]);
      }
    } catch (err) {
      setError(err.message || 'Failed to receive companion response.');
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear this companion chat history?')) return;
    try {
      await api.companion.clearHistory();
      setMessages([
        {
          role: 'assistant',
          content: "Conversation history cleared. I'm ready whenever you'd like to start fresh!",
          timestamp: new Date().toISOString(),
          metadata: { language, tone, isDemoFallback: true }
        }
      ]);
    } catch (err) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Companion Header & Tone Selectors */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm sm:text-base">AI Relationship Companion</h2>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Demo AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI Emotional Assistant • Not a human partner • Quoted memory aware
            </p>
          </div>
        </div>

        {/* Controls: Language, Tone, Clear */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Hinglish" className="bg-slate-900">Hinglish</option>
              <option value="English" className="bg-slate-900">English</option>
              <option value="Hindi" className="bg-slate-900">Hindi</option>
            </select>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl text-xs">
            <Smile className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Warm" className="bg-slate-900">Warm</option>
              <option value="Friendly" className="bg-slate-900">Friendly</option>
              <option value="Calm" className="bg-slate-900">Calm</option>
              <option value="Supportive" className="bg-slate-900">Supportive</option>
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors ml-auto sm:ml-0"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Chat Error" message={error} onClose={() => setError(null)} className="mb-3 shrink-0" />
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                      : 'glass-panel border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : 'AI Companion'}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isUser && msg.metadata?.language && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                          {msg.metadata.language} • {msg.metadata.tone}
                        </span>
                      )}
                      <span>
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </p>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                        title="Copy message"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs text-indigo-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>AI Companion is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 mb-2 no-scrollbar shrink-0">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Suggestions:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition-colors whitespace-nowrap shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message your companion in ${language} (Enter to send, Shift+Enter for new line)...`}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
          />

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            loading={loading}
            icon={Send}
            className="shrink-0 rounded-xl"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
