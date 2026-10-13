import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, ClipboardList, Clock, ImageIcon, Link2, MapPin, Plus, RefreshCw, Trash2, UserRound, X } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, ErrorBanner, PageHeader, Stars, StatusBadge, SubmitButton, Tabs } from '../../components/ui';
import { MapView } from '../../components/MapView';
import { categoryLabel, SubmittedPanel } from './Report';
import { REPORT_STATUS } from '../../data/catalog';
import { THANAS } from '../../data/thanas';
import type { CitizenReport, L, ReportKind, ReportStatus } from '../../data/types';
import { simulate, SimulatedNetworkError } from '../../services/api';
import { FLOW } from '../../services/workflow';
import { shortHash } from '../../lib/format';
import { useOnline } from '../../components/AppShell';

export const KIND_LABEL: Record<ReportKind, L> = {
  incident: { bn: 'সড়ক রিপোর্ট', en: 'Road report' },
  complaint: { bn: 'অভিযোগ', en: 'Complaint' },
  cyber: { bn: 'সাইবার', en: 'Cyber' },
  women_child: { bn: 'নারী ও শিশু', en: 'Women & child' },
  rickshaw: { bn: 'ই-রিক্সা', en: 'e-Rickshaw' },
  joint_accident: { bn: 'যৌথ দুর্ঘটনা', en: 'Joint accident' },
  fake_sms: { bn: 'ভুয়া SMS', en: 'Fake SMS' },
};

