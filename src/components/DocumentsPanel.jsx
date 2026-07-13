import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import {
  generateReferralLetter,
  generateCaseSummary,
  generateIomMonthlyReturnEntry,
  generateMissingInfoReport,
  generateFollowUpPlan
} from '../lib/claudeClient.js';

const DOC_TYPES = [
  {
    key: 'caseRecord',
    title: 'Case Record',
    description: 'Structured IOM HTCDS intake form.',
    generated: false,
    editable: false,
    downloadable: true,
    copyable: false
  },
  {
    key: 'referralLetter',
    title: 'Referral Letter',
    description: 'AI-drafted referral to a service provider, editable before sending.',
    generated: true,
    editable: true,
    downloadable: true,
    copyable: true,
    generate: generateReferralLetter
  },
  {
    key: 'caseSummary',
    title: 'Case Summary',
    description: '3-paragraph narrative for supervision, handoff, or file notes.',
    generated: true,
    editable: true,
    downloadable: true,
    copyable: true,
    generate: generateCaseSummary
  },
  {
    key: 'iomMonthlyReturn',
    title: 'IOM Monthly Return Entry',
    description: 'This case formatted for IOM monthly caseload reporting.',
    generated: true,
    editable: true,
    downloadable: true,
    copyable: true,
    generate: generateIomMonthlyReturnEntry
  },
  {
    key: 'missingInfoReport',
    title: 'Missing Information Report',
    description: "What's still needed for a complete CTDC risk assessment.",
    generated: true,
    editable: false,
    downloadable: false,
    copyable: true,
    generate: generateMissingInfoReport
  },
  {
    key: 'followUpPlan',
    title: 'Follow-up Plan',
    description: 'Recommended next steps for the next 7–14 days based on risk level.',
    generated: true,
    editable: true,
    downloadable: true,
    copyable: true,
    generate: generateFollowUpPlan
  }
];

function caseLabelText(caseRecord) {
  return caseRecord?.data?.fullName || caseRecord?.data?.clientIdentifier || caseRecord?.data?.survivorIdentifier || caseRecord?.data?.caseId || 'Untitled case';
}

