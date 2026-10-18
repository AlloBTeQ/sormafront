import React from 'react';

/**
 * SormaliticsMark — the folder mark. Ink outline, aurum circuit traces,
 * ink/aurum ledger bars. Replaces the Iskhova owl (2026-08-18).
 *
 * Renders inline (not via <img src="/icon.svg">) so it inherits sizing from
 * Tailwind classes and stays crisp at every density. Colours are hard-coded
 * rather than `currentColor`: this is a fixed two-colour lockup and must not
 * pick up surrounding text colour.
 *
 * Geometry is identical to `public/icon.svg` — if you change one, change both.
 * The gradient variant (filled gold folder, bars outside, one signal-red bar)
 * lives at `public/mark-gradient.svg` and is for marketing surfaces only.
 *
 * `tone="onDark"` swaps the ink strokes for parchment so the mark reads on the
 * ink ground (navy footer, navy landing). Aurum stays aurum. Default is the
 * original lockup — every existing call site is unchanged.
 */
export function SormaliticsMark({
  className = 'w-9 h-9',
  tone = 'onLight',
}: { className?: string; tone?: 'onLight' | 'onDark' }) {
  const INK = tone === 'onDark' ? '#FBF7EA' : '#143152';
  const AURUM = '#C9A227';

  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="SORMALITICS">
      {/* folder body — back panel with tab */}
      <path
        d="M 76 390 V 122 Q 76 102 96 102 H 196 L 232 142 H 416 Q 436 142 436 162 V 390 Q 436 410 416 410 H 96 Q 76 410 76 390 Z"
        fill="none" stroke={INK} strokeWidth={26} strokeLinejoin="round" strokeLinecap="round"
      />
      {/* front flap edge */}
      <path
        d="M 89 300 L 152 216 H 423"
        fill="none" stroke={INK} strokeWidth={26} strokeLinejoin="round" strokeLinecap="round"
      />

      {/* circuit traces */}
      <path d="M 122 296 H 176" fill="none" stroke={AURUM} strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 122 334 H 190 L 218 306" fill="none" stroke={AURUM} strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 122 372 H 168" fill="none" stroke={AURUM} strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={196} cy={296} r={9.5} fill="none" stroke={AURUM} strokeWidth={10} />
      <circle cx={238} cy={306} r={9.5} fill="none" stroke={AURUM} strokeWidth={10} />
      <circle cx={188} cy={372} r={9.5} fill="none" stroke={AURUM} strokeWidth={10} />

      {/* ledger bars */}
      <rect x={268} y={320} width={34} height={62} rx={7} fill={INK} />
      <rect x={314} y={282} width={34} height={100} rx={7} fill={INK} />
      <rect x={360} y={242} width={34} height={140} rx={7} fill={AURUM} />
    </svg>
  );
}

export default SormaliticsMark;
