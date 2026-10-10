import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  MessageSquareText, 
  BrainCircuit, 
  BarChart3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Calendar,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [memories, setMemories] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [chatsRes, memoriesRes, settingsRes] = await Promise.all([
        api.chats.getAll().catch(() => ({ chats: [] })),
        api.memories.getAll().catch(() => ({ memories: [] })),
        api.settings.get().catch(() => ({ settings: null }))
      ]);

      setChats(chatsRes.chats || []);
      setMemories(memoriesRes.memories || []);
      setSystemSettings(settingsRes.settings || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this imported chat?')) return;

    try {
      await api.chats.delete(id);
      setChats(chats.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleLoadSampleChat = async () => {
    setActionLoading(true);
    try {
      const res = await api.chats.upload({ sample: true });
      if (res.success && res.chat) {
        await fetchDashboardData();
        navigate(`/analysis?id=${res.chat.id}`);
      }
    } catch (err) {
      alert(`Error loading sample: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Compute ACTUAL real metrics
  const totalImportedChats = chats.length;
  const totalMessagesCount = chats.reduce((acc, c) => acc + (c.parsedMessageCount || 0), 0);
  const approvedMemoriesCount = memories.filter((m) => m.isApproved).length;
  const preferredLanguage = user?.preferences?.language || 'Hinglish';
  const preferredTone = user?.preferences?.tone || 'Warm';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading your companion dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Welcome back, <span className="gradient-text">{user?.name || 'Explorer'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is the live status of your imported conversations and active memories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleLoadSampleChat}
            loading={actionLoading}
            icon={Sparkles}
          >
            Load Sample Chat
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/import')}
            icon={UploadCloud}
          >
            Import New Chat
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Dashboard Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Actual Data Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Imported Chats
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{totalImportedChats}</span>
            <span className="text-xs text-slate-400">conversations</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Stored privately in your session</p>
        </Card>

        <Card className="border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Messages Parsed
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{totalMessagesCount}</span>
            <span className="text-xs text-slate-400">total messages</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Analyzed without third-party leaks</p>
        </Card>

        <Card className="border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Approved Memories
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{approvedMemoriesCount}</span>
            <span className="text-xs text-slate-400">active items</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            <Link to="/memories" className="text-emerald-400 hover:underline">
              Manage memories →
            </Link>
          </p>
        </Card>

        <Card className="border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Companion Style
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <MessageSquareText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">{preferredLanguage}</Badge>
              <Badge variant="indigo" size="sm">{preferredTone}</Badge>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            <Link to="/chat" className="text-cyan-400 hover:underline">
              Open chat interface →
            </Link>
          </p>
        </Card>
      </div>

      {/* System Status Pill Bar */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Storage Engine:</span>
            <span className="font-mono text-indigo-300 font-semibold uppercase">
              {systemSettings?.system?.storageMode || 'In-Memory Demo'}
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Provider:</span>
            <span className="font-mono text-cyan-300 font-semibold uppercase">
              {systemSettings?.system?.aiProvider || 'Deterministic Demo AI'}
            </span>
          </div>
        </div>

        <div className="text-slate-400">
          Strict guardrail: Quoted historical text is isolated from AI instructions.
        </div>
      </div>

      {/* Recent Imported Conversations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <span>Imported WhatsApp Conversations</span>
          </h2>
          <span className="text-xs text-slate-400">{chats.length} found</span>
        </div>

        {chats.length === 0 ? (
          <Card className="text-center py-12 space-y-4 border-dashed border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-200">No WhatsApp chats imported yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a standard .txt export from your phone, or load our synthetic sample chat with Priya & Deepak.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleLoadSampleChat}
                loading={actionLoading}
                icon={Sparkles}
              >
                Load Synthetic Sample Chat
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/import')}
                icon={UploadCloud}
              >
                Upload File (.txt)
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chats.map((chat) => {
              const chatId = chat._id || chat.id;
              const hasAnalysis = Boolean(chat.analysis);

              return (
                <Card
                  key={chatId}
                  className="flex flex-col justify-between hover:border-indigo-500/40 transition-all cursor-pointer group"
                  onClick={() => navigate(`/analysis?id=${chatId}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-slate-100 text-sm truncate max-w-[200px]" title={chat.fileName}>
                        {chat.fileName}
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chatId, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Participants:</span>
                        <span className="text-slate-200 font-medium truncate">
                          {chat.participants?.join(', ') || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Messages:</span>
                        <span className="text-slate-200 font-medium">
                          {chat.parsedMessageCount || 0}
                        </span>
                      </div>

                      {chat.dateRange?.startDate && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(chat.dateRange.startDate).toLocaleDateString()} -{' '}
                            {new Date(chat.dateRange.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    {hasAnalysis ? (
                      <Badge emotion={chat.analysis.sentimentLabel} size="sm">
                        {chat.analysis.sentimentLabel}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Ready for analysis
                      </span>
                    )}

                    <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
