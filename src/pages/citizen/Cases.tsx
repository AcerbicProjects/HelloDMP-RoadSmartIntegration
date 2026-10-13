import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Camera, CarFront, CheckCircle2, ChevronRight, Download, FileText, House, Info, Lock, Send, ShieldCheck, Upload, UserRound, Video } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, ErrorBanner, Field, PageHeader, Sheet, SubmitButton, Tabs } from '../../components/ui';
import { RequireTier } from '../../components/Gate';
import { EvidenceViewer } from '../../components/Evidence';
import { PhotoPicker } from '../../components/PhotoPicker';
import { QrCode } from '../../components/QrCode';
import { Icon } from '../../components/Icon';
import { EARLY_PAY, OBJECTION_REASONS, PAYMENT_METHODS, VIOLATIONS } from '../../data/catalog';
import type { EvidencePhoto, TrafficCase, ViolationCode } from '../../data/types';
import { nextNumber, simulate, SimulatedNetworkError } from '../../services/api';
import { signToken } from '../../services/crypto';
import { daysUntil } from '../../lib/format';

/** Discount applies when paying within EARLY_PAY.days of the notice (proposal p.24/p.28; demo values). */
/** Camera timestamps are either "HH:MM:SS" or full ISO strings. */
function clockText(t: string) {
  return /^\d{2}:\d{2}:\d{2}$/.test(t) ? t : t.slice(11, 19);
}
function clockSeconds(t: string) {
  const [h, m, sec] = clockText(t).split(':').map(Number);
  return h * 3600 + m * 60 + sec;
}

export function earlyPay(c: TrafficCase, now = Date.now()) {
  const deadline = new Date(c.occurredAt).getTime() + EARLY_PAY.days * 86_400_000;
  const eligible = now <= deadline;
  const discount = eligible ? Math.round((c.amount * EARLY_PAY.percent) / 100) : 0;
  return { eligible, deadline: new Date(deadline).toISOString(), discount, total: c.amount - discount };
}

function caseTag(c: TrafficCase, tr: (b: string, e: string) => string, date: (s: string) => string) {
  if (c.status === 'unpaid') return { tone: 'danger', text: tr(`অপরিশোধিত · শেষ তারিখ ${date(c.dueDate)}`, `Unpaid · due ${date(c.dueDate)}`) };
  if (c.status === 'objection') return { tone: 'warn', text: tr('আপত্তি যাচাই চলছে', 'Objection under review') };
  if (c.status === 'paid') return { tone: 'success', text: tr('পরিশোধিত', 'Paid') };
  return { tone: '', text: tr('বাতিল (আপত্তি গৃহীত)', 'Cancelled (objection accepted)') };
}

function useMyCases() {
  const { state } = useApp();
  return state.cases.filter((c) => c.officerVerified && state.profile.vehicleIds.includes(c.vehicleId));
}

export default function Cases() {
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('মামলা ও জরিমানা', 'Cases & fines')} />
      <RequireTier tier={2} what={tr('আপনার গাড়ির মামলা', 'your vehicle’s cases')}>
        <CaseList />
      </RequireTier>
    </>
  );
}

