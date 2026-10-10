import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const alertStyles = {
  info: {
    container: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    icon: Info,
    iconColor: 'text-indigo-400'
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400'
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    icon: AlertTriangle,
    iconColor: 'text-amber-400'
  },
  error: {
    container: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    icon: AlertCircle,
    iconColor: 'text-rose-400'
  }
};

export const Alert = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = ''
}) => {
  const style = alertStyles[type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${style.container} ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5 text-slate-200">{title}</h5>}
        {message && <p className="leading-relaxed text-xs sm:text-sm">{message}</p>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
