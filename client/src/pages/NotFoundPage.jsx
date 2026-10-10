import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse-slow">
          <Compass className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
          404
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-2">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
        The route you are looking for does not exist or has been relocated. Let's get you back to safe ground.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" icon={LayoutDashboard}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="md" icon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
