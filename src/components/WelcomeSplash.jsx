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

export default function WelcomeSplash({ onStartDemo, onExplore, onSignIn }) {
  return (
    <div className="fixed inset-0 z-[300] bg-trace-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white rounded-xl p-3 mb-5">
        <img src={traceLogo} alt="TRACE" className="h-20 w-auto block" />
      </div>
      <p className="text-slate-300 text-sm max-w-xs mb-8">
        The AI caseworker assistant for anti-trafficking frontlines
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MicrosoftLogo />
          Sign in with Microsoft
        </button>

        <div className="flex items-center gap-2 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-trace-700" />
          or continue as guest
          <div className="flex-1 h-px bg-trace-700" />
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={onStartDemo}
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-trace-accent text-white hover:bg-sky-500 transition-colors"
          >
            ▶ Start Guided Demo
          </button>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 rounded-md text-sm font-semibold border border-trace-accent text-trace-accent hover:bg-trace-accent/10 transition-colors"
          >
            Explore on my own →
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-4 max-w-xs">Walk through a sample trafficking intake — from language selection to risk flag and referral. No real data required.</p>
    </div>
  );
}
