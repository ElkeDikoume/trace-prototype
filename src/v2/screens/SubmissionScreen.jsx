// Submission confirmation — deliberately unlike every other screen: it takes
// over the whole frame (no status bar, no bottom nav) so a caseworker in the
// field can see at a glance, at arm's length, that the record left the device.
const RECIPIENT = 'WASH Cluster · Diffa';
const TIMESTAMP = '22 Jul 2026 · 14:09';

function Row({ label, children }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-green-200">{label}</span>
      <span className="font-medium text-white">{children}</span>
    </div>
  );
}

export default function SubmissionScreen({ caseData, onBackToRecords }) {
  // "#0043 Koura Village" — settlement name only, dropping the region suffix.
  const caseRef = [caseData?.id, caseData?.location?.split(',')[0]?.trim()].filter(Boolean).join(' ') || '#0043 Koura Village';

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto bg-green-600 px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Confirmation mark */}
        {/* Spec said stroke-white, but a white tick inside a white circle is
            invisible — the tick takes the green instead. */}
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16 text-green-600" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className="mt-6 text-2xl font-bold text-white">Record submitted</h1>
        <p className="mt-2 px-8 text-center text-sm text-green-100">
          VCA Report · {caseRef} sent to WASH Cluster, Diffa
        </p>

        {/* Details */}
        <div className="mt-8 w-full max-w-xs space-y-2 rounded-2xl bg-white/20 px-6 py-4">
          <Row label="Submitted to">{RECIPIENT}</Row>
          <Row label="Timestamp">{TIMESTAMP}</Row>
          <Row label="Sync status">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-200" />✓ Confirmed
            </span>
          </Row>
        </div>
      </div>

      <button
        onClick={onBackToRecords}
        className="mb-10 mt-auto w-full max-w-xs rounded-2xl bg-white py-4 text-center font-semibold text-green-700 transition-colors duration-150 hover:bg-green-50"
      >
        Back to records
      </button>
    </div>
  );
}
