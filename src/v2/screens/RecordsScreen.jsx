// Records tab — a standalone document library. Nothing here depends on an open
// case: the archive carries its own case references, and new documents are
// generated through a 3-step sheet that picks the case itself.
import { useState } from 'react';
import { useToast } from '../lib/ToastContext.jsx';

// ---------------------------------------------------------------------------
// Document kinds — icon, circle colour and filter label all keyed off `type`.
// ---------------------------------------------------------------------------
export const DOC_KINDS = {
  vca: { label: 'VCA Report', icon: '✦', circle: 'bg-indigo-500/20 text-indigo-300' },
  situation: { label: 'Situation Report', icon: '📋', circle: 'bg-amber-500/20 text-amber-300' },
  referral: { label: 'Referral Letter', icon: '📨', circle: 'bg-emerald-500/20 text-emerald-300' },
  alert: { label: 'Cluster Alert', icon: '🔔', circle: 'bg-red-500/20 text-red-300' }
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'vca', label: 'VCA Reports' },
  { id: 'situation', label: 'Situation Reports' },
  { id: 'referral', label: 'Referral Letters' },
  { id: 'alert', label: 'Cluster Alerts' }
];

// Cases offered in step 1 of the generate flow.
const CASE_OPTIONS = [
  { id: '#0043', place: 'Koura Village', location: 'Koura Village, Diffa' },
  { id: '#0042', place: 'Toumour Pastoral Camp', location: 'Toumour Pastoral Camp, Diffa' },
  { id: '#0039', place: 'Garin Wanzam', location: 'Garin Wanzam, Maradi' },
  { id: '#0037', place: 'Bosso North Quarter', location: 'Bosso North Quarter, Diffa' },
  { id: '#0031', place: 'Baroua', location: 'Baroua, Diffa' }
];

const DOC_OPTIONS = [
  { type: 'vca', blurb: 'Full vulnerability assessment, cluster-ready' },
  { type: 'situation', blurb: 'Narrative summary for coordination' },
  { type: 'referral', blurb: 'Formal referral to partner agency' },
  { type: 'alert', blurb: 'Alert to sector cluster coordinators' }
];

const LANGUAGES = [
  { id: 'en', label: 'English', primary: true },
  { id: 'fr', label: 'Français', primary: true },
  { id: 'ha', label: 'Hausa', primary: false },
  { id: 'sw', label: 'Swahili', primary: false }
];

// Pre-populated archive, most recent first. Exported so other surfaces (the AI
// tab's Recent activity list) can preview the same documents.
export const MOCK_DOCUMENTS = [
  {
    id: 'doc-0043-vca',
    type: 'vca',
    caseRef: '#0043',
    location: 'Koura Village, Diffa',
    date: '20 Jul 2026',
    preview: `Assessment conducted 20 July 2026. Community: Koura Village, Diffa Region.
Household count: 340. Primary hazard: seasonal flooding. Risk level: HIGH.
Early warning infrastructure: absent. Recommended actions: convene DRR
committee within 48h, coordinate shelter pre-positioning with OCHA Diffa.`
  },
  {
    id: 'doc-0042-situation',
    type: 'situation',
    caseRef: '#0042',
    location: 'Toumour Pastoral Camp, Diffa',
    date: '19 Jul 2026',
    preview: `Reporting period 18–19 July 2026. Site: Toumour Pastoral Camp, Diffa Region.
Active displacement of 847 individuals arriving over a 72-hour window.
MUAC screening not yet completed; no WASH infrastructure on site. Security
incident reported in the surrounding area. Three follow-up tasks overdue.`
  },
  {
    id: 'doc-0039-referral',
    type: 'referral',
    caseRef: '#0039',
    location: 'Garin Wanzam, Maradi',
    date: '18 Jul 2026',
    note: 'GBV case manager',
    preview: `Referral issued 18 July 2026 to the GBV case manager, Garin Wanzam, Maradi.
Protection concerns flagged by a community leader; GBV referral pathway not
yet activated and no female caseworker available on site. Services requested:
protection assessment, specialised GBV case management, legal aid.`
  },
  {
    id: 'doc-cluster-wash',
    type: 'alert',
    caseRef: 'WASH',
    location: 'Diffa region',
    date: '18 Jul 2026',
    note: 'sent to OCHA',
    preview: `Cluster alert raised 18 July 2026 — WASH sector, Diffa Region. Sent to OCHA.
340 households without WASH access at Koura Village; no WASH infrastructure at
Toumour Pastoral Camp serving 847 newly displaced individuals. Requested:
emergency water trucking and latrine construction within 7 days.`
  },
  {
    id: 'doc-0037-vca',
    type: 'vca',
    caseRef: '#0037',
    location: 'Bosso North Quarter, Diffa',
    date: '15 Jul 2026',
    preview: `Assessment conducted 15 July 2026. Community: Bosso North Quarter, Diffa Region.
Overcrowded host community site; 12 households without documentation.
Risk level: LOW. Coping capacity: host families absorbing arrivals, stable.
Recommended actions: documentation clinic, monitor site density monthly.`
  },
  {
    id: 'doc-0031-situation',
    type: 'situation',
    caseRef: '#0031',
    location: 'Baroua, Diffa',
    date: '14 Jul 2026',
    preview: `Reporting period week of 14 July 2026. Site: Baroua, Diffa Region.
Intake documentation pending; no follow-up session yet scheduled. Fulfulde
interpreter required before the assessment can be completed. No new arrivals
recorded this period. Recommended: book interpreter within 48h.`
  }
];

