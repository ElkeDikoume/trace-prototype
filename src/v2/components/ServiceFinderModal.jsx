// ServiceFinderModal — searchable directory of IOM/NGO services in the
// N'Djamena / Lake Chad Basin area. Selecting a service pre-fills the referral
// letter with the agency's name, type, and contact. The caseworker reviews and
// edits the final document before sending — no auto-send.
import { useState } from 'react';
import { SERVICES, SERVICE_TYPES, filterServices } from '../lib/services.js';

const TYPE_COLORS = {
  Shelter: 'bg-blue-900/40 text-blue-300 ring-blue-800/50',
  'Legal Aid': 'bg-indigo-900/40 text-indigo-300 ring-indigo-800/50',
  Medical: 'bg-red-900/40 text-red-300 ring-red-800/50',
  Psychosocial: 'bg-purple-900/40 text-purple-300 ring-purple-800/50',
  Livelihood: 'bg-emerald-900/40 text-emerald-300 ring-emerald-800/50',
  'Child Protection': 'bg-amber-900/40 text-amber-300 ring-amber-800/50',
  'Law Enforcement': 'bg-slate-700/60 text-slate-300 ring-slate-600/50'
};

function TypeBadge({ type }) {
  const cls = TYPE_COLORS[type] || 'bg-tracev2-bg text-tracev2-muted ring-tracev2-border';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
      {type}
    </span>
  );
}

export default function ServiceFinderModal({ open, caseData, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [minorsOnly, setMinorsOnly] = useState(
    // Default to minors filter if case involves a minor.
    caseData?.ageRange?.includes('12') || caseData?.ageRange?.includes('15') || caseData?.ageRange?.includes('16')
  );
  const [selected, setSelected] = useState(null);

  if (!open) return null;

  const results = filterServices({ type: activeType, query, minorsOnly });

  function handleConfirm() {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-tracev2-bg">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-tracev2-border px-4 py-3">
        <button onClick={onClose} className="text-tracev2-muted transition-colors hover:text-tracev2-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wide text-tracev2-subtle">Referral</div>
          <div className="text-sm font-semibold text-tracev2-text">Find a Service</div>
        </div>
        <div className="w-6" />
      </div>

      {/* Search bar */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="relative">
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tracev2-subtle"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search services…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-tracev2-border bg-tracev2-card pl-9 pr-3 py-2 text-sm text-tracev2-text placeholder:text-tracev2-subtle focus:border-tracev2-accent/70 focus:outline-none"
          />
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex-shrink-0 flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
        {SERVICE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors duration-150 ${
              activeType === t
                ? 'bg-tracev2-accent text-white'
                : 'bg-tracev2-card text-tracev2-muted ring-1 ring-tracev2-border hover:text-tracev2-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Minors toggle */}
      <div className="flex-shrink-0 flex items-center gap-2 border-b border-tracev2-border px-4 pb-2.5">
        <button
          onClick={() => setMinorsOnly((m) => !m)}
          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${minorsOnly ? 'bg-tracev2-risk-medium' : 'bg-tracev2-border'}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${minorsOnly ? 'translate-x-4' : 'translate-x-0.5'}`}
          />
        </button>
        <span className="text-[11px] text-tracev2-muted">Services accepting minors only</span>
      </div>

      {/* Service list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {results.length === 0 && (
          <p className="pt-6 text-center text-sm text-tracev2-subtle">No services match your filters.</p>
        )}
        {results.map((svc) => {
          const isSelected = selected?.id === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => setSelected(isSelected ? null : svc)}
              className={`block w-full rounded-xl border p-3 text-start transition-all duration-150 ${
                isSelected
                  ? 'border-tracev2-accent bg-tracev2-accent/10 ring-1 ring-tracev2-accent/40'
                  : 'border-tracev2-border bg-tracev2-card hover:border-tracev2-accent/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-tracev2-text leading-snug">{svc.shortName}</div>
                  <div className="mt-0.5 text-[10px] text-tracev2-subtle">{svc.location}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <TypeBadge type={svc.type} />
                  {svc.forMinors && (
                    <span className="text-[9px] text-tracev2-risk-medium font-semibold">Accepts minors</span>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-tracev2-muted leading-relaxed line-clamp-2">{svc.description}</p>
              {svc.contact && (
                <div className="mt-1.5 text-[10px] text-tracev2-subtle font-mono">{svc.contact}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm bar — appears when a service is selected */}
      {selected && (
        <div className="flex-shrink-0 border-t border-tracev2-border bg-tracev2-card px-4 py-3">
          <div className="mb-2 text-[11px] text-tracev2-muted">
            Referral letter will be addressed to: <span className="font-semibold text-tracev2-text">{selected.shortName}</span>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full rounded-xl bg-tracev2-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-tracev2-accent/90"
          >
            Use in Referral Letter →
          </button>
        </div>
      )}
    </div>
  );
}
