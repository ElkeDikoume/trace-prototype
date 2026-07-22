// A single case card. The record status badge leads — it is the first thing a
// caseworker reads, ahead of the case number. Left border colour encodes risk
// level; never shows a real name — case ID + location + coarse demographics
// only. An amber dot flags a case with incomplete follow-up tasks.
import { RISK_BORDER, recordStatus } from '../theme.js';
import { hasIncompleteTasks } from '../lib/caseStore.js';

// Placeholder characters upstream code substitutes for a missing value —
// mapRow in lib/cases.js uses '—' for an absent age range, for instance. Left
// unguarded, a case with no demographics renders a lone '—' or '·'.
const PLACEHOLDERS = ['.', '·', '—', '–', '-', 'null', 'undefined'];

function part(v) {
  const s = typeof v === 'string' ? v.trim() : v ? String(v).trim() : '';
  return s && !PLACEHOLDERS.includes(s) ? s : null;
}

// Location first, then whatever demographics are recorded. Every part is
// guarded and the separator only appears between surviving parts, so a case
// missing all of them renders nothing at all.
export function caseSubtitle(c) {
  return [part(c?.location), part(c?.ageRange), part(c?.sex === 'F' ? 'Female' : c?.sex === 'M' ? 'Male' : c?.sex)]
    .filter(Boolean)
    .join(' · ');
}

export default function CaseCard({ c, onOpen, showArrow = false }) {
  const incompleteTasks = hasIncompleteTasks(c);
  const status = recordStatus(c.status);
  const subtitle = caseSubtitle(c);

  return (
    <button
      onClick={() => onOpen?.(c.id)}
      className={`group w-full text-left rounded-xl bg-tracev2-card border border-tracev2-border border-l-4 ${
        RISK_BORDER[c.riskLevel]
      } px-3.5 py-3 transition-transform duration-100 hover:border-tracev2-accent/50 active:scale-[0.98]`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {/* Status badge leads the card */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
            <span className="whitespace-nowrap text-[10px] text-tracev2-subtle">{c.lastUpdated}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-tracev2-muted">{c.id}</span>
            {incompleteTasks && (
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tracev2-risk-medium"
                title="Incomplete follow-up tasks"
              />
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-tracev2-muted">{subtitle}</p>}
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
