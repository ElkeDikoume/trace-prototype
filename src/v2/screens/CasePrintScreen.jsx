// Print-optimized case summary — a full-screen, white-background, dark-text
// overlay opened from the case view's "⎙ Export" button. Deliberately theme-
// independent (forces its own light palette via inline styles) so browser print
// output is legible regardless of the app's dark/light mode. window.print()
// prints just this overlay; the "← Back" button returns to the case view.

// Fields shown in the two-column grid. `ctdc_indicators`, `summary` and the
// internal `reviewed_fields` are handled separately (or skipped), so they're
// excluded here.
const FIELD_LABELS = {
  case_type: 'Case Type',
  age_range: 'Age Range',
  sex: 'Sex',
  detected_language: 'Detected Language',
  recruitment_method: 'Recruitment Method',
  control_method: 'Control Method',
  exploitation_type: 'Exploitation Type',
  location: 'Location',
  nationality: 'Nationality',
  destination: 'Destination',
  trafficking_type: 'Trafficking Type'
};

const SKIP_FIELDS = new Set(['ctdc_indicators', 'summary', 'reviewed_fields', 'risk_level']);

const RISK_TEXT = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
const RISK_COLOR = { high: '#dc2626', medium: '#d97706', low: '#059669' };

function humanize(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sexLabel(v) {
  if (v === 'F') return 'Female';
  if (v === 'M') return 'Male';
  return v;
}

export default function CasePrintScreen({ caseData, onBack }) {
  const s = caseData?.structuredData || {};
  const risk = caseData?.riskLevel || s.risk_level || 'medium';
  const indicators = (s.ctdc_indicators?.length ? s.ctdc_indicators : caseData?.ctdcIndicators) || [];
  const tasks = caseData?.follow_up_tasks || [];
  const isoDate = new Date().toISOString().slice(0, 10);

  // All non-null structuredData scalar fields, in a stable order (known fields
  // first, then any extras), formatted for the two-column grid.
  const gridEntries = [];
  const seen = new Set();
  for (const key of Object.keys(FIELD_LABELS)) {
    const val = s[key];
    if (val != null && val !== '' && typeof val !== 'object') {
      gridEntries.push({ label: FIELD_LABELS[key], value: key === 'sex' ? sexLabel(val) : String(val) });
      seen.add(key);
    }
  }
  for (const [key, val] of Object.entries(s)) {
    if (seen.has(key) || SKIP_FIELDS.has(key)) continue;
    if (val != null && val !== '' && typeof val !== 'object') {
      gridEntries.push({ label: humanize(key), value: String(val) });
    }
  }

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col overflow-y-auto scrollbar-thin"
      style={{ background: '#ffffff', color: '#1e293b', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      {/* Top bar — hidden when printing */}
      <div className="no-print sticky top-0 flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium" style={{ color: '#475569' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Case summary</span>
      </div>

      {/* Printable body */}
      <div className="flex-1 px-6 py-5">
        {/* Header: title + case ID / status */}
        <div className="mb-5 flex items-start justify-between border-b pb-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <div className="text-lg font-bold tracking-tight" style={{ color: '#0f172a' }}>TRACE Case Summary</div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: '#0f172a' }}>{caseData?.id || '—'}</div>
          </div>
          <div className="text-end">
            <span
              className="inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: RISK_COLOR[risk], borderColor: RISK_COLOR[risk] }}
            >
              {RISK_TEXT[risk] || 'MEDIUM'} RISK
            </span>
            <div className="mt-1.5 text-xs font-medium" style={{ color: '#475569' }}>
              {caseData?.status || 'active'}
            </div>
          </div>
        </div>

        {/* Demographics */}
        <section className="mb-5">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Demographics</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Age" value={s.age_range || caseData?.ageRange} />
            <Field label="Sex" value={sexLabel(s.sex || caseData?.sex)} />
          </div>
        </section>

        {/* Risk + CTDC indicators (present only) */}
        <section className="mb-5">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
            Risk &amp; CTDC Indicators
          </h2>
          <div className="mb-2 text-sm" style={{ color: '#1e293b' }}>
            Risk level:{' '}
            <span className="font-bold" style={{ color: RISK_COLOR[risk] }}>{RISK_TEXT[risk] || 'MEDIUM'}</span>
          </div>
          {indicators.length ? (
            <ul className="space-y-1">
              {indicators.map((ind) => (
                <li key={ind} className="flex items-start gap-2 text-sm" style={{ color: '#1e293b' }}>
                  <span aria-hidden="true" style={{ color: '#059669' }}>✓</span>
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic" style={{ color: '#94a3b8' }}>No indicators recorded.</p>
          )}
        </section>

        {/* Structured data — two-column grid */}
        {gridEntries.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Case Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {gridEntries.map((e) => (
                <Field key={e.label} label={e.label} value={e.value} />
              ))}
            </div>
          </section>
        )}

        {/* Summary (full width) */}
        {s.summary && (
          <section className="mb-5">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Summary</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#1e293b' }}>{s.summary}</p>
          </section>
        )}

        {/* Follow-up tasks with checkboxes */}
        {tasks.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Follow-up Tasks</h2>
            <ul className="space-y-1.5">
              {tasks.map((tk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#1e293b' }}>
                  <span
                    className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border text-[10px] font-bold"
                    style={{ borderColor: '#94a3b8', color: '#059669' }}
                  >
                    {tk.done ? '✓' : ''}
                  </span>
                  <span className={tk.done ? 'line-through' : ''} style={tk.done ? { color: '#94a3b8' } : undefined}>
                    {tk.task}
                    {tk.due && <span style={{ color: '#94a3b8' }}> · {tk.due}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <div className="mt-6 border-t pt-3 text-center text-[11px]" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
          Generated by TRACE · Confidential · {isoDate}
        </div>
      </div>

      {/* Print action — hidden when printing */}
      <div className="no-print sticky bottom-0 border-t px-6 py-3" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
        <button
          onClick={() => window.print()}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
          style={{ background: '#3b4fd8' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{label}</div>
      <div className="text-sm" style={{ color: value ? '#1e293b' : '#cbd5e1' }}>{value || 'Not recorded'}</div>
    </div>
  );
}
