import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'over':
        return 'bg-red-600 text-white shadow-red-600/30';
      case 'warn':
        return 'bg-amber-600 text-white shadow-amber-600/30';
      case 'success':
        return 'bg-emerald-700 text-white shadow-emerald-700/30';
      default:
        return 'bg-gray-900 text-white shadow-gray-900/30';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'over':
        return <AlertCircle className="w-4 h-4 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Info className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold max-w-sm ${getStyle()}`}
      >
        {getIcon()}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
