import { useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { listTemplates, saveTemplate, deleteTemplate } from '../lib/templateStorage.js';
import { buildTemplateData, generateFromTemplate, downloadBlob } from '../lib/templateEngine.js';

const EXAMPLE_PLACEHOLDERS = [
  'survivor_name', 'origin_country', 'risk_score', 'risk_level', 'current_location', 'age', 'gender', 'nationality'
];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function TemplatesPanel({ caseRecord, form, riskResult, services }) {
  const { t } = useI18n();
  const [templates, setTemplates] = useState(() => listTemplates());
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      await saveTemplate(file);
      setTemplates(listTemplates());
    } catch (err) {
      setUploadError(err.message || 'Failed to save the template.');
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id) {
    deleteTemplate(id);
    setTemplates(listTemplates());
  }

  async function handleGenerate(template) {
    setErrors((e) => ({ ...e, [template.id]: '' }));
    setBusyId(template.id);
    try {
      const data = buildTemplateData({ caseRecord, form, riskResult, services });
      const { blob, filename } = await generateFromTemplate(template, data);
      downloadBlob(blob, filename);
    } catch (err) {
      setErrors((e) => ({ ...e, [template.id]: err.message || 'Failed to generate this document.' }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 py-4 border-b border-trace-700">
      <h2 className="text-sm font-semibold text-slate-200">{t('Custom Templates')}</h2>
      <p className="text-xs text-slate-500 mb-1">
        {t('Upload your organization\'s own document templates, .docx files with {{placeholders}} or fillable PDF forms, and TRACE fills them in from this case.')}
      </p>
      <p className="text-[11px] text-slate-600 mb-3">
        {t('Example placeholders:')} {EXAMPLE_PLACEHOLDERS.map((p) => `{{${p}}}`).join(', ')}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf"
        className="hidden"
        onChange={handleFileSelected}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {uploading ? t('Uploading…') : `⬆ ${t('Upload Template')}`}
      </button>
      {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}

      {templates.length > 0 && (
        <div className="space-y-2 mt-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-trace-800 border border-trace-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">{tpl.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {tpl.kind.toUpperCase()} · {formatSize(tpl.sizeBytes)} · {new Date(tpl.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap text-trace-accent bg-trace-accent/10 border-trace-accent/30">
                  {tpl.kind === 'docx' ? 'Word' : 'PDF'}
                </span>
              </div>

              {errors[tpl.id] && <p className="text-xs text-red-400 mt-2">{errors[tpl.id]}</p>}

              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => handleGenerate(tpl)}
                  disabled={!caseRecord || busyId === tpl.id}
                  title={!caseRecord ? t('Open a case to generate documents.') : undefined}
                  className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {busyId === tpl.id ? t('Generating…') : `✨ ${t('Generate')}`}
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="text-xs px-2 py-1 rounded text-slate-400 hover:text-red-400"
                >
                  {t('Delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
