import { useState } from 'react';
import VoiceTextIntake from './VoiceTextIntake.jsx';
import RiskFlag from './RiskFlag.jsx';
import ServiceSuggestions from './ServiceSuggestions.jsx';
import CtdcPanel from './CtdcPanel.jsx';
import DtmPanel from './DtmPanel.jsx';
import AcledPanel from './AcledPanel.jsx';
import MissingInfoPrompts from './MissingInfoPrompts.jsx';
import PortableRecordSetup from './PortableRecordSetup.jsx';
import FollowUpReminder from './FollowUpReminder.jsx';
import { getMissingIndicatorFields } from '../data/riskIndicators.js';
import { useI18n } from '../lib/i18n.jsx';

function Field({ field, value, onChange }) {
  const { t } = useI18n();
  const common = 'w-full bg-trace-900 border border-trace-700 rounded-md p-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-trace-accent';

  if (field.type === 'textarea') {
    return (
      <textarea
        dir="auto"
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={3}
        className={common}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} className={common}>
        <option value="">{t('Select...')}</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{t(opt)}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'date') {
    return (
      <input type="date" value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} className={common} />
    );
  }
  if (field.type === 'checkboxGroup') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${
                checked ? 'bg-trace-accent border-trace-accent text-white' : 'bg-trace-900 border-trace-700 text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={() => {
                  const next = checked ? selected.filter((o) => o !== opt) : [...selected, opt];
                  onChange(field.key, next);
                }}
              />
              {t(opt)}
            </label>
          );
        })}
      </div>
    );
  }
  return (
    <input
      dir="auto"
      type="text"
      value={value || ''}
      onChange={(e) => onChange(field.key, e.target.value)}
      className={common}
    />
  );
}

export default function ActiveForm({
  form, caseId, caseData, onFieldChange, onStructured, riskResult, services, onAskWhy,
  ctdcMatches, dtmContext, acledEvents, onlineMode, portableRecord, onSavePortableRecord, onDeletePortableRecord,
  followUpReminder, onToggleFollowUp, onStartDemo
}) {
  const { t } = useI18n();
  const [fieldsOpen, setFieldsOpen] = useState(true);

  if (!form) {
    return (
      <div data-tutorial="active-form" className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-3">
        <p>{t('Select a form above to start a new case, or open an existing one.')}</p>
        <button
          onClick={onStartDemo}
          className="px-4 py-2 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500"
        >
          🎬 {t('Try Demo Mode')}
        </button>
        <p className="text-xs text-slate-600 max-w-xs">{t('Loads a prefilled sample case so you can try the full flow without entering real data.')}</p>
      </div>
    );
  }

  return (
    <section data-tutorial="active-form" className="flex-shrink-0 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-100">{t(form.name)}</h2>
      </div>

      <VoiceTextIntake form={form} onStructured={onStructured} onlineMode={onlineMode} />

      {form.riskEligible && <RiskFlag riskResult={riskResult} onAskWhy={onAskWhy} caseId={caseId} />}

      {form.riskEligible && (
        <FollowUpReminder reminder={followUpReminder} onToggle={onToggleFollowUp} />
      )}

      {form.riskEligible && (
        <MissingInfoPrompts missingFields={getMissingIndicatorFields(caseData, form)} />
      )}

      {form.riskEligible && (
        <>
          <CtdcPanel records={ctdcMatches} />
          <DtmPanel context={dtmContext} />
          <AcledPanel events={acledEvents} />
        </>
      )}

      <ServiceSuggestions services={services} />

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{t('Case fields')}</h3>
        <button onClick={() => setFieldsOpen(!fieldsOpen)} className="text-slate-500 hover:text-slate-300 text-xs flex-shrink-0">
          {fieldsOpen ? '▲' : '▼'}
        </button>
      </div>

      {fieldsOpen && (
        <div data-tutorial="form-fields" className="space-y-3 pb-2">
          {form.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t(field.label)}{field.required && <span className="text-red-400"> *</span>}
              </label>
              <Field field={field} value={caseData[field.key]} onChange={onFieldChange} />
            </div>
          ))}
        </div>
      )}

      <PortableRecordSetup
        portableRecord={portableRecord}
        onSave={onSavePortableRecord}
        onDelete={onDeletePortableRecord}
      />
    </section>
  );
}
