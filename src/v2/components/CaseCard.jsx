// A single case card. Left border colour encodes risk level; never shows a
// real name — case ID + coarse demographics only. An amber dot flags a case
// with incomplete follow-up tasks.
import { RISK_BORDER, STATUS_STYLE, statusLabel } from '../theme.js';
import { hasIncompleteTasks } from '../lib/caseStore.js';

export default function CaseCard({ c, onOpen, showArrow = false }) {
  const incompleteTasks = hasIncompleteTasks(c);

  return (
    <button
      onClick={() => onOpen?.(c.id)}
      className={`group w-full text-left rounded-xl bg-tracev2-card border border-tracev2-border border-l-4 ${
        RISK_BORDER[c.riskLevel]
      } px-3.5 py-3 transition-transform duration-100 hover:border-tracev2-accent/50 active:scale-[0.98]`}
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tabular-nums text-tracev2-text">{c.id}</span>
              {incompleteTasks && (
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tracev2-risk-medium"
                  title="Incomplete follow-up tasks"
                />
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  STATUS_STYLE[c.status] || 'text-tracev2-text bg-slate-400/10'
                }`}
              >
                {statusLabel(c.status)}
              </span>
            </div>
            <p className="mt-1 text-xs text-tracev2-muted">
              {c.ageRange} · {c.sex === 'F' ? 'Female' : c.sex === 'M' ? 'Male' : c.sex}
            </p>
          </div>
          <span className="text-[10px] text-tracev2-subtle whitespace-nowrap">{c.lastUpdated}</span>
        </div>
        {/* Right-edge chevron on every card */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="flex-shrink-0 text-tracev2-subtle rtl:-scale-x-100"
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}