function CaseList() {
  const { state } = useApp();
  const { tr, tx, n, date, taka } = useI18n();
  const all = useMyCases();
  const [vehicle, setVehicle] = useState<string>('all');
  const [tab, setTab] = useState<'unpaid' | 'objection' | 'closed'>('unpaid');
  const mine = all.filter((c) => vehicle === 'all' || c.vehicleId === vehicle);
  const groups = {
    unpaid: mine.filter((c) => c.status === 'unpaid'),
    objection: mine.filter((c) => c.status === 'objection'),
    closed: mine.filter((c) => c.status === 'paid' || c.status === 'cancelled'),
  };
  const due = groups.unpaid.reduce((s, c) => s + c.amount, 0);
  return (
    <div className="content stack">
      <div className="chips" role="group" aria-label={tr('গাড়ি', 'Vehicle')}>
        <button type="button" className="chip" aria-pressed={vehicle === 'all'} onClick={() => setVehicle('all')}>
          {tr('সব গাড়ি', 'All vehicles')}
        </button>
        {state.vehicles
          .filter((v) => state.profile.vehicleIds.includes(v.id))
          .map((v) => (
            <button key={v.id} type="button" className="chip" aria-pressed={vehicle === v.id} onClick={() => setVehicle(v.id)}>
              <CarFront size={16} aria-hidden="true" /> {tx(v.regNo)}
            </button>
          ))}
      </div>
      {groups.unpaid.length > 0 && (
        <div className="card danger row">
          <span className="grow">
            <span className="small">{tr('মোট বকেয়া', 'Total due')}</span>
            <span className="strong" style={{ display: 'block', fontSize: '1.4rem', color: 'var(--danger)' }}>
              {taka(due)}
            </span>
          </span>
          <span className="small">{tr(`${n(groups.unpaid.length)}টি মামলা`, `${groups.unpaid.length} cases`)}</span>
        </div>
      )}
      <Tabs
        label={tr('মামলার অবস্থা', 'Case status')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'unpaid', label: tr(`অপরিশোধিত (${n(groups.unpaid.length)})`, `Unpaid (${groups.unpaid.length})`), danger: true },
          { id: 'objection', label: tr(`আপত্তি (${n(groups.objection.length)})`, `Objection (${groups.objection.length})`) },
          { id: 'closed', label: tr(`পরিশোধিত (${n(groups.closed.length)})`, `Closed (${groups.closed.length})`) },
        ]}
      />
      {groups[tab].length === 0 ? (
        <Empty icon={<CheckCircle2 size={24} />} title={tab === 'unpaid' ? tr('কোনো বকেয়া মামলা নেই', 'No unpaid cases') : tr('এখানে কিছু নেই', 'Nothing here')} />
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {groups[tab].map((c) => {
            const tag = caseTag(c, tr, date);
            return (
              <Link key={c.id} to={`/cases/${c.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="row between">
                  <span className={`badge ${tag.tone}`}>{tag.text}</span>
                  <ChevronRight size={18} className="muted" aria-hidden="true" />
                </div>
                <div className="strong" style={{ marginTop: 6 }}>
                  {tx(VIOLATIONS[c.violation].name)}
                </div>
                <div className="small muted">
                  {tx(c.location)} · {date(c.occurredAt)}
                </div>
                <div className="small row" style={{ gap: 6, marginTop: 4, color: 'var(--brand-700)' }}>
                  <Camera size={14} aria-hidden="true" />
                  {c.source === 'ai_camera' ? (c.speed ? tr('দুই AI ক্যামেরা · অফিসার যাচাইকৃত', 'Two AI cameras · officer verified') : tr('AI ক্যামেরা · ভিডিও প্রমাণ · অফিসার যাচাইকৃত', 'AI camera · video evidence · officer verified')) : tr('ট্রাফিক সার্জেন্ট · POS', 'Traffic sergeant · POS')}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Link to="/violations" className="list-row" style={{ borderRadius: 16, border: '1px solid var(--line)' }}>
        <span className="lr-icon">
          <Info size={20} aria-hidden="true" />
        </span>
        <span className="grow">
          <span className="lr-title" style={{ display: 'block' }}>
            {tr('কোন লঙ্ঘনে কী প্রমাণ থাকে', 'What evidence each violation uses')}
          </span>
          <span className="lr-sub">{tr('AI ক্যামেরার ৭ ধরনের লঙ্ঘন', 'The 7 violations AI cameras detect')}</span>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
      <Banner tone="brand" icon={<ShieldCheck size={18} aria-hidden="true" />}>
        {tr('নোটিশ শুধু অ্যাপের ভেতরে আসে। DMP-এর SMS-এ কখনো লিংক থাকে না। সন্দেহ হলে ', 'Notices arrive only inside the app. DMP SMS never contain links. If in doubt, ')}
        <Link to="/sms-check">{tr('SMS যাচাই করুন', 'check the SMS')}</Link>.
      </Banner>
    </div>
  );
}

export function CaseDetail() {
  const { id } = useParams();
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('মামলার বিস্তারিত', 'Case details')} />
      <RequireTier tier={2} what={tr('মামলা', 'this case')}>
        <CaseBody id={id ?? ''} />
      </RequireTier>
    </>
  );
}

function CaseBody({ id }: { id: string }) {
  const { state } = useApp();
  const { tr, tx, date, dateTime, taka, n, num } = useI18n();
  const c = useMyCases().find((x) => x.id === id);
  if (!c) return <div className="content"><Empty icon={<FileText size={24} />} title={tr('মামলা পাওয়া যায়নি', 'Case not found')} action={<Link to="/cases" className="btn outline small">{tr('সব মামলা', 'All cases')}</Link>} /></div>;
  const v = state.vehicles.find((x) => x.id === c.vehicleId);
  const ep = earlyPay(c);
  const speed = c.speed;
  const minutes = speed ? (clockSeconds(speed.timeB) - clockSeconds(speed.timeA)) / 60 : 0;
  const avg = speed ? Math.round((speed.distanceKm / minutes) * 60) : 0;
  const owner = v?.ownership === 'owner';
  return (
    <div className="content cols">
      <div className="stack">
        {speed ? (
          <div className="stack">
            <div className="row wrap" style={{ gap: 6 }}>
              <span className="badge warn">{tr('গড় গতি · দুই ক্যামেরা', 'Average speed · two cameras')}</span>
              <span className="badge success">
                <BadgeCheck size={12} aria-hidden="true" /> {tr('অফিসার যাচাইকৃত', 'Officer verified')}
              </span>
            </div>
            <div className="grid-2">
              {[
                { l: tr('ক্যামেরা A', 'Camera A'), p: speed.camA, t: speed.timeA },
                { l: tr('ক্যামেরা B', 'Camera B'), p: speed.camB, t: speed.timeB },
              ].map((x) => (
                <div key={x.l} className="card" style={{ background: '#1f2a30', color: '#fff', borderColor: '#1f2a30' }}>
                  <div className="tiny" style={{ color: 'var(--gold)' }}>
                    {x.l}
                  </div>
                  <div className="strong">{tx(x.p)}</div>
                  <div className="small" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {clockText(x.t)}
                  </div>
                </div>
              ))}
            </div>
            <div className="kv">
              <div>{tr('দূরত্ব', 'Distance')}</div>
              <div>{tr(`${n(speed.distanceKm)} কিমি`, `${speed.distanceKm} km`)}</div>
              <div>{tr('সময়', 'Time')}</div>
              <div>{tr(`${n(Math.floor(minutes))} মিনিট ${n(Math.round((minutes % 1) * 60))} সেকেন্ড`, `${Math.floor(minutes)} min ${Math.round((minutes % 1) * 60)} s`)}</div>
              <div>{tr('গড় গতি', 'Average speed')}</div>
              <div className="danger-text">{tr(`${n(avg)} কিমি/ঘণ্টা`, `${avg} km/h`)}</div>
              <div>{tr('এই সড়কের গতিসীমা', 'Speed limit on this road')}</div>
              <div>{tr(`${n(speed.limitKmh)} কিমি/ঘণ্টা`, `${speed.limitKmh} km/h`)}</div>
            </div>
            <Banner tone="warn">{tr('গড় গতি = দুই ক্যামেরার মাঝের দূরত্ব ÷ পার হতে লাগা সময়। দুই ক্যামেরার ছবিতে একই নম্বর প্লেট মিলিয়ে দেখা হয়।', 'Average speed = distance between the cameras ÷ time taken. The same plate is matched in both cameras’ images.')}</Banner>
          </div>
        ) : (
          <>
            <EvidenceViewer c={c} />
            <div className="row wrap" style={{ gap: 6 }}>
              {c.source === 'ai_camera' && (
                <span className="badge brand">
                  <Video size={12} aria-hidden="true" /> {tr('ভিডিও প্রমাণ · ৬ সেকেন্ড', 'Video evidence · 6 s')}
                </span>
              )}
              <span className="badge success">
                <BadgeCheck size={12} aria-hidden="true" /> {tr('অফিসার যাচাইকৃত', 'Officer verified')}
              </span>
            </div>
          </>
        )}
        <div className="kv">
          <div>{tr('মামলা নং', 'Case no.')}</div>
          <div>{c.id}</div>
          <div>{tr('লঙ্ঘন', 'Violation')}</div>
          <div>{tx(VIOLATIONS[c.violation].name)}</div>
          <div>{tr('আইন', 'Law')}</div>
          <div>{tr('সড়ক পরিবহন আইন ২০১৮ (ধারা নিশ্চিত করা বাকি)', 'Road Transport Act 2018 (section to be confirmed)')}</div>
          <div>{tr('গাড়ি', 'Vehicle')}</div>
          <div>{tx(v?.regNo)}</div>
          <div>{tr('স্থান', 'Place')}</div>
          <div>{tx(c.location)}</div>
          <div>{tr('সময়', 'Time')}</div>
          <div>{dateTime(c.occurredAt)}</div>
          <div>{tr('উৎস', 'Source')}</div>
          <div>{c.camera}</div>
        </div>
      </div>
      <div className="stack">
        {c.status !== 'cancelled' && (
          <div className="card danger">
            <div className="row between">
              <div>
                <div className="small">{tr('জরিমানা', 'Fine')}</div>
                <div className="strong" style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
                  {taka(c.amount)}
                </div>
                <div className="tiny muted">{tr('নমুনা অঙ্ক', 'Sample amount')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="small">{tr('শেষ তারিখ', 'Due date')}</div>
                <div className="strong">{date(c.dueDate)}</div>
                {c.status === 'unpaid' && <div className="tiny">{daysUntil(c.dueDate) >= 0 ? tr(`${n(daysUntil(c.dueDate))} দিন বাকি`, `${daysUntil(c.dueDate)} days left`) : tr('মেয়াদ পেরিয়েছে', 'Overdue')}</div>}
              </div>
            </div>
          </div>
        )}
        {c.status === 'unpaid' && (
          <Banner tone={ep.eligible ? 'warn' : 'info'}>
            {ep.eligible
              ? tr(`আগাম পরিশোধে ছাড় (প্রস্তাবিত): ${date(ep.deadline)}-এর মধ্যে পরিশোধ করলে ${n(EARLY_PAY.percent)}% ছাড়, অর্থাৎ ${taka(ep.total)}।`, `Early payment discount (proposed): pay by ${date(ep.deadline)} for ${EARLY_PAY.percent}% off, i.e. ${taka(ep.total)}.`)
              : tr(`আগাম পরিশোধের ছাড়ের সময় (${n(EARLY_PAY.days)} দিন) পেরিয়ে গেছে।`, `The early payment window (${EARLY_PAY.days} days) has passed.`)}
          </Banner>
        )}
        {c.status === 'objection' && c.objection && (
          <div className="card warn stack" style={{ gap: 6 }}>
            <strong>{tr('আপত্তি যাচাই চলছে', 'Objection under review')}</strong>
            <span className="small">
              {tx(OBJECTION_REASONS.find((o) => o.id === c.objection?.reason)?.label)} · {date(c.objection.submittedAt)}
            </span>
            <span className="small">{tr('একজন অফিসার ভিডিও প্রমাণ আবার দেখবেন। আপত্তি চলাকালীন পরিশোধের সময়সীমা স্থগিত থাকবে (প্রস্তাবিত)।', 'An officer will review the video again. The payment deadline is paused during the objection (proposed).')}</span>
          </div>
        )}
        {c.status === 'cancelled' && c.objection?.decisionNote && <Banner tone="success">{tx(c.objection.decisionNote)}</Banner>}
        {c.nomination && (
          <div className="card info small">
            <strong>{tr('প্রকৃত চালক মনোনীত', 'Actual driver nominated')}:</strong> {c.nomination.name} · {c.nomination.status === 'pending' ? tr('চালকের নিশ্চিতকরণের অপেক্ষা', 'waiting for the driver to confirm') : tr('নিশ্চিত', 'confirmed')}
          </div>
        )}
        {c.status === 'paid' && c.payment && (
          <Link to={`/receipt/${c.id}`} className="btn primary">
            <FileText size={18} aria-hidden="true" /> {tr('রসিদ দেখুন', 'View receipt')} · {c.payment.receiptNo}
          </Link>
        )}
        {c.status === 'unpaid' && (
          <>
            {c.speed && owner && !c.nomination && (
              <Link to={`/cases/${c.id}/nominate`} className="list-row" style={{ borderRadius: 16, border: '1px solid var(--line)' }}>
                <span className="lr-icon">
                  <UserRound size={20} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tr('আমি চালাইনি?', 'I wasn’t driving?')}
                  </span>
                  <span className="lr-sub">{tr('প্রকৃত চালককে মনোনয়ন দিন', 'Nominate the actual driver')}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            )}
            {!c.speed && owner && !c.nomination && (
              <Link to={`/cases/${c.id}/nominate`} className="small">
                {tr('গাড়ি অন্য কেউ চালাচ্ছিলেন? প্রকৃত চালক মনোনয়ন দিন', 'Someone else was driving? Nominate the driver')}
              </Link>
            )}
            <div className="sticky-actions">
              <div className="btn-row">
                <Link to={`/cases/${c.id}/object`} className="btn outline">
                  {tr('আপত্তি জানান', 'Object')}
                </Link>
                <Link to={`/cases/${c.id}/pay`} className="btn danger">
                  {tr('পরিশোধ করুন', 'Pay')} · {taka(ep.total)}
                </Link>
              </div>
            </div>
          </>
        )}
        <p className="tiny muted">{tr(`মামলার অঙ্ক ও ধারা নমুনা; ${num(7)} ধরনের AI লঙ্ঘন প্রস্তাবনা অনুযায়ী।`, 'Fine amounts and sections are samples; the 7 AI violation types follow the proposal.')}</p>
      </div>
    </div>
  );
}

export function PayPage() {
  const { id } = useParams();
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('জরিমানা পরিশোধ', 'Pay fine')} />
      <RequireTier tier={2} what={tr('পরিশোধ', 'payment')}>
        <PayBody id={id ?? ''} />
      </RequireTier>
    </>
  );
}

function PayBody({ id }: { id: string }) {
  const { state, update, notify } = useApp();
  const { tr, tx, taka } = useI18n();
  const nav = useNavigate();
  const c = useMyCases().find((x) => x.id === id);
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!c) return <div className="content"><Empty icon={<FileText size={24} />} title={tr('মামলা পাওয়া যায়নি', 'Case not found')} /></div>;
  if (c.status !== 'unpaid')
    return (
      <div className="content stack">
        <Banner tone="success">{tr('এই মামলা আর পরিশোধের অপেক্ষায় নেই।', 'This case is no longer awaiting payment.')}</Banner>
        <Link to={`/cases/${c.id}`} className="btn outline">
          {tr('মামলায় ফিরুন', 'Back to case')}
        </Link>
      </div>
    );
  const v = state.vehicles.find((x) => x.id === c.vehicleId);
  const ep = earlyPay(c);
  const m = PAYMENT_METHODS.find((x) => x.id === method)!;

  const pay = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 1100 });
      const year = new Date().getFullYear();
      const receiptNo = nextNumber(
        state.cases.filter((x) => x.payment).map((x) => x.payment!.receiptNo),
        `RS-${year}-`,
      );
      update((d) => {
        const x = d.cases.find((y) => y.id === c.id);
        if (!x) return;
        x.status = 'paid';
        x.payment = { method, txnId: `DEMO-${method.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, paidAt: new Date().toISOString(), amountPaid: ep.total, discount: ep.discount, receiptNo };
        notify(d, { category: 'cases', title: { bn: 'পরিশোধ সম্পন্ন · রসিদ', en: 'Payment complete · receipt' }, body: VIOLATIONS[x.violation].name, link: `/receipt/${x.id}` });
      });
      nav(`/receipt/${c.id}`, { replace: true });
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  return (
    <div className="content stack" style={{ maxWidth: 640 }}>
      <div className="kv">
        <div>{tr('মামলা', 'Case')}</div>
        <div>
          {tx(VIOLATIONS[c.violation].name)} · {tx(c.location)}
        </div>
        <div>{tr('গাড়ি', 'Vehicle')}</div>
        <div>{tx(v?.regNo)}</div>
        <div>{tr('জরিমানা', 'Fine')}</div>
        <div>{taka(c.amount)}</div>
        {ep.discount > 0 && (
          <>
            <div>{tr('আগাম পরিশোধে ছাড়', 'Early payment discount')}</div>
            <div className="success-text">−{taka(ep.discount)}</div>
          </>
        )}
        <div>{tr('মোট', 'Total')}</div>
        <div style={{ fontSize: '1.15rem' }}>{taka(ep.total)}</div>
      </div>
      <Banner tone="brand" icon={<Lock size={18} aria-hidden="true" />}>
        {tr('অফিসিয়াল checkout · শুধু DMP নিবন্ধিত merchant', 'Official checkout · registered DMP merchant only')}
      </Banner>
      <div>
        <span className="tag-heading">{tr('পরিশোধের মাধ্যম', 'Payment method')}</span>
        <div className="tag-rule" />
      </div>
      <div className="stack" style={{ gap: 8 }} role="radiogroup" aria-label={tr('পরিশোধের মাধ্যম', 'Payment method')}>
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            type="button"
            role="radio"
            aria-checked={method === pm.id}
            className="list-row"
            style={{ borderRadius: 14, border: `2px solid ${method === pm.id ? 'var(--brand-700)' : 'var(--line)'}`, background: method === pm.id ? 'var(--brand-50)' : '#fff' }}
            onClick={() => setMethod(pm.id)}
          >
            <span className="lr-icon" style={{ background: pm.color, color: '#fff', fontWeight: 800 }}>
              {tx(pm.name).slice(0, 1)}
            </span>
            <span className="grow">
              <span className="lr-title" style={{ display: 'block' }}>
                {tx(pm.name)}
              </span>
              <span className="lr-sub">{tx(pm.note)}</span>
            </span>
            {method === pm.id && <CheckCircle2 size={22} color="var(--brand-700)" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="small muted row" style={{ alignItems: 'flex-start' }}>
        <Info size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
        {tr('PIN শুধু পেমেন্ট সেবার নিজস্ব পাতায় দিন। DMP কখনো আপনার PIN জানতে চায় না।', 'Enter your PIN only on the payment provider’s own page. DMP never asks for your PIN.')}
      </p>
      {failed && <ErrorBanner onRetry={pay} text={tr('পরিশোধ ব্যর্থ (ডেমো নেটওয়ার্ক ব্যর্থতা)। কোনো টাকা কাটা হয়নি।', 'Payment failed (demo network failure). No money was taken.')} />}
      <div className="sticky-actions">
        <button type="button" className="btn danger block" onClick={() => setConfirm(true)}>
          <Lock size={18} aria-hidden="true" /> {tr(`${taka(ep.total)} পরিশোধ করুন`, `Pay ${taka(ep.total)}`)}
        </button>
      </div>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title={tr('ডেমো পেমেন্ট গেটওয়ে', 'Demo payment gateway')}>
        <div className="stack">
          <div className="card" style={{ borderColor: m.color, borderWidth: 2, textAlign: 'center' }}>
            <div className="strong" style={{ color: m.color, fontSize: '1.2rem' }}>
              {tx(m.name)}
            </div>
            <div className="strong" style={{ fontSize: '1.6rem' }}>
              {taka(ep.total)}
            </div>
            <div className="small muted">{tr('প্রাপক: DMP (নমুনা merchant)', 'Payee: DMP (sample merchant)')}</div>
          </div>
          <Banner tone="warn">{tr('এটি একটি অনুকরণ। কোনো আসল পেমেন্ট সেবায় যোগাযোগ হবে না এবং কোনো টাকা কাটা হবে না; শুধু এই প্রোটোটাইপে মামলাটি "পরিশোধিত" দেখাবে।', 'This is a simulation. No real payment provider is contacted and no money moves; the case is only marked “paid” inside this prototype.')}</Banner>
          <SubmitButton busy={busy} className="danger block" onClick={pay}>
            {tr('অনুমোদন করুন (ডেমো)', 'Approve (demo)')}
          </SubmitButton>
        </div>
      </Sheet>
    </div>
  );
}

export function ReceiptPage() {
  const { id } = useParams();
  const { state } = useApp();
  const { tr, tx, taka, dateTime } = useI18n();
  const c = state.cases.find((x) => x.id === id);
  const [token, setToken] = useState('');
  useEffect(() => {
    if (c?.payment) void signToken({ t: 'receipt', r: c.payment.receiptNo, c: c.id, amt: c.payment.amountPaid, at: c.payment.paidAt }).then(setToken);
  }, [c]);
  if (!c?.payment)
    return (
      <>
        <PageHeader title={tr('পরিশোধের রসিদ', 'Payment receipt')} />
        <div className="content">
          <Empty icon={<FileText size={24} />} title={tr('রসিদ পাওয়া যায়নি', 'Receipt not found')} />
        </div>
      </>
    );
  const p = c.payment;
  const m = PAYMENT_METHODS.find((x) => x.id === p.method);
  return (
    <>
      <PageHeader title={tr('পরিশোধের রসিদ', 'Payment receipt')} />
      <div className="content stack print-area" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: 'center' }} className="stack">
          <CheckCircle2 size={56} color="var(--brand-700)" style={{ margin: '0 auto' }} aria-hidden="true" />
          <h2 style={{ color: 'var(--brand-700)' }}>{tr('পরিশোধ সম্পন্ন', 'Payment complete')}</h2>
          <p className="small muted">{tr('মামলাটি নিষ্পত্তি হয়েছে · রসিদ সংরক্ষিত', 'The case is settled · receipt saved')}</p>
        </div>
        <div className="card stack" style={{ textAlign: 'center' }}>
          <div style={{ width: 200, margin: '0 auto' }}>{token ? <QrCode value={token} label={tr('রসিদের QR', 'Receipt QR')} /> : <div className="skeleton" style={{ height: 200 }} />}</div>
          <p className="small">{tr('রাস্তায় যেকোনো ট্রাফিক অফিসার এই QR স্ক্যান করে যাচাই করতে পারবেন', 'Any traffic officer on the road can scan this QR to verify it')}</p>
          <div className="kv" style={{ textAlign: 'left' }}>
            <div>{tr('রসিদ নং', 'Receipt no.')}</div>
            <div>{p.receiptNo}</div>
            <div>{tr('মামলা', 'Case')}</div>
            <div>{c.id}</div>
            <div>{tr('মাধ্যম', 'Method')}</div>
            <div>{tx(m?.name)}</div>
            <div>{tr('লেনদেন নং', 'Transaction')}</div>
            <div>{p.txnId}</div>
            <div>{tr('পরিমাণ', 'Amount')}</div>
            <div>{taka(p.amountPaid)}</div>
            {p.discount > 0 && (
              <>
                <div>{tr('ছাড়', 'Discount')}</div>
                <div>{taka(p.discount)}</div>
              </>
            )}
            <div>{tr('সময়', 'Time')}</div>
            <div>{dateTime(p.paidAt)}</div>
          </div>
          <p className="tiny muted">{tr('প্রোটোটাইপের রসিদ; কোনো আসল লেনদেন হয়নি।', 'Prototype receipt; no real transaction took place.')}</p>
        </div>
        <div className="btn-row no-print">
          <button type="button" className="btn outline" onClick={() => window.print()}>
            <Download size={18} aria-hidden="true" /> {tr('রসিদ ডাউনলোড (PDF)', 'Download receipt (PDF)')}
          </button>
          <Link to="/" className="btn primary">
            <House size={18} aria-hidden="true" /> {tr('হোমে ফিরুন', 'Back home')}
          </Link>
        </div>
        <p className="tiny muted no-print">{tr('ডাউনলোড বোতাম ব্রাউজারের প্রিন্ট খোলে; সেখানে "PDF হিসেবে সংরক্ষণ" বেছে নিন।', 'The download button opens your browser’s print dialog; choose “Save as PDF”.')}</p>
      </div>
    </>
  );
}

export function ObjectionPage() {
  const { id } = useParams();
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('আপত্তি জানান', 'Object to a case')} />
      <RequireTier tier={2} what={tr('আপত্তি', 'objections')}>
        <ObjectionBody id={id ?? ''} />
      </RequireTier>
    </>
  );
}

function ObjectionBody({ id }: { id: string }) {
  const { state, update, notify, toast } = useApp();
  const { tr, tx } = useI18n();
  const nav = useNavigate();
  const c = useMyCases().find((x) => x.id === id);
  const [reason, setReason] = useState(OBJECTION_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!c) return <div className="content"><Empty icon={<FileText size={24} />} title={tr('মামলা পাওয়া যায়নি', 'Case not found')} /></div>;
  if (c.status !== 'unpaid') return <div className="content"><Banner>{tr('এই মামলায় আর আপত্তি জানানো যায় না।', 'This case can no longer be objected to.')}</Banner></div>;
  const v = state.vehicles.find((x) => x.id === c.vehicleId);
  const submit = async () => {
    if (details.trim().length < 15) return setError(tr('অন্তত ১৫ অক্ষরে কারণ ব্যাখ্যা করুন', 'Explain the reason in at least 15 characters'));
    setError('');
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure });
      update((d) => {
        const x = d.cases.find((y) => y.id === c.id);
        if (!x) return;
        x.status = 'objection';
        x.objection = { reason, details: details.trim(), attachments: photos.map((p) => p.name), submittedAt: new Date().toISOString() };
        notify(d, { category: 'cases', title: { bn: 'আপত্তি জমা হয়েছে', en: 'Objection submitted' }, body: VIOLATIONS[x.violation].name, link: `/cases/${x.id}` });
      });
      toast(tr('আপত্তি জমা হয়েছে; অফিসার আবার দেখবেন', 'Objection submitted; an officer will review it'));
      nav(`/cases/${c.id}`, { replace: true });
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content stack" style={{ maxWidth: 640 }}>
      <div className="card row">
        <span className="lr-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger)', width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
          <Icon name={VIOLATIONS[c.violation].icon} size={20} />
        </span>
        <div>
          <div className="strong">
            {tx(VIOLATIONS[c.violation].name)} · {tx(c.location)}
          </div>
          <div className="small muted">
            {c.id} · {tx(v?.regNo)}
          </div>
        </div>
      </div>
      <div>
        <span className="tag-heading">{tr('আপত্তির কারণ', 'Reason')}</span>
        <div className="tag-rule" />
      </div>
      <div className="stack" style={{ gap: 8 }} role="radiogroup" aria-label={tr('আপত্তির কারণ', 'Reason')}>
        {OBJECTION_REASONS.map((o) => (
          <label key={o.id} className="check card flat" style={{ padding: 12, borderColor: reason === o.id ? 'var(--brand-700)' : undefined }}>
            <input type="radio" name="reason" checked={reason === o.id} onChange={() => setReason(o.id)} />
            <span>{tx(o.label)}</span>
          </label>
        ))}
      </div>
      <Field label={tr('বিস্তারিত লিখুন', 'Explain')} htmlFor="det" error={error}>
        <textarea id="det" className="textarea" value={details} aria-invalid={!!error} onChange={(e) => setDetails(e.target.value)} placeholder={tr('যেমন: ছবিতে প্লেটের শেষ অঙ্ক ৮, আমার গাড়ির শেষ অঙ্ক ৬।', 'e.g. The plate in the photo ends in 8; mine ends in 6.')} />
      </Field>
      <PhotoPicker photos={photos} onChange={setPhotos} max={3} allowSample={false} label={tr('প্রমাণ যুক্ত করুন (ছবি বা কাগজ)', 'Attach evidence (photo or document)')} />
      <p className="small muted row" style={{ alignItems: 'flex-start' }}>
        <Upload size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
        {tr('একজন অফিসার ভিডিও প্রমাণ আবার দেখবেন। আপত্তি চলাকালীন পরিশোধের সময়সীমা স্থগিত থাকবে (প্রস্তাবিত)।', 'An officer will review the video again. The payment deadline is paused while the objection is reviewed (proposed).')}
      </p>
      {failed && <ErrorBanner onRetry={submit} />}
      <div className="sticky-actions">
        <SubmitButton busy={busy} onClick={submit}>
          <Send size={18} aria-hidden="true" /> {tr('আপত্তি জমা দিন', 'Submit objection')}
        </SubmitButton>
      </div>
    </div>
  );
}

