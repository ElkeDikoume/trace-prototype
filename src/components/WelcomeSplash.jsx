import traceLogo from '../assets/trace-logo.png';

export default function WelcomeSplash({ onStartDemo, onExplore }) {
  return (
    <div className="fixed inset-0 z-[300] bg-trace-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white rounded-xl p-3 mb-5">
        <img src={traceLogo} alt="TRACE" className="h-20 w-auto block" />
      </div>
      <p className="text-slate-300 text-sm max-w-xs mb-8">
        The AI caseworker assistant for anti-trafficking frontlines
      </p>
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
      <p className="text-[11px] text-slate-500 mt-4 max-w-xs">Walk through a sample trafficking intake — from language selection to risk flag and referral. No real data required.</p>
    </div>
  );
}
