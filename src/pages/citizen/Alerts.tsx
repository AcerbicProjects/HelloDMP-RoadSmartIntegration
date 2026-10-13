import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BellRing, Clock, Map as MapIcon, Pencil, Plus, Route, School, Share2, ShieldCheck, Train, Trash2, TriangleAlert } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, Field, PageHeader, SeverityBadge, Sheet, Switch, Tabs } from '../../components/ui';
import { MapView, type MapCircle, type MapMarker } from '../../components/MapView';
import { Icon } from '../../components/Icon';
import { ALERT_TYPES, SEVERITY } from '../../data/catalog';
import { AREAS } from '../../data/seed';
import { MRT6_STATIONS, SCHOOL_ZONES, windowActive } from '../../data/places';
import type { AlertType, SavedRoute, Severity, TrafficAlert } from '../../data/types';
import { areaScores, congestion, CONGESTION_COLORS } from '../../services/safety';
import { distanceKm, DEMO_POSITION } from '../../services/geo';
import { localDigits, toBnDigits } from '../../lib/format';

const SEV_COLOR: Record<Severity, string> = { critical: '#c62828', major: '#d97706', minor: '#2563eb' };

function onRoute(a: TrafficAlert, routes: SavedRoute[]) {
  return routes.some((r) => r.active && r.areaIds.includes(a.areaId));
}

async function shareAlert(title: string, text: string, toast: (t: string, tone?: 'success' | 'error' | 'info') => void, tr: (b: string, e: string) => string) {
  const body = `${title}\n${text}\n(Hello DMP · ${tr('প্রোটোটাইপ', 'prototype')})`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text: body });
      return;
    }
    await navigator.clipboard.writeText(body);
    toast(tr('সতর্কতা কপি হয়েছে; যেকোনো জায়গায় পেস্ট করুন', 'Alert copied; paste it anywhere'));
  } catch (e) {
    if ((e as Error)?.name !== 'AbortError') toast(tr('শেয়ার করা যায়নি', 'Could not share'), 'error');
  }
}

