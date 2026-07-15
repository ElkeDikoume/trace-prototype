// Screen 2 — Dashboard / Home.
// Header (small logo + caseworker avatar), personalised greeting, three stat
// pills, and a Recent Cases list. The AI strip + bottom nav are shell chrome.
import traceLogo from '../../assets/trace-logo.png';
import { caseworkerFirstName, caseworkerInitials, mockCases, caseStats } from '../mockData.js';
import CaseCard from '../components/CaseCard.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatPill({ value, label, tone }) {
  const tones = {
    green: 'text-tracev2-risk-low',
    red: 'text-tracev2-risk-high',
    neutral: 'text-slate-300'
  };
  return (
    <div className="flex-1 rounded-xl bg-tracev2-card border border-tracev2-border px-3 py-2.5">
      <div className={`text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

export default function DashboardScreen({ onOpenCase, onSeeAll }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-1 pb-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <img
              src={traceLogo}
              alt="TRACE"
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.replaceWith(Object.assign(document.createElement('span'), {
                  textContent: 'T',
                  className: 'text-tracev2-bg font-bold'
                }));
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-200">TRACE</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tracev2-accent/20 text-xs font-semibold text-tracev2-accent ring-1 ring-tracev2-accent/30">
          {caseworkerInitials}
        </div>
      </div>

      {/* Greeting */}
      <h1 className="mt-4 text-xl font-bold text-white">
        {greeting()}, {caseworkerFirstName}
      </h1>
      <p className="text-xs text-slate-500">Here&apos;s your caseload today.</p>

      {/* Stat pills */}
      <div className="mt-3 flex gap-2">
        <StatPill value={caseStats.active} label="Active" tone="green" />
        <StatPill value={caseStats.urgent} label="Urgent" tone="red" />
        <StatPill value={caseStats.pending} label="Pending" tone="neutral" />
      </div>

      {/* Recent cases */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Recent Cases</h2>
        <button onClick={onSeeAll} className="text-xs font-medium text-tracev2-accent hover:underline">
          See All
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {mockCases.slice(0, 3).map((c) => (
          <CaseCard key={c.id} c={c} onOpen={onOpenCase} />
        ))}
      </div>
    </div>
  );
}
