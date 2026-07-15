// Screen 1 — Welcome / Splash.
// Premium feel: the logo fades in and breathes, a halo pulses behind it, a
// progress bar tracks the 1.5s hold, then the whole screen gracefully fades
// out before the Dashboard appears. If a mock session already exists the parent
// skips this screen entirely.
import { useEffect, useState } from 'react';
import traceLogo from '../../assets/trace-logo.png';

const HOLD_MS = 1500;
const FADE_MS = 450; // must match .tracev2-screen transition in index.css

export default function WelcomeScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Begin the fade-out at the end of the hold, then hand off once it settles.
    const leave = setTimeout(() => setLeaving(true), HOLD_MS);
    const done = setTimeout(onDone, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className={`tracev2-screen flex flex-1 flex-col items-center justify-center bg-tracev2-bg px-8 text-center ${
        leaving ? 'tracev2-screen-leaving' : ''
      }`}
    >
      {/* Logo with breathing halo */}
      <div className="relative flex items-center justify-center">
        <span
          className="tracev2-halo absolute h-28 w-28 rounded-full bg-tracev2-accent blur-2xl"
          aria-hidden="true"
        />
        <div className="tracev2-fade-in relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-xl shadow-tracev2-accent/20">
          <img
            src={traceLogo}
            alt="TRACE"
            className="tracev2-logo-pulse h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      <h1 className="tracev2-fade-up mt-6 text-4xl font-bold tracking-tight text-white" style={{ animationDelay: '0.15s' }}>
        TRACE
      </h1>
      <p className="tracev2-fade-up mt-2 text-sm text-slate-400" style={{ animationDelay: '0.28s' }}>
        Caseworker AI · Confidential
      </p>

      {/* Progress bar tracking the hold */}
      <div className="tracev2-fade-up mt-10 h-1 w-40 overflow-hidden rounded-full bg-tracev2-card" style={{ animationDelay: '0.4s' }}>
        <div className="tracev2-progress-bar h-full rounded-full bg-tracev2-accent" />
      </div>
    </div>
  );
}
