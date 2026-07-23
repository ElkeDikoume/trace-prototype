// Screen 1 — Welcome / Splash + sign-in.
// Premium splash (fade-in logo, breathing halo, pulse, progress bar) for ~1.5s,
// then a graceful crossfade into the auth options: Sign in with Microsoft
// (real MSAL when VITE_AZURE_CLIENT_ID is set, otherwise a "not configured"
// toast) and a "Continue as demo user" link.
import { useEffect, useRef, useState } from 'react';
import traceLogo from '../../assets/trace-logo.png';
import { useToast } from '../lib/ToastContext.jsx';

const HOLD_MS = 1500;

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="8" height="8" fill="#F25022" />
      <rect x="10" y="0" width="8" height="8" fill="#7FBA00" />
      <rect x="0" y="10" width="8" height="8" fill="#00A4EF" />
      <rect x="10" y="10" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

export default function WelcomeScreen({ onMicrosoft, onDemo, onDemoWithTour, signingIn }) {
  const [phase, setPhase] = useState('splash'); // 'splash' | 'auth'
  const { show } = useToast();
  const tapRef = useRef({ count: 0, timer: null });

  useEffect(() => {
    const id = setTimeout(() => setPhase('auth'), HOLD_MS);
    return () => clearTimeout(id);
  }, []);

  // Hidden demo reset: triple-tap the logo → clear all local state and reload.
  function handleLogoTap() {
    const s = tapRef.current;
    s.count += 1;
    clearTimeout(s.timer);
    if (s.count >= 3) {
      s.count = 0;
      show('Demo reset…', 'info');
      setTimeout(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          /* no-op */
        }
        window.location.replace(window.location.pathname + '?v2');
      }, 800);
      return;
    }
    s.timer = setTimeout(() => {
      s.count = 0;
    }, 1200);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-tracev2-bg px-8 text-center">
      {/* Logo with breathing halo */}
      <div className="relative flex items-center justify-center">
        <span className="tracev2-halo absolute h-52 w-52 rounded-full bg-tracev2-accent blur-2xl" aria-hidden="true" />
        <button
          type="button"
          onClick={handleLogoTap}
          aria-label="TRACE"
          className="tracev2-fade-in relative flex h-36 w-36 items-center justify-center rounded-3xl bg-white p-3 shadow-xl shadow-tracev2-accent/20"
        >
          <img
            src={traceLogo}
            alt="TRACE"
            className="tracev2-logo-pulse h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </button>
      </div>

      <h1 className="tracev2-fade-up mt-6 text-4xl font-bold tracking-tight text-tracev2-text" style={{ animationDelay: '0.15s' }}>
        TRACE
      </h1>
      <p className="tracev2-fade-up mt-2 text-sm text-tracev2-muted" style={{ animationDelay: '0.28s' }}>
        Caseworker AI · Confidential
      </p>

      {phase === 'splash' ? (
        <div className="tracev2-fade-up mt-10 h-1 w-40 overflow-hidden rounded-full bg-tracev2-card" style={{ animationDelay: '0.4s' }}>
          <div className="tracev2-progress-bar h-full rounded-full bg-tracev2-accent" />
        </div>
      ) : (
        <div className="tracev2-fade-in mt-9 flex w-full max-w-xs flex-col items-center gap-3">
          <button
            onClick={onMicrosoft}
            disabled={signingIn}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#0078D4' }}
          >
            {signingIn ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <MicrosoftLogo />
            )}
            Sign in with Microsoft
          </button>

          <div className="flex w-full gap-2">
            <button
              onClick={onDemo}
              className="flex-1 rounded-lg border border-tracev2-border bg-transparent py-2.5 text-sm font-medium text-tracev2-text transition-colors duration-150 hover:border-tracev2-muted"
            >
              Try it yourself
            </button>
            <button
              onClick={onDemoWithTour}
              className="flex-1 rounded-lg bg-tracev2-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90"
            >
              Take a guided tour
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-snug text-tracev2-subtle">
            Survivors never interact with TRACE directly. All outputs are reviewed by a trained caseworker.
          </p>
        </div>
      )}
    </div>
  );
}
