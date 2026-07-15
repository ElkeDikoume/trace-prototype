// Mock device status bar (time + battery). Purely cosmetic so the shell reads
// as a native mobile app in the demo. Time updates each minute.
import { useEffect, useState } from 'react';

function clock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function StatusBar() {
  const [time, setTime] = useState(clock);

  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-medium text-slate-300 select-none">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
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
