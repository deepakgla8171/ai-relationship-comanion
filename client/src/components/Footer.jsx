import React from 'react';
import { HeartHandshake, ShieldAlert, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Safety & Ethics Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>AI Ethics & Safety Guarantee:</span>
          </div>
          <p className="leading-relaxed">
            AI Relationship Companion is explicitly an artificial intelligence system. It does not impersonate human partners or Deepak, does not secretly automate WhatsApp, and does not provide clinical mental health diagnoses. All imported text is treated strictly as private historical data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-slate-200">AI Relationship Companion</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empathetic communication reflection, WhatsApp export analysis, and natural Hinglish & English dialogue practice.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/dashboard" className="hover:text-indigo-300 transition-colors">Dashboard</Link></li>
              <li><Link to="/import" className="hover:text-indigo-300 transition-colors">Import Chat Export</Link></li>
              <li><Link to="/analysis" className="hover:text-indigo-300 transition-colors">Conversation Analysis</Link></li>
              <li><Link to="/chat" className="hover:text-indigo-300 transition-colors">AI Companion Chat</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Privacy & Control</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/memories" className="hover:text-indigo-300 transition-colors">User Memory Manager</Link></li>
              <li><Link to="/settings" className="hover:text-indigo-300 transition-colors">Privacy & Data Wipe</Link></li>
              <li className="flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3 text-emerald-400" /> Client-isolated storage
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Technology</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with React, Vite, Node.js, Express, Tailwind CSS, and deterministic AI fallback architecture.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400" /> v1.0.0 Stable
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} AI Relationship Companion. All rights reserved.</p>
          <p>Designed for empathetic communication and self-reflection.</p>
        </div>
      </div>
    </footer>
  );
};
