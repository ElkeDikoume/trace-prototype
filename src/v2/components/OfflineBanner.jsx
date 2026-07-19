// Offline mode banner. Watches navigator.onLine + the window online/offline
// events and, when offline, drops down an amber strip letting the caseworker
// know intake still saves locally while AI features are paused.
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="flex-shrink-0 flex items-center justify-center gap-2 border-b border-tracev2-risk-medium/30 bg-tracev2-risk-medium/15 px-4 py-2 text-tracev2-risk-medium animate-tracev2-slideDown">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
        <path
          d="M1.42 9a15.9 15.9 0 014.7-2.88M10.71 5.05A16 16 0 0122.58 9M5 12.55a10.94 10.94 0 015.17-2.39M16.72 11.06A10.94 10.94 0 0119 12.55M8.53 16.11a6 6 0 016.95 0M12 20h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-medium">No connection · Notes saved locally · AI features unavailable</span>
    </div>
  );
}
