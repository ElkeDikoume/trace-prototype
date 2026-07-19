// Mock device status bar (time + battery + privacy toggle).
// The privacy toggle blurs all case content — tap eye icon to activate/restore.
import { useEffect, useState } from 'react';

function clock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function StatusBar({ privacyMode = false, onPrivacyToggle }) {
  const [time, setTime] = useState(clock);

  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-medium text-tracev2-text select-none">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-2.5">
        {/* Privacy toggle — eye/eye-slash */}
        {onPrivacyToggle && (
          <button
            onClick={onPrivacyToggle}
            data-tutorial="privacy-btn"
            aria-label={privacyMode ? 'Show case content' : 'Hide case content'}
            title={privacyMode ? 'Tap to reveal' : 'Tap to hide sensitive content'}
            className={`transition-colors duration-150 ${privacyMode ? 'text-tracev2-risk-medium' : 'text-tracev2-subtle hover:text-tracev2-muted'}`}
          >
            {privacyMode ? (
              /* eye-slash */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              /* eye */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
        )}
        {/* signal */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
          <rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor" />
          <rect x="4" y="5" width="2.5" height="6" rx="0.5" fill="currentColor" />
          <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5" fill="currentColor" />
          <rect x="12" y="0" width="2.5" height="11" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
        <span className="text-[10px]">5G</span>
        {/* battery */}
        <div className="flex items-center gap-0.5" title="82%">
          <div className="relative w-6 h-3 rounded-[3px] border border-slate-400/70 p-[1.5px]">
            <div className="h-full rounded-[1px] bg-tracev2-risk-low" style={{ width: '82%' }} />
          </div>
          <div className="w-[1.5px] h-1.5 rounded-r bg-slate-400/70" />
        </div>
      </div>
    </div>
  );
}
