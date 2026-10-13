import { useRef, useState } from 'react';
import { Camera, CircleCheck, CircleX, ImagePlus, Loader2, TriangleAlert, X } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useI18n } from '../lib/i18n';
import { assessPhoto, makeThumb } from '../services/reports';
import { shortHash } from '../lib/format';
import type { EvidencePhoto } from '../data/types';

/** Draws a stand-in "gallery photo" so the gallery path can be demonstrated without a real file. */
function samplePhoto(): Promise<File> {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 420;
  const g = c.getContext('2d')!;
  g.fillStyle = '#8fa3ad';
  g.fillRect(0, 0, 640, 420);
  g.fillStyle = '#5b6b73';
  g.fillRect(0, 260, 640, 160);
  g.fillStyle = '#f2f2f2';
  for (let i = 0; i < 8; i++) g.fillRect(30 + i * 78, 330, 46, 12);
  g.fillStyle = '#1f6f68';
  g.fillRect(220, 190, 210, 90);
  g.fillStyle = '#ffd54a';
  g.fillRect(290, 250, 70, 18);
  g.fillStyle = '#fff';
  g.font = 'bold 20px sans-serif';
  g.fillText('SAMPLE · ' + new Date().toISOString().slice(0, 16).replace('T', ' '), 18, 34);
  return new Promise((resolve) =>
    c.toBlob((b) => {
      // An older lastModified mimics a photo taken earlier and saved to the gallery.
      resolve(new File([b!], 'IMG_2041.jpg', { type: 'image/jpeg', lastModified: Date.now() - 6 * 60_000 }));
    }, 'image/jpeg'),
  );
}

export function PhotoPicker({
  photos,
  onChange,
  max = 4,
  allowSample = true,
  label,
}: {
  photos: EvidencePhoto[];
  onChange: (p: EvidencePhoto[]) => void;
  max?: number;
  allowSample?: boolean;
  label?: string;
}) {
  const { state } = useApp();
  const { tr, tx } = useI18n();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const known = state.reports.flatMap((r) => r.photos.map((p) => p.hash));

  const add = async (files: File[], source: 'camera' | 'gallery' | 'sample') => {
    if (files.length === 0) return;
    setBusy(true);
    const next = [...photos];
    for (const f of files.slice(0, max - photos.length)) {
      const p = await assessPhoto(f, source === 'camera' ? 'camera' : 'gallery', [...known, ...next.map((x) => x.hash)]);
      if (source === 'sample') p.source = 'sample';
      if (!state.settings.lowBandwidth) p.thumb = await makeThumb(f);
      next.push(p);
    }
    onChange(next);
    setBusy(false);
  };

  const full = photos.length >= max;
  return (
    <div className="stack">
      {label && <span className="strong small">{label}</span>}
      <div className="grid-2">
        <button type="button" className="btn" style={{ background: '#13222a', color: '#fff', minHeight: 96, flexDirection: 'column', whiteSpace: 'normal' }} disabled={full || busy} onClick={() => camRef.current?.click()}>
          <Camera size={26} aria-hidden="true" />
          {tr('ক্যামেরায় তুলুন', 'Take a photo')}
          <span className="tiny" style={{ color: 'var(--gold)' }}>
            {tr('সবচেয়ে নির্ভরযোগ্য', 'Most reliable')}
          </span>
        </button>
        <button
          type="button"
          className="btn outline"
          style={{ minHeight: 96, flexDirection: 'column', borderStyle: 'dashed', whiteSpace: 'normal' }}
          disabled={full || busy}
          onClick={() => galRef.current?.click()}
        >
          <ImagePlus size={26} aria-hidden="true" />
          {tr('গ্যালারি থেকে আপলোড', 'Upload from gallery')}
          <span className="tiny muted">{tr('সময় ও স্থান যাচাই হবে', 'Time and place will be checked')}</span>
        </button>
      </div>
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void add(Array.from(e.target.files ?? []), 'camera');
          e.target.value = '';
        }}
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void add(Array.from(e.target.files ?? []), 'gallery');
          e.target.value = '';
        }}
      />
      {allowSample && !full && (
        <button type="button" className="linklike small" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={async () => add([await samplePhoto()], 'sample')}>
          {tr('নমুনা দেখুন: অবস্থানহীন গ্যালারি ছবি', 'Try a sample: gallery photo without location')}
        </button>
      )}
      {busy && (
        <p className="small row" role="status">
          <Loader2 size={16} className="spin" aria-hidden="true" /> {tr('ছবির ডিজিটাল ছাপ তৈরি ও যাচাই হচ্ছে…', 'Fingerprinting and checking the photo…')}
        </p>
      )}
      {photos.map((p, i) => {
        const tone = p.trust === 'high' ? 'success' : p.trust === 'needs_review' ? 'warn' : 'danger';
        const Ic = p.trust === 'high' ? CircleCheck : p.trust === 'needs_review' ? TriangleAlert : CircleX;
        return (
          <div key={p.hash + i} className={`card ${tone}`} style={{ padding: 12 }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              {p.thumb ? (
                <img src={p.thumb} alt={tr('ছবির ছোট সংস্করণ', 'Photo thumbnail')} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <span style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
                  <ImagePlus size={22} aria-hidden="true" />
                </span>
              )}
              <div className="grow">
                <div className="row" style={{ gap: 6 }}>
                  <Ic size={18} aria-hidden="true" />
                  <strong className="small">
                    {p.trust === 'high'
                      ? tr('মাঝারি আস্থা · সরাসরি ক্যামেরা', 'Moderate trust · direct camera')
                      : p.trust === 'needs_review'
                        ? tr('অফিসার যাচাই প্রয়োজন', 'Officer review needed')
                        : tr('গ্রহণযোগ্য নয়', 'Not acceptable')}
                  </strong>
                </div>
                <div className="tiny muted">
                  {p.name} · SHA-256 {shortHash(p.hash)}
                </div>
                <ul className="tiny" style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                  {p.trustReasons.map((r) => (
                    <li key={r.en}>{tx(r)}</li>
                  ))}
                </ul>
              </div>
              <button type="button" className="icon-btn" aria-label={tr('ছবি সরান', 'Remove photo')} onClick={() => onChange(photos.filter((_, j) => j !== i))}>
                <X size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
