import { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ClipboardList, FileWarning, Gavel, LayoutDashboard, Map as MapIcon, Megaphone, Siren } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { StaffShell, type StaffNavItem } from '../../components/StaffShell';
import { Banner, PageHeader } from '../../components/ui';
import { MapView, type MapCircle, type MapMarker } from '../../components/MapView';
import { categoryLabel } from '../citizen/Report';
import { KIND_LABEL } from '../citizen/MyReports';
import { ALERT_TYPES, REPORT_STATUS, ROUTING } from '../../data/catalog';
import { SIMULATED_MAU } from '../../data/seed';
import { SCHOOL_ZONES } from '../../data/places';
import { areaScores, congestion, CONGESTION_COLORS } from '../../services/safety';
import { OPEN_STATUSES, responseMinutes } from '../../services/workflow';
import type { CitizenReport, ReportStatus } from '../../data/types';
import { ContentDesk, ObjectionDesk, ReportDesk, SosDesk, Triage } from './AdminOps';

const OPEN = OPEN_STATUSES;
const times = responseMinutes;

function avg(xs: (number | undefined)[]) {
  const v = xs.filter((x): x is number => typeof x === 'number');
  return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : undefined;
}

export default function AdminRoot() {
  const { state } = useApp();
  const { tr } = useI18n();
  const primary = state.reports.filter((r) => !r.duplicateOf && r.status !== 'queued');
  const nav: StaffNavItem[] = [
    { to: '/admin', label: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' }, icon: LayoutDashboard },
    { to: '/admin/triage', label: { bn: 'ট্রায়াজ', en: 'Triage' }, icon: ClipboardList, badge: primary.filter((r) => r.status === 'received').length },
    { to: '/admin/map', label: { bn: 'কন্ট্রোল ম্যাপ', en: 'Control map' }, icon: MapIcon },
    { to: '/admin/objections', label: { bn: 'আপত্তি', en: 'Objections' }, icon: Gavel, badge: state.cases.filter((c) => c.status === 'objection' && !c.objection?.decision).length + state.cases.filter((c) => c.nomination?.status === 'pending').length },
    { to: '/admin/content', label: { bn: 'সতর্কতা ও ঘোষণা', en: 'Alerts & notices' }, icon: Megaphone },
    { to: '/admin/sos', label: { bn: 'SOS', en: 'SOS' }, icon: Siren, badge: state.sosEvents.filter((s) => s.status === 'active').length },
  ];
  return (
    <StaffShell variant="admin" title={{ bn: 'DMP কন্ট্রোল রুম', en: 'DMP Control Room' }} subtitle={tr('ডেমো · নমুনা তথ্য', 'Demo · sample data')} nav={nav}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="triage" element={<Triage />} />
        <Route path="reports/:id" element={<ReportDesk />} />
        <Route path="map" element={<ControlMap />} />
        <Route path="objections" element={<ObjectionDesk />} />
        <Route path="content" element={<ContentDesk />} />
        <Route path="sos" element={<SosDesk />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </StaffShell>
  );
}

function Bars({ rows, color }: { rows: { label: string; value: number }[]; color?: string }) {
  const { n } = useI18n();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div key={r.label} className="bar-row">
          <span>{r.label}</span>
          <span className="bar-track" role="img" aria-label={`${r.label}: ${r.value}`}>
            <span className="bar-fill" style={{ width: `${(r.value / max) * 100}%`, display: 'block', background: color }} />
          </span>
          <span className="val">{n(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { state } = useApp();
  const { tr, tx, n, taka, num, ago } = useI18n();
  const d = useMemo(() => {
    const reports = state.reports.filter((r) => !r.duplicateOf && r.status !== 'queued');
    const today = new Date().toDateString();
    const open = reports.filter((r) => OPEN.includes(r.status));
    const closed = reports.filter((r) => r.status === 'resolved' || r.status === 'rejected');
    const t = reports.map(times);
    const ratings = state.reports.filter((r) => r.rating).map((r) => r.rating!);
    const byCat = new Map<string, number>();
    reports.forEach((r) => {
      const k = `${r.kind}:${r.category}`;
      byCat.set(k, (byCat.get(k) ?? 0) + 1);
    });
    const byStatus = new Map<ReportStatus, number>();
    reports.forEach((r) => byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1));
    const byDesk = new Map<string, number>();
    reports.forEach((r) => {
      const k = ROUTING[r.kind].en;
      byDesk.set(k, (byDesk.get(k) ?? 0) + 1);
    });
    return {
      reports,
      open: open.length,
      today: reports.filter((r) => new Date(r.createdAt).toDateString() === today).length,
      dups: state.reports.filter((r) => r.duplicateOf).length,
      ack: avg(t.map((x) => x.ack)),
      close: avg(t.map((x) => x.close)),
      rate: reports.length ? Math.round((reports.filter((r) => r.status === 'resolved').length / reports.length) * 100) : 0,
      closed: closed.length,
      rating: ratings.length ? ratings.reduce((s, x) => s + x, 0) / ratings.length : undefined,
      objections: state.cases.filter((c) => c.status === 'objection' && !c.objection?.decision).length,
      ai: state.cases.filter((c) => c.source === 'ai_camera' && !c.officerVerified && c.status !== 'cancelled').length,
      alerts: state.alerts.filter((a) => a.status === 'active').length,
      sos: state.sosEvents.filter((s) => s.status === 'active').length,
      collected: state.cases.reduce((s, c) => s + (c.payment?.amountPaid ?? 0), 0),
      outstanding: state.cases.filter((c) => c.officerVerified && c.status === 'unpaid').reduce((s, c) => s + c.amount, 0),
      onDuty: state.officers.filter((o) => o.onDuty).length,
      byCat: [...byCat.entries()].sort((a, b) => b[1] - a[1]),
      byStatus: [...byStatus.entries()],
      byDesk: [...byDesk.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [state]);
  const fmtMin = (m?: number) => (m === undefined ? '—' : m < 60 ? tr(`${n(m)} মিনিট`, `${m} min`) : tr(`${n((m / 60).toFixed(1))} ঘণ্টা`, `${(m / 60).toFixed(1)} h`));
  const safety = areaScores(state).slice(0, 5);
  const recent = [...d.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const maxMau = Math.max(...SIMULATED_MAU.map((m) => m.value));

  const kpis = [
    { v: n(d.open), l: tr('চলমান রিপোর্ট', 'Open reports'), sub: tr(`আজ নতুন ${n(d.today)}`, `${d.today} new today`), to: '/admin/triage' },
    { v: fmtMin(d.ack), l: tr('গড় স্বীকৃতির সময়', 'Avg time to acknowledge'), sub: tr('জমা থেকে যাচাই/নিযুক্ত', 'Submission to verified/assigned') },
    { v: fmtMin(d.close), l: tr('গড় নিষ্পত্তির সময়', 'Avg time to close'), sub: tr(`${n(d.closed)}টি বন্ধ রিপোর্ট`, `${d.closed} closed reports`) },
    { v: `${n(d.rate)}%`, l: tr('নিষ্পত্তির হার', 'Resolution rate'), sub: tr(`${n(d.dups)}টি ডুপ্লিকেট একত্রিত`, `${d.dups} duplicates merged`) },
    { v: d.rating ? `${n(d.rating.toFixed(1))}/${n(5)}` : '—', l: tr('নাগরিক রেটিং', 'Citizen rating'), sub: tr('নিষ্পন্ন রিপোর্টে', 'On resolved reports') },
    { v: n(d.objections), l: tr('আপত্তি সিদ্ধান্তের অপেক্ষায়', 'Objections to decide'), to: '/admin/objections' },
    { v: n(d.ai), l: tr('AI শনাক্তকরণ যাচাই বাকি', 'AI detections unreviewed'), sub: tr('অফিসার অ্যাপে', 'In the officer app') },
    { v: n(d.alerts), l: tr('সক্রিয় সতর্কতা', 'Active alerts'), to: '/admin/content' },
    { v: n(d.sos), l: tr('সক্রিয় SOS', 'Active SOS'), sub: tr(`${n(d.onDuty)} জন অফিসার ডিউটিতে`, `${d.onDuty} officers on duty`), to: '/admin/sos' },
    { v: taka(d.collected), l: tr('আদায়কৃত জরিমানা', 'Fines collected'), sub: tr(`বকেয়া ${taka(d.outstanding)}`, `${taka(d.outstanding)} outstanding`) },
  ];

  return (
    <>
      <PageHeader title={tr('ড্যাশবোর্ড', 'Dashboard')} back={false} />
      <div className="content stack-lg" style={{ maxWidth: 1280 }}>
        <Banner tone="warn">
          {tr(
            'ডেমো কন্ট্রোল রুম: প্রোটোটাইপে লগইন নেই। আসল ব্যবস্থায় শুধু অনুমোদিত DMP কর্মী ঢুকবেন এবং প্রতিটি পদক্ষেপ অডিট লগে থাকবে। সব সংখ্যা এই ডিভাইসের নমুনা তথ্য থেকে হিসাব করা।',
            'Demo control room: the prototype has no sign-in. A real system would admit only authorised DMP staff and keep an audit log of every action. All figures are computed from the sample data on this device.',
          )}
        </Banner>
        <div className="kpi-grid">
          {kpis.map((k) => {
            const body = (
              <>
                <div className="v">{k.v}</div>
                <div className="l">{k.l}</div>
                {k.sub && <div className="d">{k.sub}</div>}
              </>
            );
            return k.to ? (
              <Link key={k.l} to={k.to} className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>
                {body}
              </Link>
            ) : (
              <div key={k.l} className="stat">
                {body}
              </div>
            );
          })}
        </div>

        <div className="cols even">
          <section className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>{tr('ধরন অনুযায়ী রিপোর্ট', 'Reports by category')}</h2>
            <Bars
              rows={d.byCat.slice(0, 8).map(([k, v]) => {
                const [kind, cat] = k.split(':');
                return { label: tx(categoryLabel(kind as CitizenReport['kind'], cat)), value: v };
              })}
            />
          </section>
          <section className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>{tr('অবস্থা অনুযায়ী', 'By status')}</h2>
            <Bars rows={d.byStatus.map(([k, v]) => ({ label: tx(REPORT_STATUS[k]), value: v }))} color="var(--info)" />
            <h3 style={{ fontSize: '0.95rem', marginTop: 8 }}>{tr('কোন ডেস্কে গেছে', 'Routed to')}</h3>
            <Bars rows={d.byDesk.map(([k, v]) => ({ label: tx(Object.values(ROUTING).find((x) => x.en === k)), value: v }))} color="var(--dmp-green)" />
          </section>
        </div>

        <section className="card stack">
          <h2 style={{ fontSize: '1.05rem' }}>{tr('সাড়া দেওয়ার সময় (সাম্প্রতিক রিপোর্ট)', 'Response times (recent reports)')}</h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{tr('রেফারেন্স', 'Reference')}</th>
                  <th>{tr('ধরন', 'Type')}</th>
                  <th>{tr('জমা', 'Submitted')}</th>
                  <th>{tr('স্বীকৃতি', 'Acknowledged')}</th>
                  <th>{tr('বন্ধ', 'Closed')}</th>
                  <th>{tr('অবস্থা', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const t = times(r);
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/admin/reports/${r.id}`}>{r.ref}</Link>
                      </td>
                      <td>{tx(KIND_LABEL[r.kind])}</td>
                      <td>{ago(r.createdAt)}</td>
                      <td>{t.ack === undefined ? <span className="muted">{tr('বাকি', 'pending')}</span> : `+${fmtMin(t.ack)}`}</td>
                      <td>{t.close === undefined ? <span className="muted">{tr('চলমান', 'open')}</span> : `+${fmtMin(t.close)}`}</td>
                      <td>{tx(REPORT_STATUS[r.status])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="cols even">
          <section className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>{tr('এলাকার নিরাপত্তা সূচক (সবচেয়ে কম ৫)', 'Area safety score (lowest 5)')}</h2>
            <Bars rows={safety.map((s) => ({ label: tx(s.area.name), value: s.score }))} color="var(--warning)" />
            <p className="tiny muted">{tr('১০০ থেকে বাদ: কাছের সক্রিয় সতর্কতা (গুরুতর ২৫, বড় ১৫, ছোট ৬), গত ৭ দিনের রিপোর্ট প্রতি ৪, দুর্ঘটনা প্রতি আরও ৬।', '100 minus: nearby active alerts (critical 25, major 15, minor 6), 4 per report in the last 7 days, 6 more per crash.')}</p>
          </section>
          <section className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>{tr('মাসিক সক্রিয় ব্যবহারকারী', 'Monthly active users')}</h2>
            <div className="col-chart" role="img" aria-label={tr('অনুকরণকৃত মাসিক ব্যবহারকারী', 'Simulated monthly users')}>
              {SIMULATED_MAU.map((m) => (
                <div key={m.month.en} className="col">
                  <span>{num(m.value)}</span>
                  <span className="b" style={{ height: `${(m.value / maxMau) * 100}%` }} />
                  <span>{tx(m.month)}</span>
                </div>
              ))}
            </div>
            <p className="tiny muted">{tr('অনুকরণকৃত, উদাহরণ হিসেবে দেখানো (ডোরাকাটা)। প্রোটোটাইপে কোনো আসল ব্যবহার মাপা হয় না।', 'Simulated and illustrative (hatched). The prototype measures no real usage.')}</p>
          </section>
        </div>
      </div>
    </>
  );
}

type Layer = 'reports' | 'alerts' | 'officers' | 'sos' | 'congestion' | 'schools';

function ControlMap() {
  const { state } = useApp();
  const { tr, tx } = useI18n();
  const nav = useNavigate();
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ reports: true, alerts: true, officers: true, sos: true, congestion: true, schools: false });
  const toggle = (l: Layer) => setLayers((x) => ({ ...x, [l]: !x[l] }));
  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = [];
    if (layers.reports)
      state.reports
        .filter((r) => !r.duplicateOf && OPEN.includes(r.status))
        .forEach((r) => m.push({ id: r.id, lat: r.lat, lng: r.lng, kind: 'report', color: r.status === 'received' ? '#c62828' : '#1d4ed8', title: `${r.ref} · ${tx(categoryLabel(r.kind, r.category))}`, onClick: () => nav(`/admin/reports/${r.id}`) }));
    if (layers.alerts) state.alerts.filter((a) => a.status === 'active').forEach((a) => m.push({ id: a.id, lat: a.lat, lng: a.lng, kind: 'alert', color: '#b45309', title: `${tx(ALERT_TYPES[a.type].label)} · ${tx(a.title)}`, onClick: () => nav('/admin/content') }));
    if (layers.officers) state.officers.forEach((o) => m.push({ id: o.id, lat: o.lat, lng: o.lng, kind: 'officer', color: o.onDuty ? '#027068' : '#8a949c', title: `${tx(o.name)} · ${o.onDuty ? tr('ডিউটিতে', 'on duty') : tr('ডিউটির বাইরে', 'off duty')}` }));
    if (layers.sos) state.sosEvents.filter((s) => s.status === 'active').forEach((s) => m.push({ id: s.id, lat: s.lat, lng: s.lng, kind: 'sos', color: '#d0102b', title: 'SOS', onClick: () => nav('/admin/sos') }));
    return m;
  }, [state, layers, tx, tr, nav]);
  const circles = useMemo<MapCircle[]>(() => {
    const c: MapCircle[] = [];
    if (layers.congestion) congestion(state).forEach((x) => c.push({ id: `cg${x.area.id}`, lat: x.area.lat, lng: x.area.lng, radius: 700, color: CONGESTION_COLORS[x.level], opacity: 0.25, title: `${tx(x.area.name)} · ${tr('যানজট', 'congestion')} ${x.level}/3` }));
    if (layers.schools) SCHOOL_ZONES.forEach((z) => c.push({ id: z.id, lat: z.lat, lng: z.lng, radius: 250, color: '#7c3aed', opacity: 0.25, title: tx(z.name) }));
    return c;
  }, [state, layers, tx, tr]);
  const labels: Record<Layer, string> = {
    reports: tr('রিপোর্ট', 'Reports'),
    alerts: tr('সতর্কতা', 'Alerts'),
    officers: tr('অফিসার', 'Officers'),
    sos: 'SOS',
    congestion: tr('যানজট', 'Congestion'),
    schools: tr('স্কুল এলাকা', 'School zones'),
  };
  return (
    <>
      <PageHeader title={tr('কন্ট্রোল ম্যাপ', 'Control map')} back={false} />
      <div className="content stack" style={{ maxWidth: 1280 }}>
        <div className="layer-toggles" role="group" aria-label={tr('স্তর', 'Layers')}>
          {(Object.keys(labels) as Layer[]).map((l) => (
            <button key={l} type="button" className="chip" aria-pressed={layers[l]} onClick={() => toggle(l)}>
              {labels[l]}
            </button>
          ))}
        </div>
        <MapView center={{ lat: 23.7808, lng: 90.4 }} zoom={12} markers={markers} circles={circles} label={tr('কন্ট্রোল ম্যাপ', 'Control map')} height="calc(100vh - 230px)" />
        <p className="tiny muted">
          <FileWarning size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /> {tr('লাল: নতুন রিপোর্ট · নীল: কাজ চলছে · সবুজ: অফিসার · লাল ত্রিভুজ: SOS', 'Red: new report · blue: in progress · green: officer · red triangle: SOS')}
        </p>
      </div>
    </>
  );
}
