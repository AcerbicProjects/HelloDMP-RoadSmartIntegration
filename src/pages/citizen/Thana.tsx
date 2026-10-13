import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, ExternalLink, List, LocateFixed, Mail, MapPin, Navigation, Phone, Search } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, PageHeader, Sheet, Tabs } from '../../components/ui';
import { MapView, type MapMarker } from '../../components/MapView';
import { useContactSheet } from '../../components/Contact';
import { THANAS } from '../../data/thanas';
import { distanceKm, getPosition, type PositionResult } from '../../services/geo';
import { formatPhone } from '../../lib/format';
import type { Thana } from '../../data/types';

/** Explains why location is needed before the browser asks (SG-038). */
export function LocationRationale({ open, onAllow, onDeny }: { open: boolean; onAllow: () => void; onDeny: () => void }) {
  const { tr } = useI18n();
  return (
    <Sheet open={open} onClose={onDeny} title={tr('অবস্থান কেন দরকার', 'Why we need your location')}>
      <div className="stack">
        <div className="ob-art" style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <LocateFixed size={34} aria-hidden="true" />
        </div>
        <p>{tr('আপনার কাছের থানা ও দূরত্ব দেখাতে, এবং রিপোর্ট বা SOS-এ ঘটনাস্থল যুক্ত করতে অবস্থান ব্যবহার হয়।', 'Your location is used to show the nearest thanas and distances, and to attach the place to a report or SOS.')}</p>
        <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
          <li>{tr('শুধু এই কাজের সময় একবার নেওয়া হয়; পেছনে ট্র্যাক হয় না।', 'Taken once for this task; never tracked in the background.')}</li>
          <li>{tr('না দিলে ডেমো অবস্থান (রমনা) ব্যবহার হবে; তালিকা ও অনুসন্ধান কাজ করবে।', 'If you say no, a demo position (Ramna) is used; the list and search still work.')}</li>
          <li>{tr('ঢাকার বাইরে থাকলে ডেমো অবস্থানই দেখানো হবে।', 'If you are outside Dhaka, the demo position is shown instead.')}</li>
        </ul>
        <div className="btn-row">
          <button type="button" className="btn outline" onClick={onDeny}>
            {tr('এখন না', 'Not now')}
          </button>
          <button type="button" className="btn primary" onClick={onAllow}>
            {tr('অবস্থান দিন', 'Use my location')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/** Location with consent and a one-time explanation; falls back to the demo position. */
export function usePosition() {
  const { state, update } = useApp();
  const [pos, setPos] = useState<PositionResult | null>(null);
  const [asking, setAsking] = useState(false);
  const allowed = state.settings.consent.location;
  const seen = state.settings.locationRationaleSeen;

  useEffect(() => {
    if (!allowed) {
      void getPosition(false).then(setPos);
    } else if (!seen) {
      void getPosition(false).then(setPos);
      setAsking(true);
    } else {
      void getPosition(true).then(setPos);
    }
  }, [allowed, seen]);

  const rationale = (
    <LocationRationale
      open={asking}
      onAllow={() => {
        setAsking(false);
        update((d) => {
          d.settings.locationRationaleSeen = true;
        });
      }}
      onDeny={() => {
        setAsking(false);
        update((d) => {
          d.settings.locationRationaleSeen = true;
          d.settings.consent.location = false;
        });
      }}
    />
  );
  return { pos, rationale };
}

export default function ThanaPage() {
  const { tr, tx, n, lang } = useI18n();
  const { pos, rationale } = usePosition();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [q, setQ] = useState('');
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<Thana | null>(() => THANAS.find((t) => t.id === params.get('id')) ?? null);
  const contact = useContactSheet();

  const list = useMemo(() => {
    const p = pos ?? { lat: 23.7383, lng: 90.4006 };
    const s = q.trim().toLowerCase();
    return THANAS.map((t) => ({ ...t, km: distanceKm(p, t) }))
      .filter((t) => !s || [t.name.bn, t.name.en, t.address.bn, t.address.en].some((x) => x.toLowerCase().includes(s)))
      .sort((a, b) => a.km - b.km);
  }, [pos, q]);

  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = list.map((t) => ({ id: t.id, lat: t.lat, lng: t.lng, kind: 'thana', title: tx(t.name), label: tx(t.name), onClick: () => setSelected(t) }));
    if (pos) m.push({ id: 'me', lat: pos.lat, lng: pos.lng, kind: 'user', title: tr('আপনার অবস্থান', 'Your location') });
    return m;
  }, [list, pos, tx, tr]);

  const sel = selected ? list.find((t) => t.id === selected.id) ?? { ...selected, km: pos ? distanceKm(pos, selected) : 0 } : null;

  return (
    <>
      <PageHeader title={tr('নিকটস্থ থানা', 'Nearest Thana')} />
      <div className="content stack">
        <div className="row wrap" style={{ gap: 10 }}>
          <label className="search-box grow" style={{ minWidth: 220 }}>
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">{tr('থানা খুঁজুন', 'Search thanas')}</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('থানার নাম বা এলাকা', 'Thana name or area')} />
          </label>
          <div style={{ minWidth: 220 }}>
            <Tabs
              label={tr('দেখার ধরন', 'View')}
              value={view}
              onChange={setView}
              tabs={[
                { id: 'map', label: tr('মানচিত্র', 'Map') },
                { id: 'list', label: tr('তালিকা', 'List') },
              ]}
            />
          </div>
        </div>
        {pos && (
          <p className="small muted row" style={{ gap: 6 }}>
            <MapPin size={14} aria-hidden="true" />
            {pos.source === 'device' ? tr('আপনার অবস্থান থেকে দূরত্ব', 'Distances from your location') : tr('ডেমো অবস্থান (রমনা) থেকে দূরত্ব', 'Distances from the demo position (Ramna)')} · {tr(`${n(list.length)}টি থানা`, `${list.length} thanas`)}
          </p>
        )}
        {list.length === 0 ? (
          <Empty icon={<Search size={24} />} title={tr('কোনো থানা মেলেনি', 'No thana matches')} body={tr('অন্য নাম দিয়ে খুঁজুন।', 'Try another name.')} />
        ) : view === 'map' && pos ? (
          <MapView center={pos} zoom={13} markers={markers} label={tr('থানার মানচিত্র', 'Map of thanas')} height="min(68vh, 620px)" />
        ) : (
          <div className="list" role="list" aria-label={tr('থানার তালিকা', 'List of thanas')}>
            {list.map((t) => (
              <button key={t.id} type="button" role="listitem" className="list-row" onClick={() => setSelected(t)}>
                <span className="lr-icon">
                  <Building2 size={20} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tx(t.name)}
                  </span>
                  <span className="lr-sub" style={{ display: 'block' }}>
                    {tx(t.address)}
                  </span>
                </span>
                <span className="badge brand">{tr(`${n(t.km.toFixed(1))} কিমি`, `${t.km.toFixed(1)} km`)}</span>
              </button>
            ))}
          </div>
        )}
        {view === 'map' && list.length > 0 && (
          <button type="button" className="btn outline" onClick={() => setView('list')}>
            <List size={18} aria-hidden="true" />
            {tr('কাছের থানাগুলো তালিকায় দেখুন', 'See the nearest thanas as a list')}
          </button>
        )}
      </div>

      <Sheet open={!!sel} onClose={() => setSelected(null)} title={sel ? tx(sel.name) : ''}>
        {sel && (
          <div className="stack">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <MapPin size={18} className="muted" aria-hidden="true" style={{ marginTop: 3 }} />
              <span>{tx(sel.address)}</span>
            </div>
            <div className="kv">
              <div>{tr('দূরত্ব', 'Distance')}</div>
              <div>{tr(`${n(sel.km.toFixed(1))} কিমি`, `${sel.km.toFixed(1)} km`)}</div>
              <div>{tr('ফোন', 'Phone')}</div>
              <div className="danger-text">{formatPhone(sel.phone, lang)}</div>
              <div>{tr('ইমেইল', 'E-mail')}</div>
              <div style={{ fontWeight: 600 }}>{sel.email}</div>
            </div>
            <div className="btn-row">
              <button type="button" className="btn danger" onClick={() => contact.open({ kind: 'tel', value: sel.phone, label: tx(sel.name) })}>
                <Phone size={18} aria-hidden="true" />
                {tr('কল', 'Call')}
              </button>
              <button type="button" className="btn outline" onClick={() => contact.open({ kind: 'mail', value: sel.email, label: tx(sel.name) })}>
                <Mail size={18} aria-hidden="true" />
                {tr('ইমেইল', 'E-mail')}
              </button>
            </div>
            <a className="btn ghost" href={`https://www.openstreetmap.org/directions?to=${sel.lat}%2C${sel.lng}`} target="_blank" rel="noopener noreferrer">
              <Navigation size={18} aria-hidden="true" />
              {tr('পথনির্দেশ (বাহ্যিক মানচিত্র)', 'Directions (external map)')}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            <Banner>{tr('থানার নাম, ঠিকানা, ফোন ও অবস্থান বর্তমান Hello DMP অ্যাপের তথ্য থেকে নেওয়া।', 'Thana names, addresses, phones and positions come from the current Hello DMP app data.')}</Banner>
          </div>
        )}
      </Sheet>
      {contact.sheet}
      {rationale}
    </>
  );
}
