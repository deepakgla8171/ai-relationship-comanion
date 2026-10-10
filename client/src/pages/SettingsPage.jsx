import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Database, 
  Sparkles, 
  Check, 
  Save, 
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const SettingsPage = () => {
  const { user, refreshUser } = useAuth();

  const [settingsData, setSettingsData] = useState(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Hinglish');
  const [tone, setTone] = useState('Warm');
  const [aiConsent, setAiConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.settings.get();
        if (res.success && res.settings) {
          setSettingsData(res.settings);
          setName(res.settings.name || '');
          setLanguage(res.settings.preferences?.language || 'Hinglish');
          setTone(res.settings.preferences?.tone || 'Warm');
          setAiConsent(Boolean(res.settings.aiConsentGranted));
        }
      } catch (err) {
        setError(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.settings.update({
        name,
        aiConsentGranted: aiConsent,
        preferences: { language, tone }
      });
      if (res.success) {
        setMessage('Settings and preferences saved successfully.');
        await refreshUser();
      }
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [chatsRes, memoriesRes] = await Promise.all([
        api.chats.getAll(),
        api.memories.getAll()
      ]);

      const exportPackage = {
        exportedAt: new Date().toISOString(),
        user: settingsData,
        chats: chatsRes.chats || [],
        memories: memoriesRes.memories || []
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ai_companion_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm('⚠️ DANGER: This will permanently wipe all your imported WhatsApp conversations, emotion analysis records, and conversational memories. This cannot be undone.\n\nAre you completely sure?')) {
      return;
    }

    setWiping(true);
    try {
      const res = await api.settings.wipeData();
      if (res.success) {
        alert(res.message);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      alert(`Data wipe failed: ${err.message}`);
    } finally {
      setWiping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" />
          <span>Privacy & <span className="gradient-text">Preferences</span></span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure your companion experience, manage AI consent, and control your private data footprint.
        </p>
      </div>

      {message && (
        <Alert type="success" title="Success" message={message} onClose={() => setMessage(null)} />
      )}
      {error && (
        <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Card title="Companion Style & Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Name / Display Label</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Session Type</label>
              <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>{user?.isGuest ? 'Isolated Guest Demo' : 'Registered User'}</span>
                <span className="text-[11px] font-mono text-emerald-400">● Active</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Default Response Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Hinglish">Hinglish (Natural Hindi in Latin script + English)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (Devanagari)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Default Response Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Warm">Warm (Empathetic & encouraging)</option>
                <option value="Friendly">Friendly (Casual & upbeat)</option>
                <option value="Calm">Calm (Grounded & centering)</option>
                <option value="Supportive">Supportive (Patient listener)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* AI Consent & Processing Controls */}
        <Card title="AI Processing & External Services Consent" icon={ShieldCheck}>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <div className="space-y-1 text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  Allow AI Model Processing for Emotion Analysis & Companion Chat
                </span>
                <p className="text-slate-400 leading-relaxed">
                  When enabled, conversational context will be processed by the server-side AI engine to generate emotional reflection and replies. If disabled, only local deterministic templates are used.
                </p>
              </div>
            </label>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security Notice:</span>
              </div>
              <p>
                API keys are never exposed to client browsers. Quoted imported messages are strictly sandboxed as historical data and will never be executed as instructions.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
              icon={Save}
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      </form>

      {/* System Status Card */}
      <Card title="System Environment & Infrastructure" icon={Database}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold">Storage Engine</span>
            <p className="font-mono text-indigo-300 uppercase">
              {settingsData?.system?.storageMode || 'In-Memory Demo'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold">AI Provider</span>
            <p className="font-mono text-cyan-300 uppercase">
              {settingsData?.system?.aiProvider || 'Deterministic Demo AI'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold">Data Retention Policy</span>
            <p className="font-mono text-emerald-300">
              {settingsData?.system?.dataRetentionDays || 30} Days
            </p>
          </div>
        </div>
      </Card>

      {/* Data Export & Wipe Zone */}
      <Card title="Data Sovereignty & Deletion" className="border-rose-900/30">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <h4 className="font-semibold text-slate-200 text-xs">Export All Your Data</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download a complete, portable JSON backup of your uploaded chats, analysis, and approved memories.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              icon={Download}
            >
              Download JSON
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
            <div>
              <h4 className="font-semibold text-rose-300 text-xs">Purge & Wipe All Personal Data</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permanently deletes all imported chats, parsed conversations, and companion memories from this session.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleWipeData}
              loading={wiping}
              icon={Trash2}
            >
              Wipe Everything
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