function StatusBadge({ status, t }) {
  const map = {
    not_generated: { label: 'Not generated', cls: 'bg-trace-800 border-trace-700 text-slate-400' },
    draft: { label: 'Draft', cls: 'bg-trace-risk-medium/15 border-trace-risk-medium text-trace-risk-medium' },
    ready: { label: 'Ready', cls: 'bg-trace-risk-low/15 border-trace-risk-low text-trace-risk-low' }
  };
  const s = map[status] || map.not_generated;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap ${s.cls}`}>{t(s.label)}</span>;
}

export default function DocumentsPanel({ caseRecord, form, riskResult, services, onSaveDocument }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState({});
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState({});
  const [printPayload, setPrintPayload] = useState(null);

  if (!caseRecord) {
    return (
      <section data-tutorial="documents-panel" className="flex-1 min-h-0 flex items-center justify-center px-4 py-4">
        <p className="text-sm text-slate-500 text-center max-w-xs">{t('Open or start a case to generate documents.')}</p>
      </section>
    );
  }

  const documents = caseRecord.documents || {};

  async function handleGenerate(docDef) {
    setBusy((b) => ({ ...b, [docDef.key]: true }));
    setErrors((e) => ({ ...e, [docDef.key]: '' }));
    try {
      const content = await docDef.generate({ caseData: caseRecord.data, form, riskResult, services });
      onSaveDocument(docDef.key, content, docDef.editable ? 'draft' : 'ready');
    } catch (err) {
      setErrors((e) => ({ ...e, [docDef.key]: err.message || 'Failed to generate document.' }));
    } finally {
      setBusy((b) => ({ ...b, [docDef.key]: false }));
    }
  }

  async function handleCopy(key, text) {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied((c) => ({ ...c, [key]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — button simply won't flash.
    }
  }

  function handlePrint(payload) {
    setPrintPayload(payload);
    setTimeout(() => window.print(), 50);
  }

  function handlePrintCaseRecord() {
    const fields = form.fields.map((f) => [f.label, caseRecord.data?.[f.key] || '']);
    handlePrint({ title: `${form.name} — ${caseLabelText(caseRecord)}`, fields });
  }

  return (
    <section data-tutorial="documents-panel" className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-100">{t('Case documents')}</h2>
        <p className="text-xs text-slate-500">{t('Every document is a draft. Review, edit, and download before it leaves this case.')}</p>
      </div>

      <div className="space-y-3 pb-4">
        {DOC_TYPES.map((docDef) => {
          const doc = documents[docDef.key];
          const status = docDef.key === 'caseRecord' ? 'ready' : doc?.content ? doc.status || 'draft' : 'not_generated';
          const content = doc?.content || '';
          const isBusy = !!busy[docDef.key];

          return (
            <div key={docDef.key} className="bg-trace-800 border border-trace-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-slate-100">{t(docDef.title)}</div>
                  <div className="text-xs text-slate-400">{t(docDef.description)}</div>
                </div>
                <StatusBadge status={status} t={t} />
              </div>

              {docDef.key === 'caseRecord' ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handlePrintCaseRecord}
                    className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500"
                  >
                    ⬇ {t('Download PDF')}
                  </button>
                </div>
              ) : (
                <>
                  {!content && (
                    <button
                      onClick={() => handleGenerate(docDef)}
                      disabled={isBusy}
                      className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50 mt-2"
                    >
                      {isBusy ? t('Generating…') : `✨ ${t('Generate')}`}
                    </button>
                  )}
                  {errors[docDef.key] && <p className="text-xs text-red-400 mt-1">{errors[docDef.key]}</p>}

                  {content && (
                    <div className="mt-2">
                      {docDef.editable ? (
                        <>
                          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{t('AI draft — edit before sending.')}</div>
                          <textarea
                            dir="auto"
                            value={content}
                            onChange={(e) => onSaveDocument(docDef.key, e.target.value, 'ready')}
                            rows={6}
                            className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-trace-accent"
                          />
                        </>
                      ) : (
                        <ul className="text-xs text-slate-200 space-y-1 bg-trace-900 border border-trace-700 rounded-md p-2 list-disc list-inside">
                          {content.split('\n').filter((l) => l.trim()).map((line, i) => (
                            <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
                          ))}
                        </ul>
                      )}

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {docDef.downloadable && (
                          <button
                            onClick={() => handlePrint({ title: docDef.title, text: content })}
                            className="text-xs px-2 py-1 rounded bg-trace-700 border border-trace-600 text-slate-200 hover:bg-trace-600"
                          >
                            ⬇ {t('Download as PDF')}
                          </button>
                        )}
                        {docDef.copyable && (
                          <button
                            onClick={() => handleCopy(docDef.key, content)}
                            className="text-xs px-2 py-1 rounded bg-trace-700 border border-trace-600 text-slate-200 hover:bg-trace-600"
                          >
                            {copied[docDef.key] ? `✓ ${t('Copied')}` : t('Copy')}
                          </button>
                        )}
                        <button
                          onClick={() => handleGenerate(docDef)}
                          disabled={isBusy}
                          className="text-xs px-2 py-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-50"
                        >
                          {isBusy ? t('Regenerating…') : `↻ ${t('Regenerate')}`}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Off-screen print buffer: repositioned on top by the @media print rule
          in index.css so window.print() renders only this document's content,
          not the whole app chrome. */}
      <div className="print-area" style={{ position: 'absolute', left: '-9999px', top: 0, width: '700px' }}>
        {printPayload && (
          <>
            <h1 style={{ fontSize: 18, marginBottom: 4 }}>{printPayload.title}</h1>
            <p style={{ fontSize: 11, color: '#666', marginBottom: 24 }}>
              {t('Generated by TRACE (demo prototype)')} · {new Date().toLocaleString()}
            </p>
            {printPayload.fields ? (
              printPayload.fields.map(([label, value]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', color: '#555' }}>{t(label)}</div>
                  <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{value || '—'}</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{printPayload.text}</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
