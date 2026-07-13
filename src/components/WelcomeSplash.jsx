import traceLogo from '../assets/trace-logo.png';

function MicrosoftLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="8" height="8" fill="#F25022" />
      <rect x="9" y="0" width="8" height="8" fill="#7FBA00" />
      <rect x="0" y="9" width="8" height="8" fill="#00A4EF" />
      <rect x="9" y="9" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

const FEATURE_PILLS = [
  '🌐 5 languages + Hausa interpretation',
  '⚡ AI risk flagging · CTDC standards',
  '📄 Referral letters in one click'
];

export default function WelcomeSplash({ onStartDemo, onExplore, onSignIn }) {
  return (
    <div className="fixed inset-0 z-[300] bg-trace-950/95 backdrop-blur-sm flex items-center justify-center px-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-trace-900 border border-trace-700 rounded-2xl shadow-2xl p-8 my-4">
        {/* TOP — context card */}
        <p className="text-xs uppercase tracking-widest text-trace-accent text-center">
          FIELD SCENARIO · N&apos;DJAMENA, CHAD
        </p>
        <p className="text-sm text-slate-300 italic text-center mt-2 leading-relaxed">
          "Amina, 28, just arrived at a partner shelter. She speaks Hausa. Her caseworker speaks French.
          No shared language. No tool built for this moment."
        </p>

        <div className="border-t border-trace-700 my-5" />

        {/* MIDDLE — app store style */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white rounded-lg p-1 flex-shrink-0">
              <img src={traceLogo} alt="TRACE" className="w-8 h-8 object-contain block" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold text-white leading-tight">TRACE</div>
              <div className="text-xs text-slate-400 truncate">AI Caseworker Assistant</div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 border border-trace-700 rounded px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap">
            PWA · iOS &amp; Android
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {FEATURE_PILLS.map((f) => (
            <span key={f} className="text-[11px] text-slate-300 bg-trace-800 border border-trace-700 rounded-full px-3 py-1">
              {f}
            </span>
          ))}
        </div>

        {/* BOTTOM — CTAs */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MicrosoftLogo />
            Sign in with Microsoft
          </button>

          <p className="text-center text-xs text-slate-600">— or continue as guest —</p>

          <button
            onClick={onStartDemo}
            className="w-full bg-trace-accent text-white font-semibold py-2.5 rounded-lg hover:bg-sky-500 transition-colors"
          >
            ▶ Start Guided Demo
          </button>
          <button
            onClick={onExplore}
            className="w-full text-slate-400 border border-trace-700 py-2 rounded-lg text-sm hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            Explore on your own →
          </button>
        </div>

        <p className="text-[10px] text-slate-600 text-center mt-4">
          Survivors never interact with TRACE directly. All outputs are reviewed by a trained caseworker.
        </p>
      </div>
    </div>
  );
}