const today = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Shared bottom-sheet shell
// ---------------------------------------------------------------------------
function Sheet({ children, onClose }) {
  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-50 max-h-[85%] overflow-y-auto scrollbar-thin rounded-t-2xl bg-white p-6 text-gray-900 shadow-2xl">
        {children}
      </div>
    </>
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="absolute right-4 top-4 text-gray-400 transition-colors duration-150 hover:text-gray-700"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Preview sheet
// ---------------------------------------------------------------------------
export function DocumentPreviewModal({ doc, onClose, onShare }) {
  const kind = DOC_KINDS[doc.type];
  return (
    <Sheet onClose={onClose}>
      <div className="relative">
        <CloseButton onClose={onClose} />
        <h2 className="pr-8 text-base font-bold">{kind.label}</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          <span className="tabular-nums">{doc.caseRef}</span> · {doc.location} · {doc.date}
        </p>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{doc.preview}</p>
        </div>

        <p className="mt-3 text-[11px] leading-snug text-gray-500">
          AI-generated · Review all content before use · Caseworker approval required
        </p>

        <button
          onClick={() => onShare(doc)}
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
        >
          Share
        </button>
      </div>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Generate sheet — 3 steps
// ---------------------------------------------------------------------------
function GenerateDocModal({ onClose, onGenerated }) {
  const [step, setStep] = useState(1);
  const [caseId, setCaseId] = useState(null);
  const [docType, setDocType] = useState(null);
  const [lang, setLang] = useState('en');
  const [generating, setGenerating] = useState(false);

  const chosenCase = CASE_OPTIONS.find((c) => c.id === caseId);
  const chosenDoc = docType ? DOC_KINDS[docType] : null;

  function handleGenerate() {
    setGenerating(true);
    // Demo prototype: a 2-second generation beat, then the document lands.
    setTimeout(() => {
      onGenerated({
        id: `doc-${Date.now()}`,
        type: docType,
        caseRef: chosenCase.id,
        location: chosenCase.location,
        date: today(),
        preview: `Generated ${today()} · ${LANGUAGES.find((l) => l.id === lang).label}.
Community: ${chosenCase.location}. Prepared from case ${chosenCase.id} intake data,
follow-up tasks and recorded risk factors. Pending caseworker review before it is
shared with cluster partners.`
      });
    }, 2000);
  }

  const nextDisabled = (step === 1 && !caseId) || (step === 2 && !docType);

  return (
    <Sheet onClose={generating ? () => {} : onClose}>
      <div className="relative">
        {!generating && <CloseButton onClose={onClose} />}

        {generating ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            <p className="text-sm font-medium text-gray-700">Generating…</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Step {step} of 3</p>

            {step === 1 && (
              <>
                <h2 className="mt-0.5 pr-8 text-base font-bold">Which case?</h2>
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
                  {CASE_OPTIONS.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setCaseId(c.id)}
                        aria-pressed={caseId === c.id}
                        className={`w-full rounded-xl border px-4 py-3 text-start text-sm transition-colors duration-150 ${
                          caseId === c.id
                            ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="tabular-nums">{c.id}</span> · {c.place}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="mt-0.5 pr-8 text-base font-bold">What do you need?</h2>
                <div className="mt-3 space-y-2">
                  {DOC_OPTIONS.map((o) => {
                    const kind = DOC_KINDS[o.type];
                    return (
                      <button
                        key={o.type}
                        onClick={() => setDocType(o.type)}
                        aria-pressed={docType === o.type}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition-colors duration-150 ${
                          docType === o.type
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg" aria-hidden="true">
                          {kind.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{kind.label}</span>
                          <span className="block text-xs text-gray-500">{o.blurb}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="mt-0.5 pr-8 text-base font-bold">Generate document</h2>
                <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">{chosenDoc.label}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <span className="tabular-nums">{chosenCase.id}</span> · {chosenCase.location}
                  </p>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Language</p>
                <div className="mt-1.5 flex gap-2">
                  {LANGUAGES.filter((l) => l.primary).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        lang === l.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  {LANGUAGES.filter((l) => !l.primary).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={`flex-1 rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ${
                        lang === l.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
                >
                  Generate →
                </button>
              </>
            )}

            {step < 3 && (
              <div className="mt-5 flex items-center gap-2">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:border-gray-300"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={nextDisabled}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function RecordsScreen() {
  const { show } = useToast();
  const [docs, setDocs] = useState(MOCK_DOCUMENTS);
  const [filter, setFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  const visible = filter === 'all' ? docs : docs.filter((d) => d.type === filter);

  function handleShare(doc) {
    show(`${DOC_KINDS[doc.type].label} ${doc.caseRef} shared with partner agency.`, 'success');
  }

  function handleGenerated(doc) {
    setDocs((prev) => [doc, ...prev]);
    setGenerateOpen(false);
    show('Document generated and saved.', 'success');
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pb-2 pt-3">
        <h2 className="text-lg font-bold text-tracev2-text">Records</h2>
        <p className="text-xs text-tracev2-subtle">Documents generated by TRACE</p>
      </div>

      {/* Generate action */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="rounded-2xl border border-tracev2-border bg-tracev2-card p-3">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
          >
            <span aria-hidden="true">✦</span>
            Generate a new document
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex-shrink-0 overflow-x-auto scrollbar-none px-4 pb-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors duration-150 ${
                filter === f.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-3">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-tracev2-border bg-tracev2-card px-4 py-8 text-center text-xs text-tracev2-subtle">
            No documents of this type yet.
          </p>
        ) : (
          visible.map((d) => {
            const kind = DOC_KINDS[d.type];
            return (
              <div
                key={d.id}
                className="mb-3 flex items-center gap-3 rounded-xl border border-tracev2-border bg-tracev2-card p-4"
              >
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm ${kind.circle}`}
                  aria-hidden="true"
                >
                  {kind.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-tracev2-text">{kind.label}</p>
                  <p className="truncate text-xs text-tracev2-muted">
                    <span className="tabular-nums">{d.caseRef}</span> · {d.location}
                  </p>
                  <p className="text-xs text-tracev2-subtle">
                    {d.date}
                    {d.note && ` · ${d.note}`}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => setPreviewDoc(d)}
                    aria-label={`View ${kind.label} ${d.caseRef}`}
                    className="rounded-lg p-2 text-tracev2-subtle transition-colors duration-150 hover:bg-tracev2-bg hover:text-tracev2-accent"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare(d)}
                    aria-label={`Share ${kind.label} ${d.caseRef}`}
                    className="rounded-lg p-2 text-tracev2-subtle transition-colors duration-150 hover:bg-tracev2-bg hover:text-tracev2-accent"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewDoc && (
        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} onShare={handleShare} />
      )}
      {generateOpen && (
        <GenerateDocModal onClose={() => setGenerateOpen(false)} onGenerated={handleGenerated} />
      )}
    </div>
  );
}
