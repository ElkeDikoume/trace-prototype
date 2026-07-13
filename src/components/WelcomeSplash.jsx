import traceLogo from '../assets/trace-logo.png';
import LanguageSelector from './LanguageSelector.jsx';

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
  '🌐 5 languages + local language interpretation',
  '⚡ AI risk flagging · CTDC standards',
  '📄 AI-generated case insights'
];

export default function WelcomeSplash({ onStartDemo, onExplore, onSignIn }) {
  return (
    <div className="fixed inset-0 z-[300] bg-trace-950/95 backdrop-blur-sm flex items-start justify-center px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-lg relative bg-trace-900 border border-trace-700 rounded-2xl shadow-2xl pt-4 px-6 pb-4">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-white rounded-xl p-2 flex-shrink-0" style={{ maxHeight: '72px', maxWidth: '72px' }}>
            <img src={traceLogo} alt="TRACE" className="w-14 h-14 object-contain block" />
          </div>
          <p className="text-sm text-slate-400 mt-2 leading-snug max-w-sm">
            For this demo, you&apos;ll step into the role of a frontline caseworker in N&apos;Djamena, Chad.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center mt-2">
          {FEATURE_PILLS.map((f) => (
            <span key={f} className="text-[11px] text-slate-300 bg-trace-800 border border-trace-700 rounded-full px-3 py-0.5">
              {f}
            </span>
          ))}
          <span className="text-[11px] text-slate-500 border border-trace-700 rounded-full px-3 py-0.5 whitespace-nowrap">
            PWA · iOS &amp; Android
          </span>
        </div>

        <div className="border-t border-trace-700 my-2" />

        <div className="flex justify-center mb-3">
          <LanguageSelector lang="en" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onStartDemo}
            className="w-full bg-trace-accent text-white font-semibold py-2 rounded-lg hover:bg-sky-500 transition-colors"
          >
            ▶ Start Guided Demo
          </button>
          <button
            onClick={onExplore}
            className="w-full text-slate-400 border border-trace-700 py-1.5 rounded-lg text-sm hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            Explore on your own →
          </button>
        </div>

        <div className="border-t border-trace-700 my-2" />

        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MicrosoftLogo />
          Sign in with Microsoft
        </button>

        <p className="text-[10px] text-slate-600 text-center mt-2 leading-snug">
          Survivors never interact with TRACE directly. All outputs are reviewed by a trained caseworker.
        </p>
      </div>
    </div>
  );
}
