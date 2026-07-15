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
// risk colour on the left border of a card).
export const STATUS_STYLE = {
  Urgent: 'text-tracev2-risk-high/90 bg-tracev2-risk-high/10',
  'In progress': 'text-sky-300/90 bg-sky-400/10',
  Active: 'text-tracev2-risk-low/90 bg-tracev2-risk-low/10',
  Pending: 'text-tracev2-text/90 bg-slate-400/10'
};
