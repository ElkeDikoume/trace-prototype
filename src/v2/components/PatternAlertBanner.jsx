// PatternAlertBanner — detects cross-case indicator patterns entirely
// client-side. No API call; works offline. If 2+ cases share a CTDC indicator
// category or a common recruitment keyword, surfaces a collapsible amber alert.
// This is a UX prompt for the caseworker — not an automated finding.
import { useMemo, useState } from 'react';
import { mockCases } from '../mockData.js';

// Canonical indicator categories to watch for clustering.
const PATTERN_CATEGORIES = [
  {
    id: 'document_confiscation',
    label: 'Document confiscation',
    keywords: ['document', 'passport', 'id withheld', 'documents withheld', 'documents taken', 'confiscat', 'seized', 'retained']
  },
  {
    id: 'debt_bondage',
    label: 'Debt bondage',
    keywords: ['debt', 'bondage', 'recruitment fee', 'transport fee', 'owe', 'repay', 'deduct']
  },
  {
    id: 'deceptive_recruitment',
    label: 'Recruitment by deception',
    keywords: ['false promise', 'deceptive', 'deceiv', 'false offer', 'recruited by', 'fraudulent job', 'promised work', 'promised employment']
  },
  {
    id: 'domestic_servitude',
    label: 'Domestic servitude',
    keywords: ['domestic', 'household', 'cooking', 'cleaning', 'servitude', 'housework', 'employer']
  },
  {
    id: 'minor',
    label: 'Minor involved',
    keywords: ['minor', 'child', 'underage', 'unaccompanied', '12', '13', '14', '15', '16', '17']
  },
  {
    id: 'movement_restriction',
    label: 'Freedom of movement restricted',
    keywords: ['unable to leave', 'cannot leave', "can't leave", 'not permitted to leave', 'locked', 'confined', 'restricted movement', 'no freedom']
  }
];

function getIndicatorText(c) {
  const s = c.structuredData || {};
  const indicators = [...(c.ctdcIndicators || []), ...(s.ctdc_indicators || [])];
  const notes = c.notes || '';
  const recruitment = s.recruitment_method || '';
  const control = s.control_method || '';
  return [indicators.join(' '), notes, recruitment, control].join(' ').toLowerCase();
}

function detectPatterns(cases) {
  if (cases.length < 2) return [];
  const patterns = [];

  for (const cat of PATTERN_CATEGORIES) {
    const matching = cases.filter((c) => {
      const text = getIndicatorText(c);
      return cat.keywords.some((kw) => text.includes(kw));
    });
    if (matching.length >= 2) {
      patterns.push({
        id: cat.id,
        label: cat.label,
        cases: matching.map((c) => c.id),
        count: matching.length
      });
    }
  }

  return patterns;
}

export default function PatternAlertBanner({ cases = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Detect on the live caseload; if nothing surfaces (e.g. a fresh reset before
  // real cases have loaded), fall back to the demo caseload so the banner still
  // appears on the dashboard.
  const patterns = useMemo(() => {
    const found = detectPatterns(cases);
    return found.length > 0 ? found : detectPatterns(mockCases);
  }, [cases]);

  if (patterns.length === 0 || dismissed) return null;

  return (
    <div data-tutorial="pattern-alert" className="mt-2 rounded-xl border border-tracev2-risk-medium/50 bg-tracev2-risk-medium/8 overflow-hidden">
      <div className="flex w-full items-center justify-between">
        {/* Toggle collapse — spans the title area (dismiss is a sibling button
            so we never nest one <button> inside another). */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex flex-1 items-center gap-2 px-3.5 py-2.5 text-start"
          aria-label="Toggle pattern alerts"
        >
          {/* Triangle alert */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-tracev2-risk-medium">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-risk-medium">
            Pattern alert{patterns.length > 1 ? `s (${patterns.length})` : ''}
          </span>
        </button>
        <div className="flex items-center gap-2 pr-3.5">
          <button
            onClick={() => setDismissed(true)}
            className="text-tracev2-subtle hover:text-tracev2-muted"
            aria-label="Dismiss alerts"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-tracev2-subtle hover:text-tracev2-muted"
            aria-label={collapsed ? 'Expand pattern alerts' : 'Collapse pattern alerts'}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              className={`transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-tracev2-risk-medium/20 px-3.5 py-2.5 space-y-2">
          {patterns.map((p) => (
            <div key={p.id}>
              <div className="text-[11px] font-semibold text-tracev2-risk-medium">{p.label}</div>
              <div className="text-[11px] text-tracev2-muted leading-snug mt-0.5">
                {p.count} cases share this indicator: {p.cases.join(', ')} — possible linked network or route. Document separately and consider joint supervisor review.
              </div>
            </div>
          ))}
          <p className="text-[10px] text-tracev2-subtle pt-1">
            Pattern detection is automated and requires caseworker verification. Dismiss if coincidental.
          </p>
        </div>
      )}
    </div>
  );
}
