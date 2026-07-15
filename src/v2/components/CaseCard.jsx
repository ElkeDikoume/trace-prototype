// A single case card. Left border colour encodes risk level; never shows a
// real name — case ID + coarse demographics only.
import { RISK_BORDER, STATUS_STYLE } from '../theme.js';

export default function CaseCard({ c, onOpen, showArrow = false }) {
  return (
    <button
      onClick={() => onOpen?.(c.id)}
      className={`w-full text-left rounded-xl bg-tracev2-card border border-tracev2-border border-l-4 ${
        RISK_BORDER[c.riskLevel]
      } px-3.5 py-3 transition-colors duration-150 hover:border-tracev2-accent/50 active:scale-[0.99]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tabular-nums">{c.id}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                STATUS_STYLE[c.status] || 'text-tracev2-text bg-slate-400/10'
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-tracev2-muted">
            {c.ageRange} · {c.sex === 'F' ? 'Female' : c.sex === 'M' ? 'Male' : c.sex}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-tracev2-subtle whitespace-nowrap">{c.lastUpdated}</span>
          {showArrow && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-tracev2-subtle">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
