import { useI18n } from '../lib/i18n.jsx';

const REGIONS = [
  { id: 'agadez', label: 'Agadez corridor, Niger', x: 108, y: 138, level: 'high' },
  { id: 'diffa', label: 'Diffa / Lake Chad Basin, Niger', x: 138, y: 152, level: 'high' },
  { id: 'niamey', label: 'Niamey, Niger', x: 92, y: 158, level: 'medium' },
  { id: 'ndjamena', label: "N'Djamena, Chad", x: 158, y: 162, level: 'medium' }
];

const LEVEL_COLOR = {
  high: '#dc2626',
  medium: '#d97706'
};

export default function AfricaHeatMap() {
  const { t } = useI18n();
  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{t('Regional risk hotspots')}</h3>
        <span className="text-[10px] text-slate-500">{t('illustrative, not to scale')}</span>
      </div>
      <svg viewBox="0 0 300 330" className="w-full max-w-xs mx-auto">
        <path
          d="M170,10 L228,16 C246,22 256,42 252,66 C248,90 258,112 274,132
             C286,147 276,157 261,151 C247,146 236,161 241,181
             C246,206 236,231 226,256 C219,276 206,296 196,311
             C189,321 179,323 171,316 C161,306 156,291 146,271
             C136,251 126,231 121,206 C116,181 101,166 86,156
             C66,146 56,151 51,166 C41,176 31,166 36,146
             C41,126 56,111 66,91 C76,71 86,51 96,31
             C106,16 141,8 170,10 Z"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="2"
          className="fill-trace-700"
        />
        {REGIONS.map((r) => (
          <g key={r.id}>
            <circle cx={r.x} cy={r.y} r="10" fill={LEVEL_COLOR[r.level]} opacity="0.35">
              <animate attributeName="r" values="8;14;8" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={r.x} cy={r.y} r="5" fill={LEVEL_COLOR[r.level]} stroke="#0b1220" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      <div className="space-y-1 mt-2">
        {REGIONS.map((r) => (
          <div key={r.id} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: LEVEL_COLOR[r.level] }} />
            {t(r.label)} <span className="text-slate-600">· {t(r.level)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