export function NominatePage() {
  const { id } = useParams();
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('প্রকৃত চালক মনোনয়ন', 'Nominate the driver')} />
      <RequireTier tier={2} what={tr('মনোনয়ন', 'nomination')}>
        <NominateBody id={id ?? ''} />
      </RequireTier>
    </>
  );
}

function NominateBody({ id }: { id: string }) {
  const { state, update, toast } = useApp();
  const { tr, tx, dateTime } = useI18n();
  const nav = useNavigate();
  const c = useMyCases().find((x) => x.id === id);
  const [form, setForm] = useState({ name: '', license: '', mobile: '', sure: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!c) return <div className="content"><Empty icon={<FileText size={24} />} title={tr('মামলা পাওয়া যায়নি', 'Case not found')} /></div>;
  const v = state.vehicles.find((x) => x.id === c.vehicleId);
  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = tr('চালকের পূর্ণ নাম দিন', 'Enter the driver’s full name');
    if (form.license.trim().length < 6) e.license = tr('লাইসেন্স নম্বর দিন', 'Enter the licence number');
    if (!/^01\d{9}$/.test(form.mobile.replace(/[^0-9]/g, ''))) e.mobile = tr('১১ সংখ্যার মোবাইল নম্বর দিন', 'Enter an 11-digit mobile number');
    if (!form.sure) e.sure = tr('ঘোষণাটি নিশ্চিত করুন', 'Confirm the declaration');
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure });
      update((d) => {
        const x = d.cases.find((y) => y.id === c.id);
        if (x) x.nomination = { name: form.name.trim(), license: form.license.trim(), mobile: form.mobile.trim(), submittedAt: new Date().toISOString(), status: 'pending' };
      });
      toast(tr('মনোনয়ন পাঠানো হয়েছে; চালক নিশ্চিত করলে মামলা তাঁর নামে যাবে', 'Nomination sent; the case moves to the driver once they confirm'));
      nav(`/cases/${c.id}`, { replace: true });
    } catch (err) {
      if (err instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content stack" style={{ maxWidth: 640 }}>
      <div className="card row">
        <FileText size={20} aria-hidden="true" />
        <div>
          <div className="strong">
            {tx(VIOLATIONS[c.violation].name)} · {tx(c.location)}
          </div>
          <div className="small muted">
            {tx(v?.regNo)} · {dateTime(c.occurredAt)}
          </div>
        </div>
      </div>
      <p className="small">{tr('গাড়ির মালিক হিসেবে মামলাটি সেই সময়ের প্রকৃত চালকের নামে পাঠাতে পারেন। চালক অ্যাপে নিশ্চিত করলে জরিমানা ও লাইসেন্সের পয়েন্ট তাঁর নামে যাবে।', 'As the owner you can send the case to whoever was actually driving. Once the driver confirms in the app, the fine and licence points move to them.')}</p>
      <Field label={tr('চালকের নাম', 'Driver’s name')} htmlFor="dn" error={errors.name}>
        <input id="dn" className="input" value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label={tr('ড্রাইভিং লাইসেন্স নম্বর', 'Driving licence number')} htmlFor="dl" error={errors.license}>
        <input id="dl" className="input" value={form.license} aria-invalid={!!errors.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="DK…" />
      </Field>
      <Field label={tr('চালকের মোবাইল', 'Driver’s mobile')} htmlFor="dm" error={errors.mobile}>
        <input id="dm" className="input" inputMode="tel" value={form.mobile} aria-invalid={!!errors.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="01XXXXXXXXX" />
      </Field>
      <label className="check">
        <input type="checkbox" checked={form.sure} onChange={(e) => setForm({ ...form, sure: e.target.checked })} />
        <span className="small">{tr('আমি নিশ্চিত করছি, সেই সময় গাড়িটি উক্ত ব্যক্তি চালাচ্ছিলেন। ভুল তথ্য দেওয়া দণ্ডনীয়।', 'I confirm this person was driving at that time. Giving false information is punishable.')}</span>
      </label>
      {errors.sure && (
        <p className="danger-text small strong" role="alert">
          {errors.sure}
        </p>
      )}
      <Banner>{tr('চালক ৭ দিনের মধ্যে নিশ্চিত না করলে মামলা মালিকের নামেই থাকবে (প্রস্তাবিত)।', 'If the driver does not confirm within 7 days, the case stays with the owner (proposed).')}</Banner>
      {failed && <ErrorBanner onRetry={submit} />}
      <SubmitButton busy={busy} onClick={submit}>
        <Send size={18} aria-hidden="true" /> {tr('মনোনয়ন পাঠান', 'Send nomination')}
      </SubmitButton>
    </div>
  );
}

export function ViolationsPage() {
  const { tr, tx } = useI18n();
  const codes = useMemo(() => Object.keys(VIOLATIONS) as ViolationCode[], []);
  return (
    <>
      <PageHeader title={tr('কোন লঙ্ঘন, কী প্রমাণ', 'Which violation, what evidence')} />
      <div className="content stack">
        <Banner>{tr('AI ক্যামেরা এই ৭ ধরনের লঙ্ঘন শনাক্ত করে। প্রতিটি মামলা অফিসার যাচাই করার পর নোটিশ যায়।', 'AI cameras detect these 7 violations. A notice is sent only after an officer verifies each case.')}</Banner>
        <div className="grid-auto">
          {codes.map((code) => (
            <div key={code} className="card row" style={{ alignItems: 'flex-start' }}>
              <span className="lr-icon" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={VIOLATIONS[code].icon} size={20} />
              </span>
              <div>
                <div className="strong">{tx(VIOLATIONS[code].name)}</div>
                <div className="small muted">{tx(VIOLATIONS[code].evidence)}</div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/cases" className="btn outline">
          <FileText size={18} aria-hidden="true" /> {tr('আমার মামলা দেখুন', 'See my cases')}
        </Link>
      </div>
    </>
  );
}
