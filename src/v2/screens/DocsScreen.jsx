// Lightweight Docs placeholder so the bottom-nav tab isn't a dead click.
// The full documents/insights surface is out of Phase 2 scope.
export default function DocsScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tracev2-card border border-tracev2-border text-slate-500">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M13 3v5h5M8.5 13h7M8.5 16.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-3 text-base font-semibold text-slate-200">Documents</h1>
      <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-slate-500">
        AI-generated case summaries, handoff notes and referrals will live here. Coming in Phase 3.
      </p>
    </div>
  );
}