export default function Alerts() {
  const { state } = useApp();
  const { tr, tx, ago, n, date, time } = useI18n();
  const nav = useNavigate();
  const [tab, setTab] = useState<'feed' | 'map' | 'areas'>('feed');
  const [types, setTypes] = useState<AlertType[]>([]);
  const [minSev, setMinSev] = useState<Severity>(state.settings.notif.minSeverity);
  const [mineOnly, setMineOnly] = useState(false);
  const [layers, setLayers] = useState({ congestion: true, schools: true });

  const filtered = useMemo(
    () =>
      state.alerts
        .filter((a) => (types.length === 0 || types.includes(a.type)) && SEVERITY[a.severity].rank >= SEVERITY[minSev].rank && (!mineOnly || onRoute(a, state.routes)))
        .sort((a, b) => SEVERITY[b.severity].rank - SEVERITY[a.severity].rank || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.alerts, state.routes, types, minSev, mineOnly],
  );
  const active = filtered.filter((a) => a.status === 'active');
  const upcoming = filtered.filter((a) => a.status === 'scheduled');
  const resolved = filtered.filter((a) => a.status === 'resolved');
  const activeSchools = SCHOOL_ZONES.filter((z) => windowActive(z.windows));
  const myRoute = state.routes.find((r) => r.active);

  const markers = useMemo<MapMarker[]>(
    () => [
      { id: 'me', lat: DEMO_POSITION.lat, lng: DEMO_POSITION.lng, kind: 'user', title: tr('আপনার অবস্থান (ডেমো)', 'Your position (demo)') },
      ...[...active, ...upcoming].map<MapMarker>((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        kind: 'alert',
        color: a.status === 'scheduled' ? '#6b7280' : SEV_COLOR[a.severity],
        title: tx(a.title),
        onClick: () => nav(`/alerts/${a.id}`),
      })),
    ],
    [active, upcoming, tx, tr, nav],
  );
  const circles = useMemo<MapCircle[]>(() => {
    const c: MapCircle[] = [];
    if (layers.congestion)
      for (const x of congestion(state)) c.push({ id: `c-${x.area.id}`, lat: x.area.lat, lng: x.area.lng, radius: 450 + x.level * 150, color: CONGESTION_COLORS[x.level], opacity: 0.28, title: `${tx(x.area.name)} · ${tr('যানজট', 'congestion')} ${x.level}/3` });
    if (layers.schools)
      for (const z of SCHOOL_ZONES) c.push({ id: z.id, lat: z.lat, lng: z.lng, radius: 220, color: '#7c3aed', opacity: windowActive(z.windows) ? 0.35 : 0.12, title: tx(z.name) });
    return c;
  }, [layers, state, tx, tr]);

  const toggleType = (t: AlertType) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const AlertRow = ({ a }: { a: TrafficAlert }) => (
    <Link to={`/alerts/${a.id}`} className="list-row" style={{ alignItems: 'flex-start' }}>
      <span className="lr-icon" style={{ background: a.status === 'resolved' ? 'var(--surface-2)' : undefined }}>
        <Icon name={ALERT_TYPES[a.type].icon} size={20} />
      </span>
      <span className="grow">
        <span className="lr-title" style={{ display: 'block' }}>
          {tx(a.title)}
        </span>
        <span className="lr-sub" style={{ display: 'block' }}>
          {tx(a.detail)}
        </span>
        {a.alternate && (
          <span className="small" style={{ display: 'block', color: 'var(--brand-700)' }}>
            {tx(a.alternate)}
          </span>
        )}
        <span className="row wrap" style={{ gap: 6, marginTop: 6 }}>
          {a.status === 'scheduled' && a.startsAt ? (
            <span className="badge info">
              <Clock size={12} aria-hidden="true" /> {date(a.startsAt)}, {time(a.startsAt)}
            </span>
          ) : (
            <span className="badge success">
              <ShieldCheck size={12} aria-hidden="true" /> {tr('DMP যাচাইকৃত', 'DMP verified')} · {ago(a.createdAt)}
            </span>
          )}
          {onRoute(a, state.routes) && <span className="badge warn">{tr('আপনার পথে', 'On your route')}</span>}
        </span>
      </span>
      {a.status !== 'resolved' ? <SeverityBadge severity={a.severity} /> : <span className="badge">{tr('সমাধান হয়েছে', 'Cleared')}</span>}
    </Link>
  );

  return (
    <>
      <PageHeader
        title={tr('যাচাই করা সতর্কতা', 'Verified alerts')}
        actions={
          <Link to="/routes" className="icon-btn" aria-label={tr('আমার পথ', 'My routes')}>
            <Route size={22} />
          </Link>
        }
      />
      <div className="content stack">
        {myRoute && (
          <Link to="/routes" className="card warn row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="lr-icon" style={{ background: 'var(--sos)', color: '#fff', width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
              <Route size={20} aria-hidden="true" />
            </span>
            <span className="grow">
              <span className="strong" style={{ display: 'block' }}>
                {tx(myRoute.name)}
              </span>
              <span className="small">
                {tr(`প্রতিদিন ${toBnDigits(myRoute.notifyFrom)}–${toBnDigits(myRoute.notifyTo)} সতর্কতা চালু`, `Alerts on daily ${myRoute.notifyFrom}–${myRoute.notifyTo}`)} ·{' '}
                {tr(`এখন ${n(state.alerts.filter((a) => a.status === 'active' && myRoute.areaIds.includes(a.areaId)).length)}টি সতর্কতা`, `${state.alerts.filter((a) => a.status === 'active' && myRoute.areaIds.includes(a.areaId)).length} alerts now`)}
              </span>
            </span>
          </Link>
        )}
        {activeSchools.length > 0 && (
          <Banner tone="warn" icon={<School size={18} aria-hidden="true" />}>
            {tr(`এখন ${n(activeSchools.length)}টি স্কুল এলাকায় শিশুদের যাতায়াতের সময়: ধীরে চালান।`, `${activeSchools.length} school zones are in drop-off or pick-up time now: slow down.`)}
          </Banner>
        )}
        <Tabs
          label={tr('দেখার ধরন', 'View')}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'feed', label: tr('তালিকা', 'Feed') },
            { id: 'map', label: tr('মানচিত্র', 'Map') },
            { id: 'areas', label: tr('এলাকার অবস্থা', 'Area safety') },
          ]}
        />
        {tab !== 'areas' && (
          <div className="stack" style={{ gap: 10 }}>
            <div className="chips" role="group" aria-label={tr('ধরন অনুযায়ী ফিল্টার', 'Filter by type')}>
              {(Object.keys(ALERT_TYPES) as AlertType[]).map((t) => (
                <button key={t} type="button" className="chip" aria-pressed={types.includes(t)} onClick={() => toggleType(t)}>
                  <Icon name={ALERT_TYPES[t].icon} size={16} />
                  {tx(ALERT_TYPES[t].label)}
                </button>
              ))}
            </div>
            <div className="row wrap" style={{ gap: 12 }}>
              <label className="row small" style={{ gap: 6 }}>
                {tr('গুরুত্ব', 'Severity')}
                <select className="select" style={{ minHeight: 38, padding: '4px 10px', width: 'auto' }} value={minSev} onChange={(e) => setMinSev(e.target.value as Severity)}>
                  <option value="minor">{tr('সব', 'All')}</option>
                  <option value="major">{tr('বড় ও গুরুতর', 'Major and critical')}</option>
                  <option value="critical">{tr('শুধু গুরুতর', 'Critical only')}</option>
                </select>
              </label>
              <label className="check small" style={{ alignItems: 'center' }}>
                <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
                {tr('শুধু আমার পথের', 'Only on my routes')}
              </label>
            </div>
          </div>
        )}

        {tab === 'feed' && (
          <div className="stack-lg">
            <section className="stack">
              <h2 className="section-title">
                {tr('এখন চলছে', 'Happening now')} <span className="badge">{n(active.length)}</span>
              </h2>
              {active.length === 0 ? (
                <Empty icon={<BellRing size={24} />} title={tr('এই ফিল্টারে কোনো সতর্কতা নেই', 'No alerts match these filters')} />
              ) : (
                <div className="list">
                  {active.map((a) => (
                    <AlertRow key={a.id} a={a} />
                  ))}
                </div>
              )}
            </section>
            {upcoming.length > 0 && (
              <section className="stack">
                <h2 className="section-title">{tr('আগাম নোটিশ', 'Advance notices')}</h2>
                <div className="list">
                  {upcoming.map((a) => (
                    <AlertRow key={a.id} a={a} />
                  ))}
                </div>
              </section>
            )}
            {resolved.length > 0 && (
              <section className="stack">
                <h2 className="section-title">{tr('সম্প্রতি সমাধান', 'Recently cleared')}</h2>
                <div className="list">
                  {resolved.map((a) => (
                    <AlertRow key={a.id} a={a} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === 'map' && (
          <div className="stack">
            <MapView center={DEMO_POSITION} zoom={12} markers={markers} circles={circles} label={tr('সতর্কতার মানচিত্র', 'Alert map')} height="min(62vh, 560px)" />
            <div className="row wrap" style={{ gap: 14 }}>
              <label className="check small" style={{ alignItems: 'center' }}>
                <input type="checkbox" checked={layers.congestion} onChange={(e) => setLayers({ ...layers, congestion: e.target.checked })} />
                {tr('যানজটের স্তর', 'Congestion layer')}
              </label>
              <label className="check small" style={{ alignItems: 'center' }}>
                <input type="checkbox" checked={layers.schools} onChange={(e) => setLayers({ ...layers, schools: e.target.checked })} />
                {tr('স্কুল এলাকা', 'School zones')}
              </label>
            </div>
            <div className="row wrap small muted" style={{ gap: 12 }}>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: SEV_COLOR.critical }} /> {tr('গুরুতর', 'Critical')}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: SEV_COLOR.major }} /> {tr('বড়', 'Major')}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: SEV_COLOR.minor }} /> {tr('ছোট', 'Minor')}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: '#6b7280' }} /> {tr('আগাম নোটিশ', 'Advance notice')}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: '#7c3aed' }} /> {tr('স্কুল এলাকা', 'School zone')}
              </span>
            </div>
            <p className="tiny muted">
              {tr(
                'যানজটের স্তর DMP-যাচাইকৃত সতর্কতা থেকে হিসাব করা। প্রস্তাবনায় লাইভ যানজট Google Maps ও Waze থেকে আসার কথা; এই প্রোটোটাইপে সেই সংযোগ নেই।',
                'The congestion layer is derived from DMP-verified alerts. The proposal takes live congestion from Google Maps and Waze; this prototype has no such connection.',
              )}
            </p>
          </div>
        )}

        {tab === 'areas' && <AreaSafety />}
      </div>
    </>
  );
}

