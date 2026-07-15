// Screen 2 — Dashboard / Home.
// Header (small logo + language/theme controls + caseworker avatar),
// personalised greeting, three stat pills derived from the live caseload, and a
// Recent Cases list. The AI strip + bottom nav are shell chrome.
import { useTranslation } from 'react-i18next';
import traceLogo from '../../assets/trace-logo.png';
import CaseCard from '../components/CaseCard.jsx';
import HeaderControls from '../components/HeaderControls.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstName(fullName) {
  return (fullName || 'Caseworker').trim().split(/\s+/)[0];
}

function StatPill({ value, label, tone }) {
  const tones = {
    green: 'text-tracev2-risk-low',
    red: 'text-tracev2-risk-high',
    neutral: 'text-tracev2-text'
  };
  return (
    <div className="flex-1 rounded-xl bg-tracev2-card border border-tracev2-border px-3 py-2.5">
      <div className={`text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</div>
      <div className="text-[11px] text-tracev2-subtle">{label}</div>
    </div>
  );
}

export default function DashboardScreen({ profile, cases = [], onOpenCase, onSeeAll }) {
  const { t } = useTranslation();

  const stats = {
    active: cases.filter((c) => c.status === 'Active' || c.status === 'In progress').length,
    urgent: cases.filter((c) => c.riskLevel === 'high').length,
    pending: cases.filter((c) => c.status === 'Pending').length
  };

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
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-tracev2-text">{t('app_name')}</span>
        </div>
        <div className="flex items-center gap-2">
          <HeaderControls />
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-tracev2-accent/20 text-xs font-semibold text-tracev2-accent ring-1 ring-tracev2-accent/30"
            title={profile?.full_name}
          >
            {profile?.initials || 'U'}
          </div>
        </div>
      </div>

      {/* Greeting */}
      <h1 className="mt-4 text-xl font-bold text-tracev2-text">
        {greeting()}, {firstName(profile?.full_name)}
      </h1>
      <p className="text-xs text-tracev2-subtle">Here&apos;s your caseload today.</p>

      {/* Stat pills */}
      <div className="mt-3 flex gap-2">
        <StatPill value={stats.active} label="Active" tone="green" />
        <StatPill value={stats.urgent} label="Urgent" tone="red" />
        <StatPill value={stats.pending} label="Pending" tone="neutral" />
      </div>

      {/* Recent cases */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-tracev2-text">Recent Cases</h2>
        <button onClick={onSeeAll} className="text-xs font-medium text-tracev2-accent hover:underline">
          See All
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {cases.length === 0 ? (
          <p className="rounded-xl border border-dashed border-tracev2-border px-3 py-6 text-center text-xs text-tracev2-subtle">
            No cases yet. Start a new intake to add one.
          </p>
        ) : (
          cases.slice(0, 3).map((c) => <CaseCard key={c.id} c={c} onOpen={onOpenCase} />)
        )}
      </div>
    </div>
  );
}
