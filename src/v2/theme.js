// Shared style maps for the v2 mobile shell. Uses the tracev2-* Tailwind
// tokens (see tailwind.config.js). Kept here so risk/status styling stays
// consistent across the Dashboard, Intake and case cards.

export const RISK_BORDER = {
  high: 'border-l-tracev2-risk-high',
  medium: 'border-l-tracev2-risk-medium',
  low: 'border-l-tracev2-risk-low'
};

export const RISK_DOT = {
  high: 'bg-tracev2-risk-high',
  medium: 'bg-tracev2-risk-medium',
  low: 'bg-tracev2-risk-low'
};

export const RISK_TEXT = {
  high: 'text-tracev2-risk-high',
  medium: 'text-tracev2-risk-medium',
  low: 'text-tracev2-risk-low'
};

export const RISK_LABEL = {
  high: 'High risk',
  medium: 'Medium risk',
  low: 'Low risk'
};

// Muted status chip styling (kept understated so it never competes with the
// risk colour on the left border of a card). Covers both the display statuses
// used by the mock caseload and the logical statuses used by new/saved cases.
export const STATUS_STYLE = {
  Urgent: 'text-tracev2-risk-high/90 bg-tracev2-risk-high/10',
  'In progress': 'text-sky-300/90 bg-sky-400/10',
  Active: 'text-tracev2-risk-low/90 bg-tracev2-risk-low/10',
  active: 'text-tracev2-risk-low/90 bg-tracev2-risk-low/10',
  Pending: 'text-tracev2-text/90 bg-slate-400/10',
  pending_referral: 'text-tracev2-risk-medium/90 bg-tracev2-risk-medium/10'
};

// Human-readable label for a (possibly logical) status value.
export const STATUS_LABEL = {
  active: 'Active',
  pending_referral: 'Pending referral'
};
export const statusLabel = (s) => STATUS_LABEL[s] || s;

// Full-width risk banner styling for the case Overview header.
export const RISK_BANNER = {
  high: 'bg-tracev2-risk-high/15 text-tracev2-risk-high border border-tracev2-risk-high/30',
  medium: 'bg-tracev2-risk-medium/15 text-tracev2-risk-medium border border-tracev2-risk-medium/30',
  low: 'bg-tracev2-risk-low/15 text-tracev2-risk-low border border-tracev2-risk-low/30'
};

// Expanded body of that banner (the risk-factor list) — same tone as the
// header, on a light panel so the factors read as content, not chrome.
export const RISK_PANEL = {
  high: 'bg-red-50 text-red-900',
  medium: 'bg-amber-50 text-amber-900',
  low: 'bg-slate-100 text-slate-800'
};