function AreaSafety() {
  const { state } = useApp();
  const { tr, tx, n } = useI18n();
  const scores = areaScores(state);
  return (
    <div className="stack">
      <p className="small muted">
        {tr(
          'প্রতিটি এলাকার স্কোর ১০০ থেকে শুরু: ১.২ কিমির মধ্যে চলমান সতর্কতা (গুরুতর ২৫, বড় ১৫, ছোট ৬) এবং গত ৭ দিনের রিপোর্ট (প্রতিটি ৪, দুর্ঘটনা আরও ৬) বাদ যায়।',
          'Each area starts at 100. Active alerts within 1.2 km (critical 25, major 15, minor 6) and reports from the last 7 days (4 each, accidents 6 more) are subtracted.',
        )}
      </p>
      <div className="bars">
        {scores.map((s) => (
          <div key={s.area.id} className="bar-row">
            <span>{tx(s.area.name)}</span>
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ display: 'block', width: `${s.score}%`, background: s.level === 'good' ? '#16a34a' : s.level === 'moderate' ? '#d97706' : '#c62828' }} />
            </span>
            <span className="val" aria-label={`${s.score}/100`}>
              {n(s.score)}
            </span>
          </div>
        ))}
      </div>
      <Banner>{tr('এটি তথ্যভিত্তিক নির্দেশক মাত্র, কোনো এলাকার নিরাপত্তার নিশ্চয়তা নয়।', 'This is an indicator built from app data, not a guarantee about any area.')}</Banner>
    </div>
  );
}

