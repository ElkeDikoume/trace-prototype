// Small ⓘ affordance placed next to a heading. Tapping it explains what the
// section is — and, where it matters, what the caseworker should not read into
// it. The explanation opens as a bottom sheet so it never covers the heading
// that prompted it.
import { useState } from 'react';

export default function InfoButton({ label }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="More information"
        className="ml-1.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
      >
        i
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          {/* normal-case/tracking-normal: several of these buttons sit inside
              uppercase, wide-tracked headings, and the sheet inherits both. */}
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-5 text-start normal-case tracking-normal shadow-xl">
            <p className="text-sm leading-relaxed text-slate-600">{label}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </>
  );
}
