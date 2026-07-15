// Screen 2 — Dashboard / Home.
// Header (small logo + language/theme controls + caseworker avatar),
// personalised greeting, three stat pills, and a Recent Cases list. In
// supervisor mode a "Pending Referrals" approval queue appears above the list.
// Tapping the TRACE logo 3x enables supervisor mode (hidden demo toggle).
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import traceLogo from '../../assets/trace-logo.png';
import CaseCard from '../components/CaseCard.jsx';
import HeaderControls from '../components/HeaderControls.jsx';
import { RISK_LABEL } from '../theme.js';

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

function PendingCard({ c, onApprove, onFlag }) {
  const [flagging, setFlagging] = useState(false);
  const [note, setNote] = useState('');
  return (
    <div className="rounded-xl border border-tracev2-risk-medium/40 bg-tracev2-risk-medium/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-tracev2-text">{c.id}</span>
        <span className="rounded-full bg-tracev2-bg px-2 py-0.5 text-[10px] text-tracev2-muted ring-1 ring-tracev2-border">
          {RISK_LABEL[c.riskLevel]}
        </span>
      </div>
      <p className="mt-1 text-xs text-tracev2-muted">
        {c.ageRange} · {c.sex === 'F' ? 'Female' : c.sex === 'M' ? 'Male' : c.sex}
      </p>

      {flagging ? (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Flag note (what needs attention)…"
            className="w-full resize-none rounded-lg border border-tracev2-border bg-tracev2-bg px-2.5 py-1.5 text-xs text-tracev2-text placeholder:text-tracev2-subtle focus:border-tracev2-accent/70 focus:outline-none"
          />
          <div className="mt-1.5 flex gap-2">
            <button
              onClick={() => setFlagging(false)}
              className="flex-1 rounded-lg border border-tracev2-border py-1.5 text-xs font-medium text-tracev2-text hover:border-tracev2-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => onFlag(c.id, note.trim())}
              className="flex-1 rounded-lg bg-tracev2-risk-medium py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Submit flag
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onApprove(c.id)}
            className="flex-1 rounded-lg bg-tracev2-risk-low py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Approve
          </button>
          <button
            onClick={() => setFlagging(true)}
            className="flex-1 rounded-lg border border-tracev2-border py-1.5 text-xs font-medium text-tracev2-text hover:border-tracev2-muted"
          >
            Flag
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardScreen({
  profile,
  cases = [],
  supervisorMode = false,
  onOpenCase,
  onSeeAll,
  onEnableSupervisor,
  onApprove,
  onFlag
}) {
  const { t } = useTranslation();
  const tapRef = useRef({ count: 0, timer: null });

  function handleLogoTap() {
    const s = tapRef.current;
    s.count += 1;
    clearTimeout(s.timer);
    if (s.count >= 3) {
      s.count = 0;
      onEnableSupervisor?.();
      return;
    }
    s.timer = setTimeout(() => {
      s.count = 0;
    }, 1200);
  }

  const stats = {
    active: cases.filter((c) => c.status === 'Active' || c.status === 'In progress' || c.status === 'active').length,
    urgent: cases.filter((c) => c.riskLevel === 'high').length,
    pending: cases.filter((c) => c.status === 'Pending' || c.status === 'pending_referral').length
  };

  const pending = cases.filter((c) => c.status === 'pending_referral');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-1 pb-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleLogoTap} aria-label="TRACE" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <img
              src={traceLogo}
              alt="TRACE"
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </button>
          <span className="text-sm font-semibold tracking-tight text-tracev2-text">{t('app_name')}</span>
          {supervisorMode && (
            <span className="rounded-full bg-tracev2-accent/15 px-2 py-0.5 text-[10px] font-medium text-tracev2-accent">Supervisor</span>
          )}
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

      {/* Supervisor: pending referrals */}
      {supervisorMode && (
        <div className="mt-5">
          <h2 className="text-sm font-semibold text-tracev2-text">Pending Referrals</h2>
          <div className="mt-2 space-y-2">
            {pending.length === 0 ? (
              <p className="rounded-xl border border-dashed border-tracev2-border px-3 py-5 text-center text-xs text-tracev2-subtle">
                No referrals awaiting approval.
              </p>
            ) : (
              pending.map((c) => <PendingCard key={c.id} c={c} onApprove={onApprove} onFlag={onFlag} />)
            )}
          </div>
        </div>
      )}

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