export function AlertDetail() {
  const { id } = useParams();
  const { state, toast } = useApp();
  const { tr, tx, ago, date, time } = useI18n();
  const a = state.alerts.find((x) => x.id === id);
  if (!a)
    return (
      <>
        <PageHeader title={tr('সতর্কতা', 'Alert')} />
        <div className="content">
          <Empty icon={<TriangleAlert size={24} />} title={tr('সতর্কতা পাওয়া যায়নি', 'Alert not found')} action={<Link to="/alerts" className="btn outline small">{tr('সব সতর্কতা', 'All alerts')}</Link>} />
        </div>
      </>
    );
  const areaName = AREAS.find((x) => x.id === a.areaId)?.name;
  const officer = state.officers.find((o) => o.id === a.verifiedBy);
  return (
    <>
      <PageHeader title={tx(ALERT_TYPES[a.type].label)} />
      <div className="content cols">
        <div className="stack">
          <MapView center={a} zoom={15} markers={[{ id: a.id, lat: a.lat, lng: a.lng, kind: 'alert', color: SEV_COLOR[a.severity], title: tx(a.title) }]} label={tx(a.title)} height={280} />
        </div>
        <div className="stack">
          <div className="row between">
            <h2 style={{ fontSize: '1.25rem' }}>{tx(a.title)}</h2>
            <SeverityBadge severity={a.severity} />
          </div>
          <p>{tx(a.detail)}</p>
          {a.alternate && (
            <div className="card tinted row">
              <Route size={20} aria-hidden="true" />
              <span className="strong">{tx(a.alternate)}</span>
            </div>
          )}
          <div className="kv">
            <div>{tr('এলাকা', 'Area')}</div>
            <div>{tx(areaName)}</div>
            <div>{tr('অবস্থা', 'Status')}</div>
            <div>{a.status === 'active' ? tr('চলমান', 'Active') : a.status === 'scheduled' ? tr('আগাম নোটিশ', 'Scheduled') : tr('সমাধান হয়েছে', 'Cleared')}</div>
            {a.startsAt && (
              <>
                <div>{tr('শুরু', 'Starts')}</div>
                <div>
                  {date(a.startsAt)}, {time(a.startsAt)}
                </div>
              </>
            )}
            {a.endsAt && (
              <>
                <div>{tr('শেষ', 'Ends')}</div>
                <div>
                  {date(a.endsAt)}, {time(a.endsAt)}
                </div>
              </>
            )}
            <div>{tr('যাচাই', 'Verified')}</div>
            <div>
              {officer ? tx(officer.name) : tr('DMP কন্ট্রোল রুম', 'DMP control room')} · {ago(a.createdAt)}
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn outline" onClick={() => shareAlert(tx(a.title), `${tx(a.detail)}${a.alternate ? `\n${tx(a.alternate)}` : ''}`, toast, tr)}>
              <Share2 size={18} aria-hidden="true" />
              {tr('শেয়ার', 'Share')}
            </button>
            <Link to={`/report?category=${a.type === 'waterlogging' ? 'waterlogging' : a.type === 'accident' ? 'accident' : 'hazard'}`} className="btn primary">
              {tr('হালনাগাদ তথ্য দিন', 'Report an update')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/** Saved routes with time windows (SG-007, SG-024) and metro alternatives (SG-053). */
export function RoutesPage() {
  const { state, update, toast } = useApp();
  const { tr, tx, n } = useI18n();
  const [editing, setEditing] = useState<SavedRoute | null>(null);

  const save = (r: SavedRoute) => {
    update((d) => {
      const i = d.routes.findIndex((x) => x.id === r.id);
      if (i >= 0) d.routes[i] = r;
      else d.routes.push(r);
    });
    toast(tr('পথ সংরক্ষিত হয়েছে (এই ডিভাইসে)', 'Route saved (on this device)'));
    setEditing(null);
  };

  return (
    <>
      <PageHeader title={tr('আমার পথ', 'My routes')} />
      <div className="content stack">
        <p className="small muted">{tr('পথে থাকা এলাকা ও সময় দিন; ঐ সময়ে শুধু সেই এলাকার যাচাই করা সতর্কতা পাবেন।', 'Choose the areas on your way and a time window; you will get verified alerts for those areas at that time only.')}</p>
        {state.routes.length === 0 && <Empty icon={<Route size={24} />} title={tr('কোনো পথ সংরক্ষিত নেই', 'No saved routes')} />}
        {state.routes.map((r) => {
          const alerts = state.alerts.filter((a) => a.status !== 'resolved' && r.areaIds.includes(a.areaId));
          const areas = r.areaIds.map((id) => AREAS.find((a) => a.id === id)).filter(Boolean) as typeof AREAS;
          const stations = MRT6_STATIONS.filter((s) => areas.some((a) => distanceKm(a, s) < 0.9));
          return (
            <section key={r.id} className="card stack">
              <div className="row between">
                <h2 className="grow">{tx(r.name)}</h2>
                <button type="button" className="icon-btn" aria-label={tr('সম্পাদনা', 'Edit')} onClick={() => setEditing(r)}>
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={tr('মুছুন', 'Delete')}
                  onClick={() => {
                    update((d) => {
                      d.routes = d.routes.filter((x) => x.id !== r.id);
                    });
                    toast(tr('পথ মুছে ফেলা হয়েছে', 'Route deleted'), 'info');
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="chips">
                {areas.map((a, i) => (
                  <span key={a.id} className="badge brand">
                    {localDigits(i + 1, state.settings.lang)}. {tx(a.name)}
                  </span>
                ))}
              </div>
              <Switch
                checked={r.active}
                onChange={(v) =>
                  update((d) => {
                    const x = d.routes.find((y) => y.id === r.id);
                    if (x) x.active = v;
                  })
                }
                label={tr('সতর্কতা চালু', 'Alerts on')}
                description={tr(`প্রতিদিন ${toBnDigits(r.notifyFrom)}–${toBnDigits(r.notifyTo)}`, `Daily ${r.notifyFrom}–${r.notifyTo}`)}
              />
              {alerts.length > 0 ? (
                <div className="list">
                  {alerts.map((a) => (
                    <Link key={a.id} to={`/alerts/${a.id}`} className="list-row">
                      <span className="lr-icon">
                        <Icon name={ALERT_TYPES[a.type].icon} size={18} />
                      </span>
                      <span className="grow">
                        <span className="lr-title" style={{ display: 'block' }}>
                          {tx(a.title)}
                        </span>
                        {a.alternate && <span className="lr-sub">{tx(a.alternate)}</span>}
                      </span>
                      <SeverityBadge severity={a.severity} />
                    </Link>
                  ))}
                </div>
              ) : (
                <Banner tone="success">{tr('এই পথে এখন কোনো সতর্কতা নেই।', 'No alerts on this route right now.')}</Banner>
              )}
              {stations.length > 0 && (
                <div className="row small" style={{ alignItems: 'flex-start' }}>
                  <Train size={18} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--info)' }} />
                  <span>
                    <strong>{tr('মেট্রোরেল বিকল্প (MRT লাইন-৬):', 'Metro alternative (MRT Line-6):')}</strong> {stations.map((s) => tx(s.name)).join(', ')}{' '}
                    <span className="muted">{tr('· স্টেশনের অবস্থান আনুমানিক; লাইভ সময়সূচি যুক্ত নয়', '· approximate station positions; no live timetable')}</span>
                  </span>
                </div>
              )}
            </section>
          );
        })}
        <button type="button" className="btn primary" onClick={() => setEditing({ id: `RT${Date.now()}`, name: { bn: '', en: '' }, areaIds: [], notifyFrom: '08:00', notifyTo: '10:00', active: true })}>
          <Plus size={18} aria-hidden="true" />
          {tr('নতুন পথ', 'New route')}
        </button>
        <Link to="/alerts" className="btn ghost">
          <MapIcon size={18} aria-hidden="true" />
          {tr('সব সতর্কতা মানচিত্রে', 'All alerts on the map')}
        </Link>
        <p className="tiny muted">{tr(`${n(state.routes.filter((r) => r.active).length)}টি পথে সতর্কতা চালু`, `${state.routes.filter((r) => r.active).length} routes with alerts on`)}</p>
      </div>
      {editing && <RouteEditor route={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function RouteEditor({ route, onSave, onClose }: { route: SavedRoute; onSave: (r: SavedRoute) => void; onClose: () => void }) {
  const { tr, tx, lang } = useI18n();
  const [name, setName] = useState(route.name[lang] || route.name.bn);
  const [areaIds, setAreaIds] = useState(route.areaIds);
  const [from, setFrom] = useState(route.notifyFrom);
  const [to, setTo] = useState(route.notifyTo);
  const [error, setError] = useState('');
  const submit = () => {
    if (!name.trim()) return setError(tr('পথের একটি নাম দিন', 'Give the route a name'));
    if (areaIds.length < 2) return setError(tr('অন্তত দুটি এলাকা বেছে নিন', 'Choose at least two areas'));
    onSave({ ...route, name: { bn: name.trim(), en: name.trim() }, areaIds, notifyFrom: from, notifyTo: to });
  };
  return (
    <Sheet open onClose={onClose} title={route.areaIds.length ? tr('পথ সম্পাদনা', 'Edit route') : tr('নতুন পথ', 'New route')}>
      <div className="stack">
        <Field label={tr('নাম', 'Name')} htmlFor="rname">
          <input id="rname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('যেমন: বাসা → অফিস', 'e.g. Home → Office')} />
        </Field>
        <div className="field">
          <span className="label">{tr('পথের এলাকা (ক্রমানুসারে বেছে নিন)', 'Areas on the way (tap in order)')}</span>
          <div className="chips">
            {AREAS.map((a) => {
              const idx = areaIds.indexOf(a.id);
              return (
                <button key={a.id} type="button" className="chip" aria-pressed={idx >= 0} onClick={() => setAreaIds(idx >= 0 ? areaIds.filter((x) => x !== a.id) : [...areaIds, a.id])}>
                  {idx >= 0 ? `${localDigits(idx + 1, lang)}. ` : ''}
                  {tx(a.name)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid-2">
          <Field label={tr('শুরু', 'From')} htmlFor="rfrom">
            <input id="rfrom" type="time" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label={tr('শেষ', 'To')} htmlFor="rto">
            <input id="rto" type="time" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p className="danger-text small strong" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="btn primary block" onClick={submit}>
          {tr('সংরক্ষণ', 'Save')}
        </button>
      </div>
    </Sheet>
  );
}
