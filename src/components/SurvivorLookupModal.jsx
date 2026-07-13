import { useState } from 'react';
import { findCaseByAccessPhrase } from '../lib/portableRecord.js';
import { useI18n } from '../lib/i18n.jsx';

export default function SurvivorLookupModal({ open, onClose, cases, onDelete }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleSearch() {
    if (!name.trim() || !place.trim() || !year.trim()) return;
    setBusy(true);
    try {
      const match = await findCaseByAccessPhrase({ name, place, year }, cases);
      setResult(match);
      setSearched(true);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!result) return;
    if (!window.confirm(t("Delete this portable record at the survivor's request? This cannot be undone."))) return;
    onDelete(result.id);
    setResult(null);
    setSearched(false);
    setName('');
    setPlace('');
    setYear('');
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-trace-900 border border-trace-700 rounded-xl w-full max-w-sm max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-trace-700 sticky top-0 bg-trace-900">
          <h2 className="text-sm font-semibold text-slate-100">🔎 {t('Find portable record')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg leading-none">×</button>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-400 mb-3">
            {t('Simulates a survivor arriving at a new agency. Ask them for the three things they memorized, enter them exactly, and TRACE checks for a matching record, without ever seeing the original words stored anywhere.')}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Name')} dir="auto"
              className="bg-trace-800 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t('Place')} dir="auto"
              className="bg-trace-800 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t('Year')}
              className="bg-trace-800 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
          </div>

          <button onClick={handleSearch} disabled={busy}
            className="w-full px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50 mb-3">
            {busy ? t('Checking…') : t('Verify & look up')}
          </button>

          {searched && !result && (
            <p className="text-xs text-slate-400">{t('No matching portable record found for these three words.')}</p>
          )}

          {result && (
            <div className="bg-trace-800 border border-trace-700 rounded-lg p-3">
              <div className="text-xs text-trace-risk-low font-medium mb-2">✓ {t('Access phrase verified, portable summary below')}</div>
              <div className="text-xs text-slate-400 space-y-1 mb-3">
                <div><span className="text-slate-300 font-medium">{t('Preferred name:')}</span> {result.portableRecord.preferredName || '-'}</div>
                <div><span className="text-slate-300 font-medium">{t('Preferred language:')}</span> {result.portableRecord.preferredLanguage || '-'}</div>
                <div><span className="text-slate-300 font-medium">{t('Organizations involved:')}</span> {result.portableRecord.organizations || '-'}</div>
                <div><span className="text-slate-300 font-medium">{t('Pre-authorized urgent needs:')}</span> {result.portableRecord.urgentNeeds || '-'}</div>
                <div><span className="text-slate-300 font-medium">{t('Consent terms:')}</span> {result.portableRecord.consentTerms || '-'}</div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">{t('Full case notes are not shared here. A new consent conversation is required for full access.')}</p>
              <button onClick={handleDelete} className="text-xs px-2 py-1 rounded bg-trace-risk-high/15 border border-trace-risk-high text-trace-risk-high hover:bg-trace-risk-high/25">
                {t("Delete this record (survivor's request)")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
