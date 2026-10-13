import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import type { TrafficCase } from '../data/types';
import { VIOLATIONS } from '../data/catalog';

/** Illustrated stand-in for AI camera footage: a junction scene with timestamp and detection caption.
 * The "video" is an animation of the same scene, clearly not real footage. */
export function EvidenceViewer({ c }: { c: TrafficCase }) {
  const { tr, tx } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const stamp = `${c.occurredAt.slice(0, 10)} ${c.occurredAt.slice(11, 19)} · ${c.camera.split(' ')[0]}`;
  const red = c.violation === 'red_light' || c.violation === 'stop_line';
  const play = () => {
    setPlaying(false);
    setRound((r) => r + 1);
    window.setTimeout(() => setPlaying(true), 30);
  };
  return (
    <figure className="evidence" style={{ margin: 0 }}>
      <svg viewBox="0 0 360 220" role="img" aria-label={tr('AI ক্যামেরার দৃশ্যের চিত্র (নমুনা)', 'Illustration of the AI camera scene (sample)')} style={{ width: '100%', height: 'auto' }}>
        <rect width="360" height="220" fill="#2b3a42" />
        <rect x="110" y="0" width="140" height="220" fill="#46545c" />
        <rect x="0" y="80" width="360" height="56" fill="#46545c" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={116 + i * 19} y="150" width="11" height="22" fill="#e6e6e6" opacity=".85" />
        ))}
        <rect x="110" y="142" width="140" height="4" fill={red ? '#fff' : '#e6e6e6'} />
        <g transform="translate(290 24)">
          <rect width="22" height="58" rx="5" fill="#111" />
          <circle cx="11" cy="12" r="7" fill={red ? '#ef4444' : '#5a1d1d'} />
          <circle cx="11" cy="29" r="7" fill="#4a3d10" />
          <circle cx="11" cy="46" r="7" fill={red ? '#163a1d' : '#22c55e'} />
        </g>
        <g key={round} className={`car ${playing ? 'moving' : ''}`}>
          <rect x="150" y="150" width="56" height="64" rx="8" fill="#9aa6ad" />
          <rect x="158" y="158" width="40" height="18" rx="3" fill="#cfe3ea" />
          <rect x="160" y="196" width="36" height="12" fill="#ffd54a" stroke="#f59e0b" strokeWidth="2" />
          <rect x="150" y="146" width="56" height="72" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 4" />
        </g>
        {c.violation === 'no_helmet' && <circle cx="178" cy="140" r="12" fill="none" stroke="#facc15" strokeWidth="2.5" />}
      </svg>
      <span className="stamp">{stamp}</span>
      <button type="button" className="play" aria-label={playing ? tr('আবার চালান', 'Replay') : tr('ভিডিও প্রমাণ চালান', 'Play video evidence')} onClick={play}>
        {playing ? <RotateCcw size={22} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
      </button>
      <figcaption className="caption">
        {tr('AI শনাক্ত', 'AI detected')}: {tx(VIOLATIONS[c.violation].name)} · {tr('নমুনা চিত্র', 'sample illustration')}
      </figcaption>
    </figure>
  );
}
