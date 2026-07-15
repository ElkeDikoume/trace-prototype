// "Structured preview" modal shown after the mock Translate & Structure
// action. Placeholder fields only — the real Claude structuring call is Phase 3.
export default function StructuredPreviewModal({ open, onClose, fields = [] }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-h-[85%] overflow-y-auto rounded-t-2xl border-t border-tracev2-border bg-tracev2-card p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-tracev2-border" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Structured preview</h2>
            <p className="text-[11px] text-slate-500">Draft — AI-assisted. Review before saving.</p>
          </div>
          <span className="rounded-full bg-tracev2-accent/15 px-2 py-0.5 text-[10px] font-medium text-tracev2-accent">
            ✦ Mock
          </span>
        </div>

        <dl className="mt-3 divide-y divide-tracev2-border/60">
          {fields.map((f) => (
            <div key={f.label} className="flex gap-3 py-2">
              <dt className="w-32 flex-shrink-0 text-[11px] uppercase tracking-wide text-slate-500">{f.label}</dt>
              <dd className="flex-1 text-sm text-slate-200">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-tracev2-border py-2.5 text-sm font-medium text-slate-300 transition-colors duration-150 hover:border-slate-500"
          >
            Back to notes
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-tracev2-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90"
          >
            Looks right
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          Real translation &amp; structuring arrives in Phase 3.
        </p>
      </div>
    </div>
  );
}
