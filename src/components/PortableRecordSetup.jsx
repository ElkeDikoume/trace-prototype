import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generateCaseLocator, hashAccessPhrase } from '../lib/portableRecord.js';
import { useI18n } from '../lib/i18n.jsx';

const WALKTHROUGH = [
  'Ask the survivor for three things they will always remember, a name, a place, and a year.',
  'Enter them here.',
  'TRACE generates a secure code, the words are never saved.',
  'Coach the survivor: "If you ever need to access your record at another organization, give them these three things."'
];

export default function PortableRecordSetup({ portableRecord, onSave, onDelete }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(!portableRecord);
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [year, setYear] = useState('');
  const [preferredName, setPreferredName] = useState(portableRecord?.preferredName || '');
  const [preferredLanguage, setPreferredLanguage] = useState(portableRecord?.preferredLanguage || '');
  const [organizations, setOrganizations] = useState(portableRecord?.organizations || '');
  const [urgentNeeds, setUrgentNeeds] = useState(portableRecord?.urgentNeeds || '');
  const [consentTerms, setConsentTerms] = useState(portableRecord?.consentTerms || '');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (portableRecord?.locatorCode) {
      QRCode.toDataURL(portableRecord.locatorCode, { margin: 1, width: 176 }).then(setQrDataUrl);
    }
  }, [portableRecord?.locatorCode]);

  async function handleSave() {
    const wordsGiven = [name.trim(), place.trim(), year.trim()].filter(Boolean).length;
    if (wordsGiven > 0 && wordsGiven < 3) {
      setError(t('Enter all three memory words, or leave all three blank to keep the current access phrase.'));
      return;
    }
    if (wordsGiven === 0 && !portableRecord?.accessHash) {
      setError(t('Enter the three memory words to generate this record for the first time.'));
      return;
    }

    setBusy(true);
    setError('');
    try {
      const accessHash = wordsGiven === 3 ? await hashAccessPhrase(name, place, year) : portableRecord.accessHash;
      const locatorCode = portableRecord?.locatorCode || generateCaseLocator();
      const record = {
        locatorCode,
        accessHash,
        preferredName,
        preferredLanguage,
        organizations,
        urgentNeeds,
        consentTerms,
        createdAt: portableRecord?.createdAt || Date.now()
      };
      const dataUrl = await QRCode.toDataURL(locatorCode, { margin: 1, width: 176 });
      setQrDataUrl(dataUrl);
      onSave(record);
      setName('');
      setPlace('');
      setYear('');
      setEditing(false);
    } catch {
      setError(t('Failed to generate the record. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!window.confirm(t("Delete this portable record at the survivor's request? This cannot be undone."))) return;
    onDelete();
    setEditing(true);
  }

  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">🔗 {t('Portable case record')}</h3>
        <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-slate-200 text-xs flex-shrink-0">
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
      <>
      {!editing && portableRecord && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            {qrDataUrl && <img src={qrDataUrl} alt={t('Case locator QR code')} className="rounded bg-white p-1 w-20 h-20" />}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('Case locator (caseworker-held only)')}</div>
              <div className="text-lg font-mono font-bold text-trace-accent">{portableRecord.locatorCode}</div>
              <p className="text-[11px] text-slate-500 mt-1">{t('Store separately from the survivor. Photograph and file with the paper case record.')}</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1 mb-3">
            <div><span className="text-slate-300 font-medium">{t('Preferred name:')}</span> {portableRecord.preferredName || '-'}</div>
            <div><span className="text-slate-300 font-medium">{t('Preferred language:')}</span> {portableRecord.preferredLanguage || '-'}</div>
            <div><span className="text-slate-300 font-medium">{t('Organizations involved:')}</span> {portableRecord.organizations || '-'}</div>
            <div><span className="text-slate-300 font-medium">{t('Pre-authorized urgent needs:')}</span> {portableRecord.urgentNeeds || '-'}</div>
            <div><span className="text-slate-300 font-medium">{t('Consent terms:')}</span> {portableRecord.consentTerms || '-'}</div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded bg-trace-700 border border-trace-600 text-slate-200 hover:bg-trace-600">
              {t('Edit')}
            </button>
            <button onClick={handleDelete} className="text-xs px-2 py-1 rounded bg-trace-risk-high/15 border border-trace-risk-high text-trace-risk-high hover:bg-trace-risk-high/25">
              {t('Delete this record')}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div>
          <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1 mb-3 bg-trace-900 border border-trace-700 rounded-md p-2">
            {WALKTHROUGH.map((step, i) => <li key={i}>{t(step)}</li>)}
          </ol>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Name')} dir="auto"
              className="bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t('Place')} dir="auto"
              className="bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t('Year')}
              className="bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
          </div>
          {portableRecord?.accessHash && (
            <p className="text-[11px] text-slate-500 mb-2">{t("Leave the three fields blank to keep the survivor's existing access phrase.")}</p>
          )}

          <div className="space-y-2 mb-2">
            <input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} placeholder={t('Preferred name')} dir="auto"
              className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} placeholder={t('Preferred language')} dir="auto"
              className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <input value={organizations} onChange={(e) => setOrganizations(e.target.value)} placeholder={t('Organizations previously involved')} dir="auto"
              className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <textarea value={urgentNeeds} onChange={(e) => setUrgentNeeds(e.target.value)} placeholder={t('Urgent medical/protection needs the survivor pre-authorized to share')} rows={2} dir="auto"
              className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
            <textarea value={consentTerms} onChange={(e) => setConsentTerms(e.target.value)} placeholder={t('Consent terms (what the survivor agreed to share)')} rows={2} dir="auto"
              className="w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trace-accent" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={busy}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50">
              {busy ? t('Generating…') : `🔒 ${t('Generate secure record')}`}
            </button>
            {portableRecord && (
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-slate-100">
                {t('Cancel')}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}
      </>
      )}
    </div>
  );
}
