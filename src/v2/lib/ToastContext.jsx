// Minimal toast system for the v2 shell. useToast().show(message, tone) pops a
// dismissible banner near the top of the phone frame. Tones: amber (offline),
// info, error, success.
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext({ show: () => {} });

const TONES = {
  amber: 'border-tracev2-risk-medium/50 bg-tracev2-risk-medium/15 text-tracev2-risk-medium',
  error: 'border-tracev2-risk-high/50 bg-tracev2-risk-high/15 text-tracev2-risk-high',
  success: 'border-tracev2-risk-low/50 bg-tracev2-risk-low/15 text-tracev2-risk-low',
  info: 'border-tracev2-border bg-tracev2-card text-tracev2-text'
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, tone }

  const show = useCallback((message, tone = 'info', ms = 4000) => {
    setToast({ message, tone });
    if (ms) window.setTimeout(() => setToast(null), ms);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex justify-center px-3 pt-3">
          <div
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm shadow-lg ${
              TONES[toast.tone] || TONES.info
            }`}
            role="status"
          >
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
