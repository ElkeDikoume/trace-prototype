// "Structured preview" modal shown after Translate & Structure. Fields are the
// real Claude HTCDS output, presented as editable inputs so the caseworker can
// review/correct before saving to Supabase.
import { useEffect, useState } from 'react';

export default function StructuredPreviewModal({ open, onClose, onSave, fields = [], saving = false }) {
  const [edited, setEdited] = useState(fields);

  useEffect(() => {
    setEdited(fields);
  }, [fields]);

  if (!open) return null;

  const update = (i, value) => setEdited((prev) => prev.map((f, idx) => (idx === i ? { ...f, value } : f)));

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-h-[88%] overflow-y-auto scrollbar-thin rounded-t-2xl border-t border-tracev2-border bg-tracev2-card p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-tracev2-border" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-tracev2-text">Structured preview</h2>
            <p className="text-[11px] text-tracev2-subtle">AI-assisted (HTCDS). Review &amp; edit before saving.</p>
          </div>
          <span className="rounded-full bg-tracev2-accent/15 px-2 py-0.5 text-[10px] font-medium text-tracev2-accent">
            ✦ Claude
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {edited.map((f, i) => (
            <label key={f.label} className="block">
              <span className="text-[11px] uppercase tracking-wide text-tracev2-subtle">{f.label}</span>
              <input
                value={f.value}
                onChange={(e) => update(i, e.target.value)}
                className="mt-1 w-full rounded-lg border border-tracev2-border bg-tracev2-bg px-2.5 py-1.5 text-sm text-tracev2-text focus:border-tracev2-accent/70 focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-tracev2-border py-2.5 text-sm font-medium text-tracev2-text transition-colors duration-150 hover:border-tracev2-muted disabled:opacity-50"
          >
            Back to notes
          </button>
          <button
            onClick={() => onSave?.(edited)}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tracev2-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90 disabled:opacity-60"
          >
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Save to record
          </button>
        </div>
      </div>
    </div>
  );
}