export default function MyReports() {
  const { state } = useApp();
  const { tr, tx, ago, n } = useI18n();
  const [tab, setTab] = useState<'open' | 'done' | 'queued'>('open');
  const mine = state.reports.filter((r) => r.mine);
  const groups = {
    open: mine.filter((r) => !['resolved', 'rejected', 'queued'].includes(r.status)),
    done: mine.filter((r) => ['resolved', 'rejected'].includes(r.status)),
    queued: mine.filter((r) => r.status === 'queued'),
  };
  const list = groups[tab];
  return (
    <>
      <PageHeader title={tr('আমার রিপোর্ট', 'My reports')} />
      <div className="content stack">
        <Tabs
          label={tr('রিপোর্টের অবস্থা', 'Report status')}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'open', label: tr(`চলমান (${n(groups.open.length)})`, `Open (${groups.open.length})`) },
            { id: 'done', label: tr(`নিষ্পত্তি (${n(groups.done.length)})`, `Closed (${groups.done.length})`) },
            { id: 'queued', label: tr(`পাঠানো বাকি (${n(groups.queued.length)})`, `Not sent (${groups.queued.length})`) },
          ]}
        />
        {list.length === 0 ? (
          <Empty
            icon={<ClipboardList size={24} />}
            title={tab === 'queued' ? tr('পাঠানোর অপেক্ষায় কিছু নেই', 'Nothing waiting to be sent') : tr('এখানে কোনো রিপোর্ট নেই', 'No reports here')}
            action={
              <Link to="/report" className="btn primary small">
                <Plus size={16} aria-hidden="true" /> {tr('নতুন রিপোর্ট', 'New report')}
              </Link>
            }
          />
        ) : (
          <div className="list">
            {list.map((r) => (
              <Link key={r.id} to={`/reports/${r.id}`} className="list-row" style={{ alignItems: 'flex-start' }}>
                <span className="lr-icon">
                  <ClipboardList size={20} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tx(categoryLabel(r.kind, r.category))}
                  </span>
                  <span className="lr-sub" style={{ display: 'block' }}>
                    {r.ref} · {tx(KIND_LABEL[r.kind])} · {tx(r.locationLabel)}
                  </span>
                  <span className="tiny muted">{ago(r.timeline[r.timeline.length - 1]?.at ?? r.createdAt)}</span>
                </span>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
        <Link to="/report" className="btn outline">
          <Plus size={18} aria-hidden="true" /> {tr('আরেকটি রিপোর্ট করুন', 'File another report')}
        </Link>
      </div>
    </>
  );
}

export function Progress({ r }: { r: CitizenReport }) {
  const { tr, tx, time, date } = useI18n();
  const { state } = useApp();
  if (r.status === 'queued') return null;
  const reached = new Set(r.timeline.map((t) => t.status));
  const steps: ReportStatus[] = r.status === 'rejected' ? [...r.timeline.map((t) => t.status)] : FLOW;
  const officer = state.officers.find((o) => o.id === r.assignedOfficerId);
  return (
    <ol className="timeline" aria-label={tr('অগ্রগতি', 'Progress')}>
      {steps.map((s, i) => {
        const entry = [...r.timeline].reverse().find((t) => t.status === s);
        const done = reached.has(s);
        const current = s === r.status && s !== 'resolved' && s !== 'rejected';
        return (
          <li key={`${s}-${i}`}>
            <span className={`tl-dot ${current ? 'current' : done ? (s === 'rejected' ? 'bad' : '') : 'pending'}`} aria-hidden="true">
              {done && !current ? s === 'rejected' ? <X size={14} /> : <Check size={14} /> : null}
            </span>
            <div>
              <div className="strong">{tx(REPORT_STATUS[s])}</div>
              {entry ? (
                <div className="small muted">
                  {date(entry.at)}, {time(entry.at)} · {tx(entry.note)}
                  {s === 'assigned' && officer && (
                    <>
                      {' '}
                      · {tx(officer.name)}, {tx(officer.division)}
                    </>
                  )}
                </div>
              ) : (
                <div className="small muted">{s === 'resolved' ? tr('ব্যবস্থা নেওয়ার পর আপনাকে জানানো হবে', 'You will be told once action is taken') : tr('অপেক্ষমাণ', 'Pending')}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ReportDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { state, update, toast } = useApp();
  const { tr, tx, dateTime } = useI18n();
  const online = useOnline();
  const r = state.reports.find((x) => x.id === id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!r || (!r.mine && !params.get('view')))
    return (
      <>
        <PageHeader title={tr('রিপোর্ট', 'Report')} />
        <div className="content">
          <Empty icon={<ClipboardList size={24} />} title={tr('রিপোর্ট পাওয়া যায়নি', 'Report not found')} action={<Link to="/reports" className="btn outline small">{tr('আমার রিপোর্ট', 'My reports')}</Link>} />
        </div>
      </>
    );

  const thana = THANAS.find((t) => t.id === r.thanaId);
  const primary = r.duplicateOf ? state.reports.find((x) => x.id === r.duplicateOf) : undefined;
  const linked = state.reports.filter((x) => x.duplicateOf === r.id).length;

  const sendQueued = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure || !online });
      update((d) => {
        const x = d.reports.find((y) => y.id === r.id);
        if (!x) return;
        x.status = 'received';
        x.createdAt = new Date().toISOString();
        x.timeline.push({ status: 'received', at: x.createdAt, note: { bn: 'সংযোগ ফিরে আসার পর পাঠানো হয়েছে', en: 'Sent after the connection returned' } });
      });
      toast(tr('রিপোর্ট পাঠানো হয়েছে', 'Report sent'));
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const rate = () => {
    if (!rating) return;
    update((d) => {
      const x = d.reports.find((y) => y.id === r.id);
      if (x) {
        x.rating = rating;
        x.ratingComment = comment.trim() || undefined;
      }
      d.feedback.unshift({ id: `F${d.feedback.length + 1}`, service: 'report', rating, comment: comment.trim(), anonymous: r.anonymous, at: new Date().toISOString() });
    });
    toast(tr('ধন্যবাদ! আপনার রেটিং DMP-এর সেবার মান মাপতে ব্যবহার হবে।', 'Thank you! Your rating helps DMP measure service quality.'));
  };

  return (
    <>
      <PageHeader title={tr(`রিপোর্ট #${r.ref.slice(-3)}`, `Report #${r.ref.slice(-3)}`)} />
      <div className="content cols">
        <div className="stack-lg">
          {params.get('new') && <SubmittedPanel r={r} />}
          <div className="card row" style={{ alignItems: 'flex-start' }}>
            <span className="lr-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#13222a', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ClipboardList size={24} aria-hidden="true" />
            </span>
            <div className="grow">
              <h2 style={{ fontSize: '1.1rem' }}>{tx(categoryLabel(r.kind, r.category))}</h2>
              <div className="small muted">
                {tx(r.locationLabel)} · {dateTime(r.createdAt)}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={r.status} />
              </div>
            </div>
          </div>

          {r.status === 'queued' && (
            <div className="stack">
              <Banner tone="warn">{tr('এই রিপোর্ট এখনো পাঠানো হয়নি; শুধু এই ডিভাইসে আছে।', 'This report has not been sent yet; it exists only on this device.')}</Banner>
              {failed && <ErrorBanner />}
              <div className="btn-row">
                <button
                  type="button"
                  className="btn outline-danger"
                  onClick={() => {
                    update((d) => {
                      d.reports = d.reports.filter((y) => y.id !== r.id);
                    });
                    toast(tr('খসড়া মুছে ফেলা হয়েছে', 'Draft deleted'), 'info');
                    history.back();
                  }}
                >
                  <Trash2 size={18} aria-hidden="true" /> {tr('মুছুন', 'Delete')}
                </button>
                <SubmitButton busy={busy} className="primary" onClick={sendQueued}>
                  <RefreshCw size={18} aria-hidden="true" /> {tr('এখন পাঠান', 'Send now')}
                </SubmitButton>
              </div>
            </div>
          )}

          {primary && (
            <Banner tone="brand" icon={<Link2 size={18} aria-hidden="true" />}>
              {tr(`একই ঘটনার রিপোর্ট ${primary.ref}-এর সঙ্গে যুক্ত; অগ্রগতি একসঙ্গে হালনাগাদ হয়।`, `Linked to ${primary.ref} about the same incident; progress updates together.`)}
            </Banner>
          )}
          {linked > 0 && <Banner tone="brand">{tr(`আরও ${linked} জন একই ঘটনা রিপোর্ট করেছেন।`, `${linked} more people reported the same incident.`)}</Banner>}

          <section className="stack">
            <div>
              <span className="tag-heading">{tr('অগ্রগতি', 'Progress')}</span>
              <div className="tag-rule" />
            </div>
            <Progress r={r} />
          </section>

          {r.status === 'resolved' && (
            <section className="card stack">
              <h3>{tr('সেবা কেমন ছিল?', 'How was the service?')}</h3>
              {r.rating ? (
                <div className="stack" style={{ gap: 6 }}>
                  <Stars value={r.rating} label={tr('আপনার রেটিং', 'Your rating')} />
                  {r.ratingComment && <p className="small">{r.ratingComment}</p>}
                  <p className="small muted">{tr('রেটিং দেওয়ার জন্য ধন্যবাদ।', 'Thanks for rating.')}</p>
                </div>
              ) : (
                <>
                  <Stars value={rating} onChange={setRating} label={tr('রেটিং দিন', 'Rate')} />
                  <textarea className="textarea" style={{ minHeight: 70 }} placeholder={tr('মন্তব্য (ঐচ্ছিক)', 'Comment (optional)')} value={comment} onChange={(e) => setComment(e.target.value)} aria-label={tr('মন্তব্য', 'Comment')} />
                  <button type="button" className="btn primary" disabled={!rating} onClick={rate}>
                    {tr('রেটিং জমা দিন', 'Submit rating')}
                  </button>
                </>
              )}
            </section>
          )}
          {r.status !== 'resolved' && r.status !== 'queued' && (
            <Banner tone="warn" icon={<Clock size={18} aria-hidden="true" />}>
              {tr('নিষ্পত্তির পর রেটিং দিতে পারবেন। আপনার রেটিং DMP-এর সেবার মান মাপতে ব্যবহার হয়।', 'You can rate once it is resolved. Ratings are used to measure DMP service quality.')}
            </Banner>
          )}
        </div>

        <div className="stack-lg">
          <MapView center={r} zoom={15} markers={[{ id: r.id, lat: r.lat, lng: r.lng, kind: 'report', color: '#c62828', title: tx(r.locationLabel) }]} label={tr('ঘটনাস্থল', 'Location')} height={240} />
          <div className="kv">
            <div>{tr('রেফারেন্স', 'Reference')}</div>
            <div>{r.ref}</div>
            <div>{tr('থানা', 'Thana')}</div>
            <div>{tx(thana?.name)}</div>
            {r.vehicleNo && (
              <>
                <div>{tr('গাড়ি', 'Vehicle')}</div>
                <div>{r.vehicleNo}</div>
              </>
            )}
            <div>{tr('পরিচয়', 'Identity')}</div>
            <div>{r.anonymous ? tr('বেনামে', 'Anonymous') : r.hideIdentity ? tr('জনসমক্ষে গোপন', 'Hidden from public') : tr('দৃশ্যমান', 'Visible')}</div>
          </div>
          <div className="card flat">
            <div className="small muted row" style={{ gap: 6, marginBottom: 6 }}>
              <MapPin size={14} aria-hidden="true" /> {tr('আপনার বিবরণ', 'Your description')}
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{r.description}</p>
          </div>
          {r.photos.length > 0 && (
            <section className="stack">
              <h3 className="section-title">{tr('প্রমাণ', 'Evidence')}</h3>
              {r.photos.map((p) => (
                <div key={p.hash} className="row card flat" style={{ padding: 10 }}>
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
                    <span className={`badge ${p.trust === 'high' ? 'success' : p.trust === 'needs_review' ? 'warn' : 'danger'}`}>
                      {p.trust === 'high' ? tr('মাঝারি আস্থা', 'Moderate trust') : p.trust === 'needs_review' ? tr('যাচাই প্রয়োজন', 'Needs review') : tr('গ্রহণযোগ্য নয়', 'Not acceptable')}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          )}
          {r.assignedOfficerId && (
            <div className="card tinted row">
              <UserRound size={22} aria-hidden="true" />
              <span className="small">
                {tr('দায়িত্বপ্রাপ্ত: ', 'Handled by: ')}
                <strong>{tx(state.officers.find((o) => o.id === r.assignedOfficerId)?.name)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
