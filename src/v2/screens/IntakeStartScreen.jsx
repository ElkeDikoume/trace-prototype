// Screen 3 — Intake / Session Start.
// Section A: return to a recent case (last 3, each opens that case's intake).
// Section B: start a brand-new blank intake note.
import { mockCases } from '../mockData.js';
import CaseCard from '../components/CaseCard.jsx';

export default function IntakeStartScreen({ onOpenCase, onNewCase }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-1 pb-4">
      <h1 className="mt-2 text-xl font-bold text-white">New session</h1>
      <p className="text-xs text-slate-500">Continue a recent case or start a fresh intake.</p>

      {/* Section A */}
      <h2 className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Return to recent</h2>
      <div className="mt-2 space-y-2">
        {mockCases.slice(0, 3).map((c) => (
          <CaseCard key={c.id} c={c} onOpen={onOpenCase} showArrow />
        ))}
      </div>

      {/* Section B */}
      <h2 className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Start new</h2>
      <button
        onClick={onNewCase}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-tracev2-accent py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90 active:scale-[0.99]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        New case intake
      </button>
    </div>
  );
}
