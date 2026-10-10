import React from 'react';

const emotionColorMap = {
  Happy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Sad: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Frustrated: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Worried: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Affectionate: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  Neutral: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
  Mixed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Unclear: 'bg-zinc-600/30 text-zinc-300 border-zinc-500/30'
};

export const Badge = ({
  children,
  emotion,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (emotion && emotionColorMap[emotion]) {
    styleClasses = emotionColorMap[emotion];
  } else if (variant === 'indigo') {
    styleClasses = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
  } else if (variant === 'cyan') {
    styleClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  } else if (variant === 'emerald') {
    styleClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (variant === 'amber') {
    styleClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (variant === 'rose') {
    styleClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${styleClasses} ${className}`}
    >
      {emotion && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};
