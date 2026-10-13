import { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Camera,
  CarFront,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  House,
  ImageIcon,
  LogOut,
  Map as MapIcon,
  Navigation,
  Printer,
  ReceiptText,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { StaffShell, type StaffNavItem } from '../../components/StaffShell';
import { Banner, DemoTag, Empty, ErrorBanner, Field, PageHeader, Sheet, StatusBadge, SubmitButton, Switch, Tabs } from '../../components/ui';
import { MapView, type MapMarker } from '../../components/MapView';
import { EvidenceViewer } from '../../components/Evidence';
import { QrScanner } from '../../components/QrScanner';
import { Icon } from '../../components/Icon';
import { KIND_LABEL, Progress } from '../citizen/MyReports';
import { categoryLabel } from '../citizen/Report';
import { demoLicence } from '../citizen/Account';
import { ALERT_TYPES, REPORT_CATEGORIES, SAMPLE_FINES, SOS_TYPES, VIOLATIONS } from '../../data/catalog';
import { AREAS, RICKSHAWS } from '../../data/seed';
import { THANAS } from '../../data/thanas';
import { simulate } from '../../services/api';
import { distanceKm } from '../../services/geo';
import { setReportStatus } from '../../services/workflow';
import { signToken, verifyToken, type SignedPayload, type VerifyResult } from '../../services/crypto';
import { shortHash } from '../../lib/format';
import type { CitizenReport, L, Officer, ReportKind, ReportStatus, ScanLogEntry, TrafficCase, ViolationCode } from '../../data/types';

/** Report kinds a street officer acts on. Complaints, cyber and women-and-children reports are routed to
 * specialist desks from the control room instead. */
const FIELD_KINDS: ReportKind[] = ['incident', 'rickshaw', 'joint_accident'];
const OPEN: ReportStatus[] = ['received', 'verified', 'assigned', 'en_route', 'on_scene'];
const NEARBY_KM = 6;

function useOfficer(): Officer {
  const { state } = useApp();
  return state.officers.find((o) => o.id === state.session.officerId) ?? state.officers[0];
}

function useTaskLists() {
  const { state } = useApp();
  const me = useOfficer();
  return useMemo(() => {
    const field = state.reports.filter((r) => FIELD_KINDS.includes(r.kind) && !r.duplicateOf);
    const withKm = (r: CitizenReport) => ({ r, km: distanceKm(me, r) });
    const mine = field.filter((r) => r.assignedOfficerId === me.id && OPEN.includes(r.status)).map(withKm);
    const nearby = field
      .filter((r) => !r.assignedOfficerId && (r.status === 'received' || r.status === 'verified'))
      .map(withKm)
      .filter((x) => x.km <= NEARBY_KM)
      .sort((a, b) => a.km - b.km);
    const done = field.filter((r) => r.assignedOfficerId === me.id && (r.status === 'resolved' || r.status === 'rejected')).map(withKm);
    const ai = state.cases.filter((c) => c.source === 'ai_camera' && !c.officerVerified && c.status !== 'cancelled');
    const sos = state.sosEvents.filter((s) => s.status === 'active');
    return { mine, nearby, done, ai, sos };
  }, [state.reports, state.cases, state.sosEvents, me]);
}

/** Entry point for /officer/*: a demo profile picker, then the officer app. */
export default function OfficerRoot() {
  const { state } = useApp();
  const me = useOfficer();
  const { tx } = useI18n();
  const lists = useTaskLists();
  if (!state.session.officerSignedIn) return <OfficerSignIn />;
  const nav: StaffNavItem[] = [
    { to: '/officer', label: { bn: 'হোম', en: 'Home' }, icon: House },
    { to: '/officer/tasks', label: { bn: 'কাজ', en: 'Tasks' }, icon: ClipboardList, badge: lists.mine.length + lists.sos.length },
    { to: '/officer/scan', label: { bn: 'QR যাচাই', en: 'Scan QR' }, icon: ScanLine },
    { to: '/officer/ai', label: { bn: 'AI যাচাই', en: 'AI review' }, icon: Camera, badge: lists.ai.length },
    { to: '/officer/map', label: { bn: 'মানচিত্র', en: 'Map' }, icon: MapIcon },
    { to: '/officer/challan', label: { bn: 'ই-চালান', en: 'e-Challan' }, icon: ReceiptText },
  ];
  return (
    <StaffShell variant="officer" title={{ bn: 'DMP অফিসার', en: 'DMP Officer' }} subtitle={tx(me.name)} nav={nav}>
      <Routes>
        <Route index element={<OfficerHome />} />
        <Route path="tasks" element={<OfficerTasks />} />
        <Route path="tasks/:id" element={<OfficerTask />} />
        <Route path="sos/:id" element={<OfficerSos />} />
        <Route path="ai" element={<AiQueue />} />
        <Route path="ai/:id" element={<AiReview />} />
        <Route path="scan" element={<OfficerScan />} />
        <Route path="challan" element={<IssueChallan />} />
        <Route path="map" element={<OfficerMap />} />
        <Route path="*" element={<Navigate to="/officer" replace />} />
      </Routes>
    </StaffShell>
  );
}

function OfficerSignIn() {
  const { state, update } = useApp();
  const { tr, tx } = useI18n();
  const [pick, setPick] = useState(state.session.officerId);
  return (
    <StaffShell variant="admin" title={{ bn: 'DMP অফিসার', en: 'DMP Officer' }} nav={[]}>
      <PageHeader title={tr('অফিসার হিসেবে প্রবেশ', 'Officer sign-in')} back="/" />
      <div className="content stack" style={{ maxWidth: 640 }}>
        <Banner tone="warn">
          {tr(
            'ডেমো: নিচের নমুনা অফিসার প্রোফাইল থেকে একটি বেছে নিন। আসল অ্যাপে DMP-এর কর্মী-লগইন ব্যবহার হবে; এখানে কোনো পাসওয়ার্ড চাওয়া বা রাখা হয় না।',
            'Demo: choose one of the sample officer profiles below. A real app would use DMP staff sign-in; no password is asked for or stored here.',
          )}
        </Banner>
        <div role="radiogroup" aria-label={tr('অফিসার প্রোফাইল', 'Officer profile')} className="stack" style={{ gap: 8 }}>
          {state.officers.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} className="choice" style={{ textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => setPick(o.id)}>
              <UserRound size={24} aria-hidden="true" />
              <span className="grow">
                <span className="strong" style={{ display: 'block' }}>
                  {tx(o.name)}
                </span>
                <span className="small muted">{tx(o.division)}</span>
              </span>
              <span className={`badge ${o.onDuty ? 'success' : ''}`}>{o.onDuty ? tr('ডিউটিতে', 'On duty') : tr('ডিউটির বাইরে', 'Off duty')}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn primary block"
          onClick={() =>
            update((d) => {
              d.session.officerId = pick;
              d.session.officerSignedIn = true;
            })
          }
        >
          <ShieldCheck size={18} aria-hidden="true" /> {tr('চালিয়ে যান', 'Continue')}
        </button>
      </div>
    </StaffShell>
  );
}

function reportIcon(r: CitizenReport) {
  if (r.kind === 'rickshaw') return 'Bike';
  if (r.kind === 'joint_accident') return 'Car';
  return REPORT_CATEGORIES.find((c) => c.id === r.category)?.icon ?? 'ClipboardList';
}

function TaskCard({ r, km }: { r: CitizenReport; km: number }) {
  const { state } = useApp();
  const { tr, tx, ago, n } = useI18n();
  const dups = state.reports.filter((x) => x.duplicateOf === r.id).length;
  return (
    <Link to={`/officer/tasks/${r.id}`} className="task-card">
      <span className="t-icon">
        <Icon name={reportIcon(r)} size={22} />
      </span>
      <span className="grow stack" style={{ gap: 2 }}>
        <span className="strong">{tx(categoryLabel(r.kind, r.category))}</span>
        <span className="small muted">
          {tx(r.locationLabel)} · {ago(r.createdAt)} · {tr(`${n(km.toFixed(1))} কিমি`, `${km.toFixed(1)} km`)}
        </span>
        <span className="row wrap" style={{ gap: 6 }}>
          <StatusBadge status={r.status} />
          <span className="badge">{tx(KIND_LABEL[r.kind])}</span>
          {dups > 0 && <span className="badge brand">{tr(`+${n(dups)} একই ঘটনা`, `+${dups} same incident`)}</span>}
        </span>
      </span>
    </Link>
  );
}

function SosCard({ id }: { id: string }) {
  const { state } = useApp();
  const { tr, tx, ago } = useI18n();
  const s = state.sosEvents.find((x) => x.id === id);
  if (!s) return null;
  const type = SOS_TYPES.find((t) => t.id === s.type);
  return (
    <Link to={`/officer/sos/${s.id}`} className="task-card sos">
      <span className="t-icon">
        <Siren size={22} aria-hidden="true" />
      </span>
      <span className="grow stack" style={{ gap: 2 }}>
        <span className="strong">SOS · {tx(type?.label)}</span>
        <span className="small muted">
          {tx(THANAS.find((t) => t.id === s.thanaId)?.name)} · {ago(s.at)}
        </span>
        <span className="row wrap" style={{ gap: 6 }}>
          <span className="badge danger">{s.assignedOfficerId ? tr('সাড়া দেওয়া হচ্ছে', 'Being responded to') : tr('সাড়ার অপেক্ষায়', 'Awaiting response')}</span>
          {s.sharing && <span className="badge">{tr('লাইভ অবস্থান', 'Live location')}</span>}
          <DemoTag />
        </span>
      </span>
    </Link>
  );
}

function OfficerHome() {
  const { update, toast } = useApp();
  const { tr, tx, n } = useI18n();
  const me = useOfficer();
  const { mine, nearby, ai, sos, done } = useTaskLists();
  const today = new Date().toDateString();
  const doneToday = done.filter(({ r }) => new Date(r.timeline[r.timeline.length - 1]?.at ?? 0).toDateString() === today).length;
  return (
    <div className="content stack-lg">
      <div className="card tinted row wrap" style={{ alignItems: 'flex-start' }}>
        <span style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', color: 'var(--brand-700)', display: 'grid', placeItems: 'center' }}>
          <UserRound size={26} aria-hidden="true" />
        </span>
        <div className="grow" style={{ minWidth: 200 }}>
          <h1 style={{ fontSize: '1.2rem' }}>{tx(me.name)}</h1>
          <div className="small muted">
            {tx(me.rank)} · {tx(me.division)}
          </div>
        </div>
        <div style={{ minWidth: 220 }}>
          <Switch
            checked={me.onDuty}
            onChange={(v) => {
              update((d) => {
                const o = d.officers.find((x) => x.id === me.id);
                if (o) o.onDuty = v;
              });
              toast(v ? tr('ডিউটি শুরু হয়েছে', 'You are on duty') : tr('ডিউটি শেষ', 'You are off duty'), 'info');
            }}
            label={tr('ডিউটিতে আছি', 'On duty')}
            description={tr('ডিউটিতে থাকলে কন্ট্রোল রুম কাজ দিতে পারে', 'The control room can assign tasks while you are on duty')}
          />
        </div>
      </div>

      <div className="stats">
        <Link to="/officer/tasks" className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="v">{n(mine.length)}</div>
          <div className="l">{tr('আমার চলমান কাজ', 'My active tasks')}</div>
        </Link>
        <Link to="/officer/tasks?tab=nearby" className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="v">{n(nearby.length)}</div>
          <div className="l">{tr(`${n(NEARBY_KM)} কিমির মধ্যে নতুন`, `New within ${NEARBY_KM} km`)}</div>
        </Link>
        <Link to="/officer/ai" className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="v">{n(ai.length)}</div>
          <div className="l">{tr('AI শনাক্তকরণ যাচাই বাকি', 'AI detections to review')}</div>
        </Link>
        <div className="stat">
          <div className="v">{n(doneToday)}</div>
          <div className="l">{tr('আজ নিষ্পন্ন', 'Closed today')}</div>
        </div>
      </div>

      {sos.length > 0 && (
        <section className="stack">
          <h2 className="section-title" style={{ color: 'var(--sos)' }}>
            {tr('সক্রিয় SOS', 'Active SOS')}
          </h2>
          {sos.map((s) => (
            <SosCard key={s.id} id={s.id} />
          ))}
        </section>
      )}

      <section className="stack">
        <h2 className="section-title">{tr('দ্রুত কাজ', 'Quick actions')}</h2>
        <div className="quick-grid">
          <Link to="/officer/scan" className="quick">
            <span className="q-icon">
              <ScanLine size={22} aria-hidden="true" />
            </span>
            <span>{tr('QR যাচাই', 'Scan QR')}</span>
          </Link>
          <Link to="/officer/challan" className="quick">
            <span className="q-icon">
              <ReceiptText size={22} aria-hidden="true" />
            </span>
            <span>{tr('ই-চালান', 'e-Challan')}</span>
          </Link>
          <Link to="/officer/ai" className="quick">
            <span className="q-icon">
              <Camera size={22} aria-hidden="true" />
            </span>
            <span>{tr('AI মামলা যাচাই', 'Review AI cases')}</span>
          </Link>
          <Link to="/officer/map" className="quick">
            <span className="q-icon">
              <MapIcon size={22} aria-hidden="true" />
            </span>
            <span>{tr('মানচিত্র', 'Map')}</span>
          </Link>
        </div>
      </section>

      <section className="stack">
        <h2 className="section-title">
          {tr('পরের কাজ', 'Next up')}
          <Link to="/officer/tasks">{tr('সব দেখুন', 'See all')}</Link>
        </h2>
        {mine.length + nearby.length === 0 ? (
          <Empty icon={<CheckCircle2 size={28} />} title={tr('এখন কোনো কাজ নেই', 'No tasks right now')} body={tr('নাগরিক অ্যাপ থেকে একটি রিপোর্ট পাঠিয়ে দেখুন; এখানে চলে আসবে।', 'Send a report from the citizen app to see it arrive here.')} />
        ) : (
          [...mine, ...nearby].slice(0, 4).map(({ r, km }) => <TaskCard key={r.id} r={r} km={km} />)
        )}
      </section>

      <button
        type="button"
        className="btn ghost"
        onClick={() =>
          update((d) => {
            d.session.officerSignedIn = false;
          })
        }
      >
        <LogOut size={18} aria-hidden="true" /> {tr('অন্য অফিসার হিসেবে প্রবেশ', 'Switch officer')}
      </button>
    </div>
  );
}

function OfficerTasks() {
  const { tr, n } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as 'mine' | 'nearby' | 'done') || 'mine';
  const { mine, nearby, done, sos } = useTaskLists();
  const list = tab === 'mine' ? mine : tab === 'nearby' ? nearby : done;
  return (
    <>
      <PageHeader title={tr('কাজের তালিকা', 'Tasks')} back="/officer" />
      <div className="content stack" style={{ maxWidth: 860 }}>
        {sos.map((s) => (
          <SosCard key={s.id} id={s.id} />
        ))}
        <Tabs
          label={tr('কাজের ধরন', 'Task list')}
          value={tab}
          onChange={(v) => setParams({ tab: v }, { replace: true })}
          tabs={[
            { id: 'mine', label: tr(`আমার (${n(mine.length)})`, `Mine (${mine.length})`) },
            { id: 'nearby', label: tr(`কাছাকাছি নতুন (${n(nearby.length)})`, `New nearby (${nearby.length})`) },
            { id: 'done', label: tr('নিষ্পন্ন', 'Closed') },
          ]}
        />
        {list.length === 0 ? (
          <Empty
            icon={<ClipboardList size={28} />}
            title={tab === 'mine' ? tr('আপনার কাছে চলমান কাজ নেই', 'You have no active tasks') : tab === 'nearby' ? tr('কাছাকাছি নতুন রিপোর্ট নেই', 'No new reports nearby') : tr('এখনো কিছু নিষ্পন্ন হয়নি', 'Nothing closed yet')}
            body={tab === 'mine' ? tr('"কাছাকাছি নতুন" থেকে একটি রিপোর্ট নিন।', 'Take a report from "New nearby".') : undefined}
          />
        ) : (
          list.map(({ r, km }) => <TaskCard key={r.id} r={r} km={km} />)
        )}
      </div>
    </>
  );
}

const OUTCOMES: { id: string; label: L }[] = [
  { id: 'cleared', label: { bn: 'বাধা সরানো হয়েছে / যান চলাচল স্বাভাবিক', en: 'Obstruction cleared, traffic normal' } },
  { id: 'warned', label: { bn: 'ঘটনাস্থলে সতর্ক করা হয়েছে', en: 'Warned on the spot' } },
  { id: 'challan', label: { bn: 'ই-চালান (মামলা) দেওয়া হয়েছে', en: 'e-Challan (case) issued' } },
  { id: 'referred', label: { bn: 'থানায় পাঠানো হয়েছে', en: 'Referred to the thana' } },
  { id: 'agency', label: { bn: 'সংশ্লিষ্ট সংস্থাকে জানানো হয়েছে (সিগন্যাল/রাস্তা)', en: 'Passed to the responsible agency (signal or road)' } },
];
const REJECT_REASONS: { id: string; label: L }[] = [
  { id: 'not_found', label: { bn: 'ঘটনাস্থলে কিছু পাওয়া যায়নি', en: 'Nothing found at the location' } },
  { id: 'no_violation', label: { bn: 'আইন লঙ্ঘন নয়', en: 'Not a violation' } },
  { id: 'evidence', label: { bn: 'প্রমাণ যথেষ্ট নয়', en: 'Not enough evidence' } },
];

function OfficerTask() {
  const { id } = useParams();
  const { state, update, notify, toast } = useApp();
  const { tr, tx, dateTime, n } = useI18n();
  const me = useOfficer();
  const nav = useNavigate();
  const r = state.reports.find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<null | (() => void)>(null);
  const [outcome, setOutcome] = useState(OUTCOMES[0].id);
  const [note, setNote] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0].id);

  if (!r)
    return (
      <>
        <PageHeader title={tr('কাজ', 'Task')} back="/officer/tasks" />
        <div className="content">
          <Empty icon={<ClipboardList size={28} />} title={tr('কাজটি পাওয়া যায়নি', 'Task not found')} />
        </div>
      </>
    );

  const km = distanceKm(me, r);
  const mineTask = r.assignedOfficerId === me.id;
  const other = r.assignedOfficerId && !mineTask ? state.officers.find((o) => o.id === r.assignedOfficerId) : undefined;
  const dups = state.reports.filter((x) => x.duplicateOf === r.id);
  const thana = THANAS.find((t) => t.id === r.thanaId);
  // Matches the promise in the report form: "hide from the public" still lets the verifying officer see the name;
  // only an anonymous report hides it from the officer too.
  const identityHidden = r.anonymous || !r.reporterName;

  const act = async (status: ReportStatus, noteL: L, assign?: boolean) => {
    setBusy(true);
    setFailed(null);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 450 });
      update((d) => setReportStatus(d, r.id, status, noteL, notify, assign ? me.id : undefined));
      toast(tr(`অবস্থা: ${REPORT_LABEL[status].bn}`, `Status: ${REPORT_LABEL[status].en}`));
    } catch {
      setFailed(() => () => void act(status, noteL, assign));
    } finally {
      setBusy(false);
    }
  };

  const outcomeL = OUTCOMES.find((o) => o.id === outcome)!.label;
  const resolveNote: L = note.trim() ? { bn: `${outcomeL.bn}। ${note.trim()}`, en: `${outcomeL.en}. ${note.trim()}` } : outcomeL;

  return (
    <>
      <PageHeader title={r.ref} back="/officer/tasks" />
      <div className="content cols">
        <div className="stack-lg">
          <div className="card row" style={{ alignItems: 'flex-start' }}>
            <span className="t-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#13222a', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={reportIcon(r)} size={24} />
            </span>
            <div className="grow">
              <h2 style={{ fontSize: '1.1rem' }}>{tx(categoryLabel(r.kind, r.category))}</h2>
              <div className="small muted">
                {tx(r.locationLabel)} · {dateTime(r.createdAt)} · {tr(`${n(km.toFixed(1))} কিমি দূরে`, `${km.toFixed(1)} km away`)}
              </div>
              <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                <StatusBadge status={r.status} />
                <span className="badge">{tx(KIND_LABEL[r.kind])}</span>
              </div>
            </div>
          </div>

          {dups.length > 0 && (
            <Banner tone="brand">
              {tr(`আরও ${n(dups.length)}টি রিপোর্ট একই ঘটনার; এখানে নেওয়া পদক্ষেপ সবগুলোতে যাবে এবং সবাই জানবেন।`, `${dups.length} more reports are about the same incident; actions here apply to all of them and everyone is told.`)}
            </Banner>
          )}

          {other && OPEN.includes(r.status) && <Banner tone="info">{tr(`এই কাজটি ${tx(other.name)}-কে দেওয়া হয়েছে।`, `This task is assigned to ${tx(other.name)}.`)}</Banner>}

          {OPEN.includes(r.status) && !other && (
            <section className="card stack" aria-label={tr('পদক্ষেপ', 'Actions')}>
              <h3>{tr('পরের ধাপ', 'Next step')}</h3>
              {failed && <ErrorBanner onRetry={failed} />}
              {!r.assignedOfficerId && (
                <SubmitButton busy={busy} onClick={() => void act('assigned', { bn: `${me.name.bn} কাজটি নিয়েছেন`, en: `${me.name.en} accepted the task` }, true)}>
                  <BadgeCheck size={18} aria-hidden="true" /> {tr('কাজটি নিন', 'Accept task')}
                </SubmitButton>
              )}
              {mineTask && r.status === 'assigned' && (
                <SubmitButton busy={busy} onClick={() => void act('en_route', { bn: 'অফিসার ঘটনাস্থলের পথে', en: 'Officer on the way' })}>
                  <Navigation size={18} aria-hidden="true" /> {tr('রওনা দিয়েছি', 'On my way')}
                </SubmitButton>
              )}
              {mineTask && r.status === 'en_route' && (
                <SubmitButton busy={busy} onClick={() => void act('on_scene', { bn: 'অফিসার ঘটনাস্থলে পৌঁছেছেন', en: 'Officer arrived on scene' })}>
                  <MapIcon size={18} aria-hidden="true" /> {tr('ঘটনাস্থলে পৌঁছেছি', 'Arrived on scene')}
                </SubmitButton>
              )}
              {mineTask && r.status === 'on_scene' && (
                <div className="stack">
                  <Field label={tr('কী ব্যবস্থা নেওয়া হলো', 'Action taken')} htmlFor="outcome">
                    <select id="outcome" className="select" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                      {OUTCOMES.map((o) => (
                        <option key={o.id} value={o.id}>
                          {tx(o.label)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {outcome === 'challan' && (
                    <Link to={`/officer/challan?report=${r.id}`} className="btn outline">
                      <ReceiptText size={18} aria-hidden="true" /> {tr('ই-চালান ফর্ম খুলুন', 'Open the e-challan form')}
                    </Link>
                  )}
                  <Field label={tr('নোট (নাগরিক দেখবেন)', 'Note (the citizen will see it)')} htmlFor="res-note">
                    <textarea id="res-note" className="textarea" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
                  </Field>
                  <SubmitButton busy={busy} onClick={() => void act('resolved', resolveNote)}>
                    <CheckCircle2 size={18} aria-hidden="true" /> {tr('নিষ্পত্তি করুন', 'Mark resolved')}
                  </SubmitButton>
                </div>
              )}
              {(mineTask || !r.assignedOfficerId) && (
                <button type="button" className="btn ghost" onClick={() => setRejectOpen(true)} disabled={busy}>
                  <XCircle size={18} aria-hidden="true" /> {tr('ব্যবস্থা নেওয়ার মতো নয়', 'Not actionable')}
                </button>
              )}
            </section>
          )}

          <section className="stack">
            <div>
              <span className="tag-heading">{tr('অগ্রগতি', 'Progress')}</span>
              <div className="tag-rule" />
            </div>
            <Progress r={r} />
          </section>
        </div>

        <div className="stack-lg">
          <MapView
            center={r}
            zoom={14}
            fit
            markers={[
              { id: r.id, lat: r.lat, lng: r.lng, kind: 'report', color: '#c62828', title: tx(r.locationLabel) },
              { id: 'me', lat: me.lat, lng: me.lng, kind: 'officer', color: '#027068', title: tr('আপনি', 'You') },
            ]}
            label={tr('ঘটনাস্থল ও আপনার অবস্থান', 'Incident and your position')}
            height={260}
          />
          <a className="btn outline" href={`https://www.openstreetmap.org/directions?route=${me.lat}%2C${me.lng}%3B${r.lat}%2C${r.lng}`} target="_blank" rel="noopener noreferrer">
            <Navigation size={18} aria-hidden="true" /> {tr('পথনির্দেশ (OpenStreetMap)', 'Directions (OpenStreetMap)')}
          </a>
          <div className="kv">
            <div>{tr('থানা', 'Thana')}</div>
            <div>{tx(thana?.name)}</div>
            {r.vehicleNo && (
              <>
                <div>{tr('গাড়ি', 'Vehicle')}</div>
                <div>{r.vehicleNo}</div>
              </>
            )}
            <div>{tr('রিপোর্টকারী', 'Reporter')}</div>
            <div>
              {identityHidden ? (
                <span className="row" style={{ gap: 6 }}>
                  <ShieldCheck size={16} aria-hidden="true" /> {tr('পরিচয় সুরক্ষিত', 'Identity protected')}
                </span>
              ) : (
                <>
                  {r.reporterName} · <span className="muted">{r.hideIdentity ? tr('জনসমক্ষে গোপন; কাউকে জানাবেন না', 'hidden from the public; do not disclose') : tr('যোগাযোগ কন্ট্রোল রুমের মাধ্যমে', 'contact via the control room')}</span>
                </>
              )}
            </div>
          </div>
          <div className="card flat">
            <div className="small muted" style={{ marginBottom: 6 }}>
              {tr('বিবরণ', 'Description')}
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{r.description}</p>
          </div>
          {r.kind === 'joint_accident' && r.meta && (
            <div className="card flat stack" style={{ gap: 4 }}>
              <div className="strong small">{tr('অন্য পক্ষ', 'Other party')}</div>
              <div className="small">
                {r.meta.otherName} · {r.meta.otherVehicle}
              </div>
              <div className="small muted">
                {tr('লাইসেন্স', 'Licence')}: {r.meta.otherLicense}
              </div>
            </div>
          )}
          {r.photos.length > 0 && (
            <section className="stack">
              <h3 className="section-title">{tr('ছবি ও যাচাই', 'Photos and checks')}</h3>
              {r.photos.map((p) => (
                <div key={p.hash} className="card flat stack" style={{ padding: 10, gap: 6 }}>
                  <div className="row">
                    {p.thumb ? (
                      <img src={p.thumb} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
                        <ImageIcon size={20} aria-hidden="true" />
                      </span>
                    )}
                    <div className="grow small">
                      <div className="strong">{p.name}</div>
                      <div className="muted tiny">SHA-256 {shortHash(p.hash)}</div>
                    </div>
                    <span className={`badge ${p.trust === 'high' ? 'success' : p.trust === 'needs_review' ? 'warn' : 'danger'}`}>
                      {p.trust === 'high' ? tr('মাঝারি আস্থা', 'Moderate trust') : p.trust === 'needs_review' ? tr('যাচাই প্রয়োজন', 'Needs review') : tr('গ্রহণযোগ্য নয়', 'Not acceptable')}
                    </span>
                  </div>
                  <ul className="tiny muted" style={{ margin: 0, paddingLeft: 18 }}>
                    {p.trustReasons.map((t) => (
                      <li key={t.en}>{tx(t)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      <Sheet open={rejectOpen} onClose={() => setRejectOpen(false)} title={tr('ব্যবস্থা নেওয়ার মতো নয়', 'Not actionable')}>
        <div className="stack">
          <Field label={tr('কারণ (নাগরিক দেখবেন)', 'Reason (the citizen will see it)')} htmlFor="rej">
            <select id="rej" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REJECT_REASONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {tx(o.label)}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              setRejectOpen(false);
              void act('rejected', REJECT_REASONS.find((x) => x.id === reason)!.label, !r.assignedOfficerId).then(() => nav('/officer/tasks'));
            }}
          >
            {tr('নিশ্চিত করুন', 'Confirm')}
          </button>
        </div>
      </Sheet>
    </>
  );
}

const REPORT_LABEL: Record<ReportStatus, L> = {
  queued: { bn: 'পাঠানোর অপেক্ষায়', en: 'Waiting to send' },
  received: { bn: 'জমা হয়েছে', en: 'Received' },
  verified: { bn: 'যাচাই হয়েছে', en: 'Verified' },
  assigned: { bn: 'আপনাকে দেওয়া হয়েছে', en: 'Assigned to you' },
  en_route: { bn: 'পথে', en: 'On the way' },
  on_scene: { bn: 'ঘটনাস্থলে', en: 'On scene' },
  resolved: { bn: 'নিষ্পত্তি', en: 'Resolved' },
  rejected: { bn: 'গ্রহণযোগ্য নয়', en: 'Not accepted' },
};

function OfficerSos() {
  const { id } = useParams();
  const { state, update, notify, toast } = useApp();
  const { tr, tx, dateTime } = useI18n();
  const me = useOfficer();
  const s = state.sosEvents.find((x) => x.id === id);
  if (!s)
    return (
      <>
        <PageHeader title="SOS" back="/officer" />
        <div className="content">
          <Empty icon={<Siren size={28} />} title={tr('SOS পাওয়া যায়নি', 'SOS not found')} />
        </div>
      </>
    );
  const type = SOS_TYPES.find((t) => t.id === s.type);
  const responder = state.officers.find((o) => o.id === s.assignedOfficerId);
  return (
    <>
      <PageHeader title={`SOS · ${tx(type?.label)}`} back="/officer" />
      <div className="content cols">
        <div className="stack">
          <Banner tone="warn">{tr('ডেমো SOS: নাগরিক অ্যাপ থেকে পাঠানো; কোনো আসল জরুরি সেবায় যায়নি।', 'Demo SOS sent from the citizen app; it did not reach any real emergency service.')}</Banner>
          <div className="kv">
            <div>{tr('সময়', 'Time')}</div>
            <div>{dateTime(s.at)}</div>
            <div>{tr('নিকটস্থ থানা', 'Nearest thana')}</div>
            <div>{tx(THANAS.find((t) => t.id === s.thanaId)?.name)}</div>
            <div>{tr('দূরত্ব', 'Distance')}</div>
            <div>{distanceKm(me, s).toFixed(1)} km</div>
            <div>{tr('লাইভ অবস্থান', 'Live location')}</div>
            <div>{s.sharing ? tr('চালু', 'On') : tr('বন্ধ', 'Off')}</div>
            <div>{tr('অবস্থা', 'Status')}</div>
            <div>{s.status === 'active' ? (responder ? tr(`${tx(responder.name)} সাড়া দিচ্ছেন`, `${tx(responder.name)} responding`) : tr('সাড়ার অপেক্ষায়', 'Awaiting response')) : tr('বন্ধ', 'Closed')}</div>
          </div>
          {s.status === 'active' && (
            <div className="btn-row">
              {s.assignedOfficerId !== me.id && (
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    update((d) => {
                      const x = d.sosEvents.find((y) => y.id === s.id);
                      if (x) x.assignedOfficerId = me.id;
                      notify(d, { category: 'system', title: { bn: 'অফিসার আসছেন (ডেমো SOS)', en: 'An officer is coming (demo SOS)' }, body: me.name, link: '/sos' });
                    });
                    toast(tr('নাগরিককে জানানো হয়েছে যে আপনি আসছেন', 'The citizen was told you are coming'));
                  }}
                >
                  <Navigation size={18} aria-hidden="true" /> {tr('আমি যাচ্ছি', 'I am responding')}
                </button>
              )}
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  update((d) => {
                    const x = d.sosEvents.find((y) => y.id === s.id);
                    if (x) {
                      x.status = 'closed';
                      x.sharing = false;
                    }
                    notify(d, { category: 'system', title: { bn: 'SOS বন্ধ করা হয়েছে', en: 'SOS closed' }, body: { bn: 'অফিসার SOS নিষ্পত্তি করেছেন (ডেমো)', en: 'An officer closed the SOS (demo)' } });
                  });
                  toast(tr('SOS বন্ধ হয়েছে', 'SOS closed'));
                }}
              >
                <CheckCircle2 size={18} aria-hidden="true" /> {tr('SOS বন্ধ করুন', 'Close SOS')}
              </button>
            </div>
          )}
        </div>
        <MapView
          center={s}
          zoom={14}
          fit
          markers={[
            { id: s.id, lat: s.lat, lng: s.lng, kind: 'sos', color: '#d0102b', title: 'SOS' },
            { id: 'me', lat: me.lat, lng: me.lng, kind: 'officer', color: '#027068', title: tr('আপনি', 'You') },
          ]}
          label={tr('SOS অবস্থান', 'SOS location')}
          height={320}
        />
      </div>
    </>
  );
}

function AiQueue() {
  const { state } = useApp();
  const { tr, tx, ago, taka } = useI18n();
  const pending = state.cases.filter((c) => c.source === 'ai_camera' && !c.officerVerified && c.status !== 'cancelled');
  const reviewed = state.cases.filter((c) => c.review).sort((a, b) => b.review!.at.localeCompare(a.review!.at));
  const plate = (c: TrafficCase) => tx(state.vehicles.find((v) => v.id === c.vehicleId)?.regNo);
  return (
    <>
      <PageHeader title={tr('AI শনাক্তকরণ যাচাই', 'AI detection review')} back="/officer" />
      <div className="content stack" style={{ maxWidth: 860 }}>
        <Banner tone="brand">{tr('AI ক্যামেরার কোনো শনাক্তকরণ অফিসারের যাচাই ছাড়া নাগরিকের কাছে নোটিশ হিসেবে যায় না।', 'No AI camera detection reaches a citizen as a notice until an officer has checked it.')}</Banner>
        {pending.length === 0 ? (
          <Empty icon={<Camera size={28} />} title={tr('যাচাইয়ের অপেক্ষায় কিছু নেই', 'Nothing waiting for review')} />
        ) : (
          pending.map((c) => (
            <Link key={c.id} to={`/officer/ai/${c.id}`} className="task-card">
              <span className="t-icon">
                <Icon name={VIOLATIONS[c.violation].icon} size={22} />
              </span>
              <span className="grow stack" style={{ gap: 2 }}>
                <span className="strong">{tx(VIOLATIONS[c.violation].name)}</span>
                <span className="small muted">
                  {plate(c)} · {tx(c.location)} · {ago(c.occurredAt)}
                </span>
                <span className="row wrap" style={{ gap: 6 }}>
                  <span className="badge warn">{tr('যাচাই বাকি', 'Needs review')}</span>
                  <span className="badge">{c.camera}</span>
                  <span className="badge">{taka(c.amount)}</span>
                </span>
              </span>
            </Link>
          ))
        )}
        {reviewed.length > 0 && (
          <section className="stack">
            <h2 className="section-title">{tr('সম্প্রতি যাচাই করা', 'Recently reviewed')}</h2>
            <div className="list">
              {reviewed.map((c) => (
                <div key={c.id} className="list-row" style={{ cursor: 'default' }}>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block' }}>
                      {tx(VIOLATIONS[c.violation].name)} · {plate(c)}
                    </span>
                    <span className="lr-sub">
                      {c.id} · {ago(c.review!.at)}
                    </span>
                  </span>
                  <span className={`badge ${c.review!.outcome === 'confirmed' ? 'success' : ''}`}>{c.review!.outcome === 'confirmed' ? tr('নোটিশ পাঠানো', 'Notice sent') : tr('বাতিল', 'Dismissed')}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

const DISMISS_REASONS: { id: string; label: L }[] = [
  { id: 'plate', label: { bn: 'নম্বর প্লেট অস্পষ্ট / ভুল পড়া', en: 'Plate unclear or misread' } },
  { id: 'exempt', label: { bn: 'জরুরি যান বা ছাড়প্রাপ্ত', en: 'Emergency or exempt vehicle' } },
  { id: 'no_violation', label: { bn: 'ফুটেজে লঙ্ঘন দেখা যায় না', en: 'No violation visible in the footage' } },
  { id: 'fault', label: { bn: 'ক্যামেরা বা সিগন্যালের ত্রুটি', en: 'Camera or signal fault' } },
];

function AiReview() {
  const { id } = useParams();
  const { state, update, notify, toast } = useApp();
  const { tr, tx, dateTime, taka } = useI18n();
  const me = useOfficer();
  const nav = useNavigate();
  const c = state.cases.find((x) => x.id === id);
  const [checks, setChecks] = useState([false, false, false]);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [reason, setReason] = useState(DISMISS_REASONS[0].id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!c)
    return (
      <>
        <PageHeader title={tr('AI যাচাই', 'AI review')} back="/officer/ai" />
        <div className="content">
          <Empty icon={<Camera size={28} />} title={tr('মামলা পাওয়া যায়নি', 'Case not found')} />
        </div>
      </>
    );
  const v = state.vehicles.find((x) => x.id === c.vehicleId);
  const done = c.officerVerified || c.status === 'cancelled';

  const confirm = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 500 });
      const now = new Date();
      update((d) => {
        const x = d.cases.find((y) => y.id === c.id);
        if (!x) return;
        x.officerVerified = true;
        x.dueDate = new Date(now.getTime() + 30 * 86_400_000).toISOString();
        x.review = { officerId: me.id, at: now.toISOString(), outcome: 'confirmed' };
        if (d.profile.vehicleIds.includes(x.vehicleId)) {
          notify(d, { category: 'cases', title: { bn: 'নতুন মামলা (অফিসার যাচাইকৃত)', en: 'New case (checked by an officer)' }, body: { bn: `${v?.regNo.bn ?? ''} · ${VIOLATIONS[x.violation].name.bn}, ${x.location.bn}`, en: `${v?.regNo.en ?? ''} · ${VIOLATIONS[x.violation].name.en}, ${x.location.en}` }, link: `/cases/${x.id}` });
        }
      });
      toast(tr('যাচাই হয়েছে; গাড়ির মালিককে অ্যাপে নোটিশ পাঠানো হয়েছে', 'Confirmed; the vehicle owner was sent an in-app notice'));
      nav('/officer/ai');
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    const label = DISMISS_REASONS.find((x) => x.id === reason)!.label;
    update((d) => {
      const x = d.cases.find((y) => y.id === c.id);
      if (!x) return;
      x.status = 'cancelled';
      x.review = { officerId: me.id, at: new Date().toISOString(), outcome: 'dismissed', note: label.en };
    });
    setDismissOpen(false);
    toast(tr('শনাক্তকরণ বাতিল হয়েছে; কোনো নোটিশ যায়নি', 'Detection dismissed; no notice was sent'), 'info');
    nav('/officer/ai');
  };

  return (
    <>
      <PageHeader title={tr('AI শনাক্তকরণ যাচাই', 'Review AI detection')} back="/officer/ai" />
      <div className="content cols">
        <div className="stack">
          <EvidenceViewer c={c} />
          <div className="kv">
            <div>{tr('লঙ্ঘন', 'Violation')}</div>
            <div>{tx(VIOLATIONS[c.violation].name)}</div>
            <div>{tr('নম্বর প্লেট (AI পড়েছে)', 'Plate (read by AI)')}</div>
            <div>{tx(v?.regNo)}</div>
            <div>{tr('স্থান', 'Place')}</div>
            <div>{tx(c.location)}</div>
            <div>{tr('সময়', 'Time')}</div>
            <div>{dateTime(c.occurredAt)}</div>
            <div>{tr('ক্যামেরা', 'Camera')}</div>
            <div>{c.camera}</div>
            <div>{tr('জরিমানা', 'Fine')}</div>
            <div>
              {taka(c.amount)} <span className="tiny muted">({tr('নমুনা অঙ্ক', 'sample amount')})</span>
            </div>
          </div>
          <p className="small muted">{tx(VIOLATIONS[c.violation].evidence)}</p>
        </div>
        <section className="card stack">
          <h2 style={{ fontSize: '1.1rem' }}>{tr('অফিসারের যাচাই', 'Officer check')}</h2>
          {done ? (
            <Banner tone={c.officerVerified ? 'success' : 'info'}>{c.officerVerified ? tr('ইতিমধ্যে যাচাই করে নোটিশ পাঠানো হয়েছে।', 'Already confirmed and the notice was sent.') : tr('এই শনাক্তকরণ বাতিল করা হয়েছে।', 'This detection was dismissed.')}</Banner>
          ) : (
            <>
              {[tr('নম্বর প্লেট স্পষ্ট ও নিবন্ধনের সঙ্গে মিলেছে', 'The plate is clear and matches the registration'), tr('ফুটেজে লঙ্ঘন স্পষ্ট দেখা যাচ্ছে', 'The violation is clearly visible in the footage'), tr('জরুরি যান বা ছাড়প্রাপ্ত নয়', 'Not an emergency or exempt vehicle')].map((label, i) => (
                <label key={label} className="row check" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((cs) => cs.map((x, j) => (j === i ? e.target.checked : x)))} style={{ width: 20, height: 20, marginTop: 2 }} />
                  <span>{label}</span>
                </label>
              ))}
              {failed && <ErrorBanner onRetry={() => void confirm()} />}
              <SubmitButton busy={busy} disabled={!checks.every(Boolean)} onClick={() => void confirm()}>
                <BadgeCheck size={18} aria-hidden="true" /> {tr('নিশ্চিত করে নোটিশ পাঠান', 'Confirm and send notice')}
              </SubmitButton>
              {!checks.every(Boolean) && <p className="tiny muted">{tr('নোটিশ পাঠাতে তিনটি বিষয়ই নিশ্চিত করুন।', 'Tick all three checks to send the notice.')}</p>}
              <button type="button" className="btn ghost" onClick={() => setDismissOpen(true)}>
                <XCircle size={18} aria-hidden="true" /> {tr('শনাক্তকরণ বাতিল', 'Dismiss detection')}
              </button>
            </>
          )}
        </section>
      </div>
      <Sheet open={dismissOpen} onClose={() => setDismissOpen(false)} title={tr('শনাক্তকরণ বাতিল', 'Dismiss detection')}>
        <div className="stack">
          <Field label={tr('কারণ', 'Reason')} htmlFor="dis">
            <select id="dis" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {DISMISS_REASONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {tx(o.label)}
                </option>
              ))}
            </select>
          </Field>
          <p className="small muted">{tr('বাতিল করলে নাগরিকের কাছে কোনো নোটিশ যাবে না।', 'Dismissing means no notice is sent to the citizen.')}</p>
          <button type="button" className="btn danger" onClick={dismiss}>
            {tr('বাতিল নিশ্চিত করুন', 'Confirm dismissal')}
          </button>
        </div>
      </Sheet>
    </>
  );
}

interface ScanOutcome {
  raw: string;
  res: VerifyResult;
}

function OfficerScan() {
  const { state, update } = useApp();
  const { tr } = useI18n();
  const me = useOfficer();
  const [text, setText] = useState('');
  const [out, setOut] = useState<ScanOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async (raw: string) => {
    setBusy(true);
    const res = await verifyToken(raw);
    setOut({ raw, res });
    setBusy(false);
    const p = res.payload;
    const kind = (p?.t ?? 'wallet') as ScanLogEntry['kind'];
    const subject = kind === 'wallet' ? String(p?.lic ?? '') : kind === 'receipt' ? String(p?.r ?? '') : kind === 'rickshaw' ? String(p?.reg ?? '') : kind === 'cert' ? String(p?.id ?? '') : 'joint';
    const result: ScanLogEntry['result'] = res.ok ? 'valid' : res.reason === 'expired' ? 'expired' : 'invalid';
    update((d) => {
      d.scanLog.unshift({ id: `SL${d.scanLog.length + 1}-${Date.now().toString(36)}`, at: new Date().toISOString(), officerId: me.id, kind, result, subject });
    });
  };

  const walletPayload = (exp: number): SignedPayload => {
    const lic = state.profile.license ?? demoLicence();
    const veh = state.vehicles.filter((v) => state.profile.vehicleIds.includes(v.id)).map((v) => v.regNo.en);
    return { t: 'wallet', exp, sub: state.profile.name, lic: lic.number, cls: lic.class.en, veh, pts: lic.points };
  };

  const samples: { label: string; make: () => Promise<string> }[] = [
    { label: tr('নাগরিকের ওয়ালেট QR', 'Citizen wallet QR'), make: () => signToken(walletPayload(Date.now() + 60_000)) },
    { label: tr('মেয়াদোত্তীর্ণ ওয়ালেট QR (স্ক্রিনশট)', 'Expired wallet QR (screenshot)'), make: () => signToken(walletPayload(Date.now() - 5 * 60_000)) },
    {
      label: tr('বদলানো (জাল) QR', 'Tampered (forged) QR'),
      make: async () => {
        const t = await signToken(walletPayload(Date.now() + 60_000));
        const [a, , sig] = t.split('.');
        const forged = btoa(JSON.stringify({ ...walletPayload(Date.now() + 60_000), pts: 12, sub: 'Someone Else' })).replace(/=+$/, '');
        return `${a}.${forged}.${sig}`;
      },
    },
    { label: tr('ই-রিক্সা QR', 'e-Rickshaw QR'), make: () => signToken({ t: 'rickshaw', reg: RICKSHAWS[1].regNo }) },
  ];
  const paid = state.cases.find((c) => c.payment);
  if (paid?.payment) samples.push({ label: tr('পরিশোধের রসিদ QR', 'Payment receipt QR'), make: () => signToken({ t: 'receipt', r: paid.payment!.receiptNo, c: paid.id, amt: paid.payment!.amountPaid, at: paid.payment!.paidAt }) });

  return (
    <>
      <PageHeader title={tr('QR যাচাই', 'Verify a QR code')} back="/officer" />
      <div className="content cols">
        <div className="stack">
          <QrScanner onResult={(t) => void check(t)} onSample={async () => void check(await samples[0].make())} sampleLabel={tr('ট্যাপ করুন: নাগরিকের নমুনা ওয়ালেট QR স্ক্যান', 'Tap: scan the citizen’s sample wallet QR')} />
          <div className="stack" style={{ gap: 6 }}>
            <span className="small strong">{tr('অন্য নমুনা', 'Other samples')}</span>
            <div className="chips">
              {samples.slice(1).map((s) => (
                <button key={s.label} type="button" className="chip" onClick={async () => void check(await s.make())}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <Field label={tr('অথবা QR-এর লেখা পেস্ট করুন', 'Or paste the QR text')} htmlFor="qr-text">
            <textarea id="qr-text" className="textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="RS1.…" />
          </Field>
          <SubmitButton busy={busy} className="outline" disabled={!text.trim()} onClick={() => void check(text)}>
            <ShieldCheck size={18} aria-hidden="true" /> {tr('যাচাই করুন', 'Verify')}
          </SubmitButton>
          <p className="tiny muted">{tr('স্বাক্ষর আসলেই HMAC-SHA256 দিয়ে যাচাই হয় (ডেমো কী)। প্রতিটি স্ক্যান নাগরিকের ওয়ালেটে "কে স্ক্যান করেছেন" তালিকায় দেখা যায়।', 'Signatures are genuinely checked with HMAC-SHA256 (demo key). Every scan appears in the citizen’s "Who scanned my QR" list.')}</p>
        </div>
        <div>{out ? <ScanResult out={out} /> : <Empty icon={<ScanLine size={28} />} title={tr('ফলাফল এখানে দেখা যাবে', 'The result will appear here')} />}</div>
      </div>
    </>
  );
}

function ScanResult({ out }: { out: ScanOutcome }) {
  const { state } = useApp();
  const { tr, tx, taka, date, time } = useI18n();
  const { res } = out;
  const p = res.payload;
  if (!res.ok && res.reason !== 'expired') {
    return (
      <div className="verdict bad" role="status">
        <XCircle size={28} color="var(--danger)" aria-hidden="true" />
        <div className="stack" style={{ gap: 4 }}>
          <strong>{res.reason === 'signature' ? tr('জাল বা বদলানো QR', 'Forged or altered QR') : tr('চেনা QR নয়', 'Not a recognised QR')}</strong>
          <span className="small">{res.reason === 'signature' ? tr('স্বাক্ষর মেলেনি: QR-এর তথ্য বদলানো হয়েছে। কাগজপত্র আলাদাভাবে যাচাই করুন।', 'The signature does not match: the QR content was changed. Check the papers separately.') : tr('এটি RoadSmart-এর স্বাক্ষরিত কোড নয়।', 'This is not a signed RoadSmart code.')}</span>
        </div>
      </div>
    );
  }
  const expired = !res.ok;
  const head = (
    <div className={`verdict ${expired ? 'warn' : 'ok'}`} role="status">
      {expired ? <ShieldAlert size={28} color="var(--warning)" aria-hidden="true" /> : <BadgeCheck size={28} color="var(--success)" aria-hidden="true" />}
      <div className="stack" style={{ gap: 4 }}>
        <strong>{expired ? tr('মেয়াদোত্তীর্ণ QR', 'Expired QR') : tr('বৈধ ও স্বাক্ষরিত', 'Valid and signed')}</strong>
        <span className="small">{expired ? tr('এটি পুরনো স্ক্রিনশট হতে পারে। নাগরিককে অ্যাপে নতুন QR দেখাতে বলুন।', 'This may be an old screenshot. Ask the citizen to show a fresh QR in the app.') : tr('তথ্য DMP-এর স্বাক্ষরের সঙ্গে মিলেছে।', 'The content matches DMP’s signature.')}</span>
      </div>
    </div>
  );
  if (!p) return head;

  if (p.t === 'wallet') {
    const regs = (p.veh as string[] | undefined) ?? [];
    const vehicles = state.vehicles.filter((v) => regs.includes(v.regNo.en));
    const unpaid = state.cases.filter((c) => c.officerVerified && c.status === 'unpaid' && vehicles.some((v) => v.id === c.vehicleId));
    return (
      <div className="stack">
        {head}
        <div className="kv">
          <div>{tr('নাম', 'Name')}</div>
          <div>{String(p.sub)}</div>
          <div>{tr('লাইসেন্স', 'Licence')}</div>
          <div>
            {String(p.lic)} · {String(p.cls)}
          </div>
          <div>{tr('পয়েন্ট', 'Points')}</div>
          <div>{String(p.pts)} / 12</div>
        </div>
        {vehicles.map((v) => (
          <div key={v.id} className="card flat row">
            <CarFront size={20} aria-hidden="true" />
            <div className="grow small">
              <div className="strong">{tx(v.regNo)}</div>
              <div className="muted">
                {tx(v.kind)} · {tr('ফিটনেস', 'Fitness')} {date(v.fitnessUntil)} · {tr('ট্যাক্স টোকেন', 'Tax token')} {date(v.taxTokenUntil)}
              </div>
            </div>
            <Link to={`/officer/challan?vehicle=${v.id}`} className="btn small outline">
              {tr('ই-চালান', 'e-Challan')}
            </Link>
          </div>
        ))}
        <Banner tone={unpaid.length ? 'warn' : 'success'}>
          {unpaid.length
            ? tr(`${unpaid.length}টি অপরিশোধিত মামলা, মোট ${taka(unpaid.reduce((s, c) => s + c.amount, 0))}`, `${unpaid.length} unpaid cases, ${taka(unpaid.reduce((s, c) => s + c.amount, 0))} in total`)
            : tr('কোনো অপরিশোধিত মামলা নেই', 'No unpaid cases')}
        </Banner>
      </div>
    );
  }
  if (p.t === 'receipt') {
    const c = state.cases.find((x) => x.id === p.c);
    const match = c?.payment?.receiptNo === p.r;
    return (
      <div className="stack">
        {head}
        <div className="kv">
          <div>{tr('রসিদ', 'Receipt')}</div>
          <div>{String(p.r)}</div>
          <div>{tr('মামলা', 'Case')}</div>
          <div>{String(p.c)}</div>
          <div>{tr('পরিশোধ', 'Paid')}</div>
          <div>{taka(Number(p.amt))}</div>
        </div>
        <Banner tone={match ? 'success' : 'danger'}>{match ? tr('DMP-এর রেকর্ডের সঙ্গে মিলেছে: মামলাটি পরিশোধিত।', 'Matches DMP records: the case is paid.') : tr('রেকর্ডে এমন পরিশোধ পাওয়া যায়নি।', 'No such payment found in the records.')}</Banner>
      </div>
    );
  }
  if (p.t === 'rickshaw') {
    const rk = RICKSHAWS.find((x) => x.regNo === p.reg);
    return (
      <div className="stack">
        {head}
        {rk ? (
          <>
            <div className="kv">
              <div>{tr('নিবন্ধন', 'Registration')}</div>
              <div>{rk.regNo}</div>
              <div>{tr('জোন', 'Zone')}</div>
              <div>{tx(rk.zone.name)}</div>
              <div>{tr('চালক', 'Driver')}</div>
              <div>
                {tx(rk.driver.name)} · {rk.driver.license}
              </div>
              <div>{tr('মেয়াদ', 'Valid until')}</div>
              <div>{date(rk.validUntil)}</div>
            </div>
            <Banner tone={rk.status === 'valid' && rk.driver.licenseValid ? 'success' : 'danger'}>
              {rk.status === 'valid' ? (rk.driver.licenseValid ? tr('নিবন্ধন ও চালকের লাইসেন্স বৈধ', 'Registration and driver licence are valid') : tr('চালকের লাইসেন্স বৈধ নয়', 'The driver licence is not valid')) : tr('নিবন্ধনের মেয়াদ শেষ', 'The registration has expired')}
            </Banner>
          </>
        ) : (
          <Banner tone="danger">{tr('নিবন্ধন খুঁজে পাওয়া যায়নি', 'Registration not found')}</Banner>
        )}
      </div>
    );
  }
  if (p.t === 'cert') {
    const match = state.certificate?.id === p.id;
    return (
      <div className="stack">
        {head}
        <div className="kv">
          <div>{tr('সনদধারী', 'Holder')}</div>
          <div>{String(p.name)}</div>
          <div>{tr('স্তর', 'Level')}</div>
          <div>{String(p.lvl)}</div>
          <div>{tr('ইস্যু', 'Issued')}</div>
          <div>{date(String(p.at))}</div>
        </div>
        <Banner tone={match ? 'success' : 'warn'}>{match ? tr('সনদ রেকর্ডে আছে', 'The certificate is on record') : tr('এই ডিভাইসের রেকর্ডে সনদটি নেই', 'This certificate is not in this device’s records')}</Banner>
      </div>
    );
  }
  return (
    <div className="stack">
      {head}
      <p className="small">
        {tr('যৌথ দুর্ঘটনা রিপোর্টের সেশন', 'Joint accident report session')} · {String(p.from)} · {p.exp ? `${tr('মেয়াদ', 'expires')} ${time(new Date(Number(p.exp)).toISOString())}` : ''}
      </p>
    </div>
  );
}

function challanId(cases: TrafficCase[], now = new Date()) {
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const max = cases.filter((c) => c.id.startsWith('DMP-POS-')).reduce((m, c) => Math.max(m, Number(c.id.slice(-4)) || 0), 0);
  return `DMP-POS-${now.getFullYear()}-${mmdd}-${String(max + 1).padStart(4, '0')}`;
}

/** Roadside e-challan from the officer app (PR-005). Lookup is limited to the demo registry. */
function IssueChallan() {
  const { state, update, notify } = useApp();
  const { tr, tx, taka } = useI18n();
  const me = useOfficer();
  const [params] = useSearchParams();
  const reportId = params.get('report');
  const report = state.reports.find((r) => r.id === reportId);
  const nearestArea = useMemo(() => [...AREAS].sort((a, b) => distanceKm(me, a) - distanceKm(me, b))[0], [me]);
  const [vehicleId, setVehicleId] = useState(params.get('vehicle') ?? state.vehicles[0]?.id ?? '');
  const [violation, setViolation] = useState<ViolationCode>(report?.category === 'wrong_way' ? 'wrong_way' : 'illegal_parking');
  const [areaId, setAreaId] = useState(nearestArea.id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [issued, setIssued] = useState<string>();
  const vehicle = state.vehicles.find((v) => v.id === vehicleId);
  const area = AREAS.find((a) => a.id === areaId)!;

  const issue = async () => {
    if (!vehicle) return;
    setBusy(true);
    setFailed(false);
    const id = challanId(state.cases);
    const now = new Date();
    const c: TrafficCase = {
      id,
      vehicleId: vehicle.id,
      violation,
      location: area.name,
      occurredAt: now.toISOString(),
      dueDate: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
      amount: SAMPLE_FINES[violation],
      source: 'sergeant',
      camera: `POS-${me.id}`,
      officerVerified: true,
      status: 'unpaid',
      issuedBy: me.id,
    };
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 500 });
      update((d) => {
        d.cases.unshift(c);
        if (d.profile.vehicleIds.includes(c.vehicleId)) {
          notify(d, { category: 'cases', title: { bn: 'নতুন ই-চালান', en: 'New e-challan' }, body: { bn: `${vehicle.regNo.bn} · ${VIOLATIONS[violation].name.bn}, ${area.name.bn}`, en: `${vehicle.regNo.en} · ${VIOLATIONS[violation].name.en}, ${area.name.en}` }, link: `/cases/${id}` });
        }
      });
      setIssued(id);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (issued) {
    const c = state.cases.find((x) => x.id === issued);
    return (
      <>
        <PageHeader title={tr('ই-চালান', 'e-Challan')} back="/officer" />
        <div className="content stack print-area" style={{ maxWidth: 560 }}>
          <div className="verdict ok" role="status">
            <CheckCircle2 size={28} color="var(--success)" aria-hidden="true" />
            <div className="stack" style={{ gap: 4 }}>
              <strong>{tr('ই-চালান ইস্যু হয়েছে', 'e-Challan issued')}</strong>
              <span className="small">{tr('গাড়ির মালিক নাগরিক অ্যাপের "মামলা ও জরিমানা"-তে এটি দেখবেন এবং অ্যাপে নোটিশ পাবেন।', 'The vehicle owner sees it under "Cases & fines" in the citizen app and gets an in-app notice.')}</span>
            </div>
          </div>
          {c && (
            <div className="kv">
              <div>{tr('মামলা নম্বর', 'Case number')}</div>
              <div>{c.id}</div>
              <div>{tr('গাড়ি', 'Vehicle')}</div>
              <div>{tx(vehicle?.regNo)}</div>
              <div>{tr('লঙ্ঘন', 'Violation')}</div>
              <div>{tx(VIOLATIONS[c.violation].name)}</div>
              <div>{tr('জরিমানা', 'Fine')}</div>
              <div>
                {taka(c.amount)} <span className="tiny muted">({tr('নমুনা অঙ্ক', 'sample amount')})</span>
              </div>
            </div>
          )}
          <div className="btn-row no-print">
            <button type="button" className="btn outline" onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" /> {tr('প্রিন্ট', 'Print')}
            </button>
            {report ? (
              <Link to={`/officer/tasks/${report.id}`} className="btn primary">
                {tr('কাজে ফিরুন', 'Back to the task')}
              </Link>
            ) : (
              <button type="button" className="btn primary" onClick={() => setIssued(undefined)}>
                <FileText size={18} aria-hidden="true" /> {tr('আরেকটি ইস্যু করুন', 'Issue another')}
              </button>
            )}
          </div>
          <Link to="/cases" className="small no-print">
            {tr('নাগরিক অ্যাপে মামলাটি দেখুন', 'See the case in the citizen app')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={tr('ই-চালান ইস্যু', 'Issue an e-challan')} back="/officer" />
      <div className="content stack" style={{ maxWidth: 640 }}>
        {report && (
          <Banner tone="brand">
            {tr('রিপোর্ট থেকে', 'From report')} {report.ref} · {tx(report.locationLabel)}
          </Banner>
        )}
        <Field label={tr('গাড়ি (নমুনা BRTA রেজিস্ট্রি)', 'Vehicle (sample BRTA registry)')} hint={tr('ডেমো রেজিস্ট্রিতে শুধু নমুনা নাগরিকের গাড়িগুলো আছে', 'The demo registry only holds the sample citizen’s vehicles')} htmlFor="ch-veh">
          <select id="ch-veh" className="select" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {state.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {tx(v.regNo)} · {tx(v.kind)}
              </option>
            ))}
          </select>
        </Field>
        {vehicle && (
          <div className="card flat row small">
            <Gauge size={18} aria-hidden="true" />
            <span className="grow">
              {tr('DRC', 'DRC')}: {vehicle.drcValid ? tr('বৈধ', 'valid') : tr('অবৈধ', 'invalid')} · {tr('অপরিশোধিত মামলা', 'Unpaid cases')}: {state.cases.filter((c) => c.vehicleId === vehicle.id && c.officerVerified && c.status === 'unpaid').length}
            </span>
          </div>
        )}
        <Field label={tr('লঙ্ঘন', 'Violation')} htmlFor="ch-vio">
          <select id="ch-vio" className="select" value={violation} onChange={(e) => setViolation(e.target.value as ViolationCode)}>
            {(Object.keys(VIOLATIONS) as ViolationCode[]).map((k) => (
              <option key={k} value={k}>
                {tx(VIOLATIONS[k].name)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={tr('স্থান', 'Place')} htmlFor="ch-area">
          <select id="ch-area" className="select" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {tx(a.name)}
              </option>
            ))}
          </select>
        </Field>
        <div className="card tinted row between">
          <span>{tr('জরিমানা', 'Fine')}</span>
          <span className="strong">
            {taka(SAMPLE_FINES[violation])} <span className="tiny muted">({tr('নমুনা অঙ্ক, আইনের তফসিল নয়', 'sample amount, not the legal schedule')})</span>
          </span>
        </div>
        {failed && <ErrorBanner onRetry={() => void issue()} />}
        <SubmitButton busy={busy} disabled={!vehicle} onClick={() => void issue()}>
          <ReceiptText size={18} aria-hidden="true" /> {tr('ই-চালান ইস্যু করুন', 'Issue e-challan')}
        </SubmitButton>
      </div>
    </>
  );
}

function OfficerMap() {
  const { state } = useApp();
  const { tr, tx } = useI18n();
  const me = useOfficer();
  const nav = useNavigate();
  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = [{ id: 'me', lat: me.lat, lng: me.lng, kind: 'officer', color: '#027068', title: tr('আপনি', 'You') }];
    state.reports
      .filter((r) => FIELD_KINDS.includes(r.kind) && !r.duplicateOf && OPEN.includes(r.status))
      .forEach((r) => m.push({ id: r.id, lat: r.lat, lng: r.lng, kind: 'report', color: r.assignedOfficerId === me.id ? '#1d4ed8' : '#c62828', title: `${tx(categoryLabel(r.kind, r.category))} · ${tx(r.locationLabel)}`, onClick: () => nav(`/officer/tasks/${r.id}`) }));
    state.sosEvents.filter((s) => s.status === 'active').forEach((s) => m.push({ id: s.id, lat: s.lat, lng: s.lng, kind: 'sos', color: '#d0102b', title: 'SOS', onClick: () => nav(`/officer/sos/${s.id}`) }));
    state.alerts.filter((a) => a.status === 'active').forEach((a) => m.push({ id: a.id, lat: a.lat, lng: a.lng, kind: 'alert', color: '#b45309', title: `${tx(ALERT_TYPES[a.type].label)} · ${tx(a.title)}` }));
    return m;
  }, [state.reports, state.sosEvents, state.alerts, me, tr, tx, nav]);
  return (
    <>
      <PageHeader title={tr('কাজের মানচিত্র', 'Task map')} back="/officer" />
      <div className="content stack">
        <div className="row wrap small" style={{ gap: 14 }}>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#c62828' }} /> {tr('নতুন রিপোর্ট', 'New report')}
          </span>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#1d4ed8' }} /> {tr('আমার কাজ', 'My task')}
          </span>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#b45309' }} /> {tr('সতর্কতা', 'Alert')}
          </span>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#d0102b' }} /> SOS
          </span>
        </div>
        <MapView center={me} zoom={13} markers={markers} label={tr('কাজের মানচিত্র', 'Task map')} height="calc(100vh - 240px)" />
      </div>
    </>
  );
}


