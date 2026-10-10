import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  UploadCloud, 
  BarChart3, 
  MessageSquareText, 
  BrainCircuit, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isGuest, guestLogin } = useAuth();

  const handleStartDemo = async () => {
    await guestLogin();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-20 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Emotional Reflection & Relationship Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Reflect on Conversations. Practice Empathy.{' '}
          <span className="gradient-text">Understand Your Dynamics.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          An independent, privacy-first web assistant. Import your WhatsApp chat export to analyze conversational tones, explore communication preferences, and practice empathetic conversations in natural Hinglish or English.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="primary"
            onClick={handleStartDemo}
            className="w-full sm:w-auto text-base px-8 py-4 shadow-xl shadow-indigo-600/30"
            icon={ArrowRight}
          >
            Launch Demo App
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/import')}
            className="w-full sm:w-auto text-base px-8 py-4"
            icon={UploadCloud}
          >
            Import WhatsApp Chat
          </Button>
        </div>

        {/* Zero-Cloud Demo Guarantee */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Private & Client-Isolated
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-400" /> No WhatsApp Automation
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Deterministic Demo AI Fallback
          </span>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Engineered for Emotional Clarity & Respect
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to review shared history and hone thoughtful communication habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card glow className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">WhatsApp .txt Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Handles standard WhatsApp exports without media. Strips Unicode marks, supports multiline messages, cleans system notifications, and maps participants safely.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card glow className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Emotion & Tone Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates conversational sentiment, identified themes, explicit preferences, and confidence estimates with strict non-diagnostic guardrails.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card glow className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Empathetic Hinglish AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice responses in natural Hinglish, English, or Hindi. Select Warm, Friendly, Calm, or Supportive tones with prompt injection defense.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card glow className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">User-Approved Memories</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memories are never saved silently. Review, edit, approve, or wipe conversational preferences at any time with total privacy control.
            </p>
          </Card>
        </div>
      </section>

      {/* Safety Manifesto & Strict Boundaries */}
      <section className="glass-panel-glow rounded-3xl p-8 sm:p-12 border border-slate-700/80 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Our AI Ethics & Safety Boundaries</h3>
            <p className="text-xs text-slate-400">Built with transparent guardrails from day one</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict AI Identification</span>
            </div>
            <p>
              The companion always introduces itself as an AI assistant. It never impersonates Deepak or secretly pretends to be a real human partner.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Medical Diagnoses</span>
            </div>
            <p>
              Emotions and sentiments are computational pattern estimates. The companion never diagnoses mental disorders or infers sensitive traits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Explicit Consent & Control</span>
            </div>
            <p>
              Uploaded text is never automatically sent to external AI servers without explicit confirmation. You can wipe all data with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Interactive Demo Callout */}
      <section className="text-center space-y-4 py-8">
        <h3 className="text-2xl font-bold text-slate-100">Ready to explore?</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Test with our built-in synthetic Priya & Deepak conversation or upload your own chat export.
        </p>
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/import')}
          className="px-8 py-3.5"
          icon={UploadCloud}
        >
          Try With Synthetic Sample Chat
        </Button>
      </section>
    </div>
  );
};
