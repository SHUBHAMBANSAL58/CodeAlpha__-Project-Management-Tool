import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, className: 'text-emerald-600' },
  error: { icon: AlertTriangle, className: 'text-rose-600' },
  info: { icon: Info, className: 'text-sky-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((tone, message, description) => {
    const id = ++counter.current;
    setToasts((list) => [...list.slice(-3), { id, tone, message, description }]);
    setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 4000);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (message, description) => push('success', message, description),
    error: (message, description) => push('error', message, description),
    info: (message, description) => push('info', message, description),
  }), [push]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        {toasts.map(({ id, tone, message, description }) => {
          const { icon: Icon, className } = TONES[tone];
          return (
            <div key={id} role={tone === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/10">
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{message}</p>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(id)} className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
