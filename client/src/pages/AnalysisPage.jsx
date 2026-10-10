import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Sparkles, 
  Heart, 
  Tag, 
  CheckCircle2, 
  MessageSquareText, 
  ShieldAlert, 
  Clock, 
  Users, 
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { api } from '../services/api';

export const AnalysisPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryChatId = searchParams.get('id');

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(queryChatId || '');
  const [chatData, setChatData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.chats.getAll();
        const chatList = res.chats || [];
        setChats(chatList);
        if (!selectedChatId && chatList.length > 0) {
          const firstId = chatList[0]._id || chatList[0].id;
          setSelectedChatId(firstId);
        }
      } catch (err) {
        setError('Failed to load conversations for analysis.');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // Fetch details of selected chat
  useEffect(() => {
    if (!selectedChatId) return;

    const fetchSingleChat = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.chats.getById(selectedChatId);
        if (res.success && res.chat) {
          setChatData(res.chat);
          setAnalysis(res.chat.analysis || null);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch conversation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSingleChat();
  }, [selectedChatId]);

  const handleRunAnalysis = async () => {
    if (!selectedChatId) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await api.chats.analyze(selectedChatId, { consentGranted: true });
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      setError(err.message || 'Analysis processing failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePracticeInChat = (suggestionText) => {
    navigate(`/chat?prompt=${encodeURIComponent(suggestionText)}`);
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading conversation analysis...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
        <Card className="p-8 border-dashed border-slate-700 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">No Conversations Imported Yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please import a WhatsApp export file or load our synthetic demo conversation to see sentiment patterns and communication preferences.
          </p>
          <Button variant="primary" onClick={() => navigate('/import')}>
            Go to Import Chat
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>Conversation <span className="gradient-text">Analysis</span></span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective pattern detection, tone estimates, and communication habits.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs text-slate-400 whitespace-nowrap">Select Chat:</label>
          <select
            value={selectedChatId}
            onChange={(e) => setSelectedChatId(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {chats.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.fileName} ({c.parsedMessageCount} msgs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Analysis Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Primary Status Banner if not analyzed yet */}
      {!analysis && !loading && (
        <Card glow className="text-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Ready to Analyze Tone & Preferences</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our AI engine will review message flows to identify emotional tone patterns, key conversational themes, and supported communication styles.
            </p>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={handleRunAnalysis}
            loading={analyzing}
            icon={Sparkles}
          >
            Run Emotion & Tone Analysis
          </Button>
        </Card>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Strict Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-semibold text-slate-200">Non-Diagnostic AI Estimate Disclaimer:</span>
              <p>
                Tone labels and confidence scores are computational estimates based on historical text patterns. This assistant does not assess real internal emotions, verify facts, or provide psychological or relationship therapy.
              </p>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Sentiment & Tone Card */}
            <Card glow className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Sentiment Label
              </span>
              <div className="flex items-center gap-3">
                <Badge emotion={analysis.sentimentLabel} size="lg" className="text-sm px-3.5 py-1.5">
                  {analysis.sentimentLabel}
                </Badge>
                {analysis.isDemoMode && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Demo Engine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {analysis.possibleEmotionalTone}
              </p>
            </Card>

            {/* Confidence Score Card */}
            <Card glow className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confidence Estimate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-400">
                  {Math.round(analysis.confidenceScore * 100)}%
                </span>
                <span className="text-xs text-slate-400">heuristic match</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(analysis.confidenceScore * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Pattern matching confidence across {chatData?.parsedMessageCount || 0} messages.
              </p>
            </Card>

            {/* Participants Summary */}
            <Card glow className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Participants
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {chatData?.participants?.map((p) => (
                  <div key={p} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/40">
                    <span className="font-semibold text-indigo-300">{p}</span>
                    <span className="text-slate-400 font-mono">
                      {chatData?.participantStats?.[p] || '—'} messages
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Topics & Preferences Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversation Topics */}
            <Card title="Relevant Topics Identified" icon={Tag}>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.topics?.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </Card>

            {/* Explicit Communication Preferences */}
            <Card title="Observed Communication Preferences" icon={CheckCircle2}>
              <ul className="space-y-2.5 mt-2 text-xs text-slate-300">
                {analysis.explicitCommunicationPreferences?.map((pref, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pref}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Objective Summary Card */}
          <Card title="Neutral Conversation Summary" icon={FileText}>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {analysis.neutralSummary}
            </p>
          </Card>

          {/* Empathetic Response Suggestions */}
          <Card title="Empathetic Response Suggestions (Practice Prompts)" icon={MessageSquareText}>
            <p className="text-xs text-slate-400 mb-3">
              Click any suggestion to jump straight into the AI Companion Chat and practice formulating compassionate replies:
            </p>

            <div className="space-y-3">
              {analysis.suggestedResponses?.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePracticeInChat(suggestion)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <p className="text-xs text-slate-200 leading-relaxed group-hover:text-indigo-200 transition-colors">
                    "{suggestion}"
                  </p>
                  <span className="text-xs text-indigo-400 font-medium shrink-0 ml-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Practice <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
