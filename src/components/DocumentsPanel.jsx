import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType } from 'docx';
import { useI18n } from '../lib/i18n.jsx';
import PatternAlertsBanner from './PatternAlertsBanner.jsx';
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

const PROTOCOL_QUESTIONS = [
  {
    label: 'Trafficking indicators',
    question: 'What are the key CTDC trafficking indicators a caseworker should look for during intake? List them with brief explanations.'
  },
  {
    label: 'Unaccompanied minors',
    question: 'What does IOM protocol say about case handling procedures for unaccompanied minors in West and Central Africa?'
  },
  {
    label: 'When to escalate',
    question: 'When should a caseworker escalate a case to a supervisor, and what is the standard escalation procedure under IOM guidelines?'
  }
];

const PATTERN_REPORT_PROMPT = "Generate a pattern intelligence briefing report for my supervisor. Base it on these caseload alerts: (1) 'Alhaji Moussa Transport & Logistics' named as recruiter in 3 cases in Diffa/Niamey since June 2026; (2) 5 cases recruited through the same WhatsApp broker group in the Zinder–Agadez corridor; (3) Debt bondage indicators among Niamey domestic-worker cases up 40% quarter-over-quarter. Format as a structured supervisor briefing document with an executive summary, pattern details, recommended actions, and a note that all data is de-identified.";

// Printed in the header and footer of every downloaded .docx, on top of the
// watermark Claude is instructed to write into the text itself (see
// DOCUMENT_WATERMARK_INSTRUCTION in claudeClient.js), so the warning survives
// even if a caseworker edits the AI's own header/footer lines out.
const WATERMARK_TEXT = '⚠️ DEMO PROTOTYPE — NOT REAL CASE DATA — Austin AI Hub Hackathon 2026';

function caseLabelText(caseRecord) {
  return caseRecord?.data?.fullName || caseRecord?.data?.clientIdentifier || caseRecord?.data?.survivorIdentifier || caseRecord?.data?.caseId || 'Untitled case';
}

function slugifyDocType(title) {
  return title.trim().replace(/[^a-zA-Z0-9]+/g, '');
}

function watermarkParagraph() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: WATERMARK_TEXT, italics: true, color: '999999', size: 18 })]
  });
}

async function downloadDocxFile(filename, content) {
  const doc = new Document({
    sections: [
      {
        headers: { default: new Header({ children: [watermarkParagraph()] }) },
        footers: { default: new Footer({ children: [watermarkParagraph()] }) },
        children: content.split('\n').map((line) => new Paragraph({ children: [new TextRun(line)] }))
      }
    ]
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function askTrace(question, delay) {
  window.__traceOpenChatbot?.();
  setTimeout(() => {
    window.__traceAskDemo?.(question);
  }, delay);
}

function StatusBadge({ hasContent, t }) {
  return hasContent ? (
    <span className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap text-trace-accent bg-trace-accent/10 border-trace-accent/30">
      {t('Draft ready')}
    </span>
  ) : (
    <span className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap text-slate-500 bg-trace-800 border-trace-700">
      {t('Not started')}
    </span>
  );
}

export default function DocumentsPanel({ caseRecord, form, riskResult, services, onSaveDocument, patternAlerts }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState({});
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState({});

  const documents = caseRecord?.documents || {};

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

  function handleDownloadCaseRecord() {
    const header = `${form.name} — ${caseLabelText(caseRecord)}\n\n`;
    const body = form.fields
      .map((f) => `${f.label}: ${caseRecord.data?.[f.key] || '—'}`)
      .join('\n');
    downloadDocxFile('TRACE_CaseRecord_DEMO.docx', header + body);
  }

  function handleDownloadDoc(docDef, content) {
    downloadDocxFile(`TRACE_${slugifyDocType(docDef.title)}_DEMO.docx`, content);
  }

  return (
    <section data-tutorial="documents-panel" className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      {/* SECTION 1 — Case Outputs */}
      <div className="px-4 py-4 border-b border-trace-700">
        <h2 className="text-sm font-semibold text-slate-200">{t('Case Outputs')}</h2>
        <p className="text-xs text-slate-500 mb-3">{t('TRACE-generated from this case — review before sending.')}</p>

        {!caseRecord ? (
          <p className="text-sm text-slate-500 text-center py-6">{t('Open a case to generate documents.')}</p>
        ) : (
          <div className="space-y-3">
            {DOC_TYPES.map((docDef) => {
              const hasContent = docDef.key === 'caseRecord' ? true : !!documents[docDef.key]?.content;
              const content = documents[docDef.key]?.content || '';
              const isBusy = !!busy[docDef.key];

              return (
                <div key={docDef.key} className="bg-trace-800 border border-trace-700 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-100">{t(docDef.title)}</div>
                      <div className="text-xs text-slate-400">{t(docDef.description)}</div>
                    </div>
                    <StatusBadge hasContent={hasContent} t={t} />
                  </div>

                  {docDef.key === 'caseRecord' ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleDownloadCaseRecord}
                        className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500"
                      >
                        ⬇ {t('Download')}
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
                                onClick={() => handleDownloadDoc(docDef, content)}
                                className="text-xs px-2 py-1 rounded bg-trace-700 border border-trace-600 text-slate-200 hover:bg-trace-600"
                              >
                                ⬇ {t('Download')}
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
        )}
      </div>

      {/* SECTION 2 — Caseload Patterns */}
      <div className="px-4 py-4 border-b border-trace-700">
        <h2 className="text-sm font-semibold text-slate-200">{t('Caseload Patterns')}</h2>
        <p className="text-xs text-slate-500 mb-3">{t("Detected across your organization's cases — for supervisor review only.")}</p>

        <PatternAlertsBanner alerts={patternAlerts} />

        <button
          onClick={() => askTrace(PATTERN_REPORT_PROMPT, 300)}
          className="w-full mt-3 py-2 text-xs font-medium bg-trace-800 border border-trace-700 text-slate-300 hover:text-white hover:bg-trace-700 rounded-lg transition-colors"
        >
          📊 {t('Generate Pattern Report for Supervisor')}
        </button>
      </div>

      {/* SECTION 3 — Protocol Reference */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-200">{t('Protocol Reference')}</h2>
        <p className="text-xs text-slate-500 mb-3">{t('Ask TRACE about IOM guidelines, indicators, and procedures.')}</p>

        <div className="flex flex-wrap gap-2">
          {PROTOCOL_QUESTIONS.map((p) => (
            <button
              key={p.label}
              onClick={() => askTrace(p.question, 200)}
              className="bg-trace-800 border border-trace-700 text-slate-300 hover:text-white hover:bg-trace-700 text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              {t(p.label)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
