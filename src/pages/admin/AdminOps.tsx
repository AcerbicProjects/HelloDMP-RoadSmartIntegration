import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Eye, EyeOff, Gavel, ImageIcon, Link2, Megaphone, Send, ShieldCheck, Siren, TriangleAlert, UserCheck, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, ErrorBanner, Field, PageHeader, SeverityBadge, StatusBadge, SubmitButton, Tabs } from '../../components/ui';
import { MapView, type MapMarker } from '../../components/MapView';
import { EvidenceViewer } from '../../components/Evidence';
import { KIND_LABEL, Progress } from '../citizen/MyReports';
import { categoryLabel } from '../citizen/Report';
import { ALERT_TYPES, OBJECTION_REASONS, ROUTING, SOS_TYPES, VIOLATIONS } from '../../data/catalog';
import { AREAS } from '../../data/seed';
import { THANAS } from '../../data/thanas';
import { simulate } from '../../services/api';
import { distanceKm } from '../../services/geo';
import { nearestOfficers, OPEN_STATUSES, setReportStatus } from '../../services/workflow';
import { shortHash } from '../../lib/format';
import type { AlertType, Announcement, CitizenReport, L, ReportKind, ReportStatus, Severity, TrafficAlert } from '../../data/types';

const FIELD_KINDS: ReportKind[] = ['incident', 'rickshaw', 'joint_accident'];

function maskMobile(m?: string) {
  return m && m.length >= 7 ? `${m.slice(0, 3)}${'X'.repeat(m.length - 6)}${m.slice(-3)}` : '';
}

/** Same category within 300 m, filed up to two hours apart: a likely duplicate (SG-014, SG-049). */
function duplicateCandidates(all: CitizenReport[], r: CitizenReport) {
  return all.filter(
    (x) =>
      x.id !== r.id &&
      !x.duplicateOf &&
      x.kind === r.kind &&
      x.category === r.category &&
      x.status !== 'queued' &&
      x.status !== 'rejected' &&
      distanceKm(x, r) < 0.3 &&
      Math.abs(new Date(x.createdAt).getTime() - new Date(r.createdAt).getTime()) < 2 * 3600_000,
  );
}

/* ---------------- Triage (SG-047) ---------------- */

export function Triage() {
  const { state } = useApp();
  const { tr, tx, n, ago } = useI18n();
  const [tab, setTab] = useState<'new' | 'progress' | 'closed'>('new');
  const [kind, setKind] = useState<ReportKind | 'all'>('all');
  const primary = state.reports.filter((r) => !r.duplicateOf && r.status !== 'queued' && (kind === 'all' || r.kind === kind));
  const groups = {
    new: primary.filter((r) => r.status === 'received'),
    progress: primary.filter((r) => OPEN_STATUSES.includes(r.status) && r.status !== 'received'),
    closed: primary.filter((r) => r.status === 'resolved' || r.status === 'rejected'),
  };
  const list = [...groups[tab]].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHeader title={tr('রিপোর্ট ট্রায়াজ', 'Report triage')} back={false} />
      <div className="content stack" style={{ maxWidth: 1080 }}>
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="grow" style={{ minWidth: 280 }}>
            <Tabs
              label={tr('তালিকা', 'Queue')}
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'new', label: tr(`নতুন (${n(groups.new.length)})`, `New (${groups.new.length})`) },
                { id: 'progress', label: tr(`চলমান (${n(groups.progress.length)})`, `In progress (${groups.progress.length})`) },
                { id: 'closed', label: tr('বন্ধ', 'Closed') },
              ]}
            />
          </div>
          <label className="row small" style={{ gap: 6 }}>
            <span>{tr('ধরন', 'Type')}</span>
            <select className="select" style={{ width: 'auto' }} value={kind} onChange={(e) => setKind(e.target.value as ReportKind | 'all')}>
              <option value="all">{tr('সব', 'All')}</option>
              {(Object.keys(KIND_LABEL) as ReportKind[]).map((k) => (
                <option key={k} value={k}>
                  {tx(KIND_LABEL[k])}
                </option>
              ))}
            </select>
          </label>
        </div>
        {list.length === 0 ? (
          <Empty icon={<ClipboardList size={28} />} title={tr('এই তালিকায় কিছু নেই', 'Nothing in this queue')} body={tab === 'new' ? tr('নাগরিক অ্যাপ থেকে নতুন রিপোর্ট এলে এখানে দেখা যাবে।', 'New reports from the citizen app appear here.') : undefined} />
        ) : (
          list.map((r) => {
            const dups = state.reports.filter((x) => x.duplicateOf === r.id).length;
            const cand = r.status === 'received' ? duplicateCandidates(state.reports, r).filter((x) => x.createdAt < r.createdAt)[0] : undefined;
            return (
              <Link key={r.id} to={`/admin/reports/${r.id}`} className="task-card">
                <span className="grow stack" style={{ gap: 4 }}>
                  <span className="row wrap" style={{ gap: 8 }}>
                    <span className="strong">{r.ref}</span>
                    <span className="badge">{tx(KIND_LABEL[r.kind])}</span>
                    <StatusBadge status={r.status} />
                    {dups > 0 && <span className="badge brand">{tr(`+${n(dups)} একই ঘটনা`, `+${dups} same incident`)}</span>}
                  </span>
                  <span>{tx(categoryLabel(r.kind, r.category))}</span>
                  <span className="small muted">
                    {tx(r.locationLabel)} · {ago(r.createdAt)} · {tr('পাঠানো হবে', 'Route to')}: {tx(ROUTING[r.kind])}
                  </span>
                  {cand && (
                    <span className="small" style={{ color: 'var(--warning)' }}>
                      <Link2 size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /> {tr(`সম্ভাব্য ডুপ্লিকেট: ${cand.ref}`, `Possible duplicate of ${cand.ref}`)}
                    </span>
                  )}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}

const REJECT: { id: string; label: L }[] = [
  { id: 'insufficient', label: { bn: 'তথ্য বা প্রমাণ যথেষ্ট নয়', en: 'Not enough information or evidence' } },
  { id: 'not_police', label: { bn: 'পুলিশের এখতিয়ারের বাইরে; সংশ্লিষ্ট সংস্থায় যোগাযোগ করুন', en: 'Outside police remit; contact the responsible agency' } },
  { id: 'abusive', label: { bn: 'অপব্যবহার বা ভুয়া রিপোর্ট', en: 'Misuse or false report' } },
];

export function ReportDesk() {
  const { id } = useParams();
  const { state, update, notify, toast } = useApp();
  const { tr, tx, n, dateTime } = useI18n();
  const r = state.reports.find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<null | (() => void)>(null);
  const [reason, setReason] = useState(REJECT[0].id);
  const [note, setNote] = useState('');
  if (!r)
    return (
      <>
        <PageHeader title={tr('রিপোর্ট', 'Report')} back="/admin/triage" />
        <div className="content">
          <Empty icon={<ClipboardList size={28} />} title={tr('রিপোর্ট পাওয়া যায়নি', 'Report not found')} />
        </div>
      </>
    );
  const primary = r.duplicateOf ? state.reports.find((x) => x.id === r.duplicateOf) : undefined;
  const dups = state.reports.filter((x) => x.duplicateOf === r.id);
  const field = FIELD_KINDS.includes(r.kind);
  const open = OPEN_STATUSES.includes(r.status) && !r.duplicateOf;
  const officers = nearestOfficers(state.officers, r).slice(0, 3);
  const assigned = state.officers.find((o) => o.id === r.assignedOfficerId);
  const candidates = duplicateCandidates(state.reports, r);
  const desk = ROUTING[r.kind];

  const run = async (fn: () => void, msg: string) => {
    setBusy(true);
    setFailed(null);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 400 });
      fn();
      toast(msg);
    } catch {
      setFailed(() => () => void run(fn, msg));
    } finally {
      setBusy(false);
    }
  };
  const move = (status: ReportStatus, noteL: L, officerId?: string) => update((d) => setReportStatus(d, r.id, status, noteL, notify, officerId));

  const merge = (target: CitizenReport) =>
    update((d) => {
      const x = d.reports.find((y) => y.id === r.id);
      if (!x) return;
      x.duplicateOf = target.id;
      x.status = target.status;
      x.assignedOfficerId = target.assignedOfficerId;
      x.timeline.push({ status: target.status, at: new Date().toISOString(), note: { bn: `একই ঘটনার ${target.ref}-এর সঙ্গে যুক্ত করা হয়েছে`, en: `Linked to ${target.ref} about the same incident` } });
      // Earlier duplicates of this report follow it to the new primary.
      d.reports.filter((y) => y.duplicateOf === r.id).forEach((y) => (y.duplicateOf = target.id));
      if (x.mine) notify(d, { category: 'reports', title: { bn: `রিপোর্ট #${x.ref.slice(-3)} একই ঘটনার সঙ্গে যুক্ত`, en: `Report #${x.ref.slice(-3)} linked to the same incident` }, body: x.locationLabel, link: `/reports/${x.id}` });
    });

  const resolveNote: L = note.trim() ? { bn: note.trim(), en: note.trim() } : { bn: 'কন্ট্রোল রুম নিষ্পত্তি করেছে', en: 'Closed by the control room' };

  return (
    <>
      <PageHeader title={r.ref} back="/admin/triage" />
      <div className="content cols" style={{ maxWidth: 1280 }}>
        <div className="stack-lg">
          <div className="card stack" style={{ gap: 6 }}>
            <div className="row wrap" style={{ gap: 8 }}>
              <span className="badge">{tx(KIND_LABEL[r.kind])}</span>
              <StatusBadge status={r.status} />
            </div>
            <h2 style={{ fontSize: '1.15rem' }}>{tx(categoryLabel(r.kind, r.category))}</h2>
            <span className="small muted">
              {tx(r.locationLabel)} · {dateTime(r.createdAt)}
            </span>
            <span className="small">
              {tr('পাঠানোর ডেস্ক', 'Routed to')}: <strong>{tx(desk)}</strong> · {tx(THANAS.find((t) => t.id === r.thanaId)?.name)}
            </span>
          </div>

          {primary && (
            <Banner tone="brand" icon={<Link2 size={18} aria-hidden="true" />}>
              {tr('এটি ডুপ্লিকেট; মূল রিপোর্ট', 'This is a duplicate; primary report')} <Link to={`/admin/reports/${primary.id}`}>{primary.ref}</Link>
            </Banner>
          )}
          {dups.length > 0 && (
            <Banner tone="brand">
              {tr(`${n(dups.length)}টি ডুপ্লিকেট এর সঙ্গে যুক্ত: `, `${dups.length} duplicates are linked: `)}
              {dups.map((x) => x.ref).join(', ')}
            </Banner>
          )}

          {open && (
            <section className="card stack">
              <h3>{tr('পদক্ষেপ', 'Actions')}</h3>
              {failed && <ErrorBanner onRetry={failed} />}
              {r.status === 'received' && (
                <SubmitButton busy={busy} onClick={() => void run(() => move('verified', { bn: 'কন্ট্রোল রুম যাচাই করেছে', en: 'Verified by the control room' }), tr('যাচাই হয়েছে', 'Verified'))}>
                  <ShieldCheck size={18} aria-hidden="true" /> {tr('যাচাই (স্বীকৃতি) দিন', 'Verify (acknowledge)')}
                </SubmitButton>
              )}

              {field ? (
                <div className="stack" style={{ gap: 6 }}>
                  <span className="small strong">{assigned ? tr(`নিযুক্ত: ${tx(assigned.name)}। পুনরায় নিয়োগ:`, `Assigned: ${tx(assigned.name)}. Reassign:`) : tr('নিকটতম ডিউটিরত অফিসার', 'Nearest on-duty officers')}</span>
                  {officers.length === 0 && <span className="small muted">{tr('কেউ ডিউটিতে নেই', 'Nobody is on duty')}</span>}
                  {officers.map((o) => (
                    <div key={o.id} className="row card flat" style={{ padding: 10 }}>
                      <UserCheck size={18} aria-hidden="true" />
                      <span className="grow small">
                        <span className="strong">{tx(o.name)}</span> · {tr(`${n(o.km.toFixed(1))} কিমি`, `${o.km.toFixed(1)} km`)}
                      </span>
                      <button
                        type="button"
                        className="btn small outline"
                        disabled={busy || o.id === r.assignedOfficerId}
                        onClick={() => void run(() => move('assigned', { bn: `${o.name.bn}-কে দেওয়া হয়েছে`, en: `Assigned to ${o.name.en}` }, o.id), tr('অফিসার নিযুক্ত হয়েছে', 'Officer assigned'))}
                      >
                        {tr('নিয়োগ', 'Assign')}
                      </button>
                    </div>
                  ))}
                  <p className="tiny muted">{tr('অফিসার অ্যাপে কাজটি দেখা যাবে; পরের ধাপ অফিসার হালনাগাদ করবেন।', 'The task appears in the officer app; the officer updates the next steps.')}</p>
                </div>
              ) : (
                <div className="stack" style={{ gap: 6 }}>
                  {r.status !== 'assigned' && (
                    <button type="button" className="btn outline" disabled={busy} onClick={() => void run(() => move('assigned', { bn: `${desk.bn}-এ পাঠানো হয়েছে`, en: `Forwarded to the ${desk.en.toLowerCase()}` }), tr('ডেস্কে পাঠানো হয়েছে', 'Forwarded'))}>
                      <Send size={18} aria-hidden="true" /> {tr(`${tx(desk)}-এ পাঠান`, `Forward to the ${tx(desk).toLowerCase()}`)}
                    </button>
                  )}
                  <Field label={tr('নিষ্পত্তির নোট (নাগরিক দেখবেন)', 'Closing note (the citizen will see it)')} htmlFor="close-note">
                    <textarea id="close-note" className="textarea" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
                  </Field>
                  <button type="button" className="btn primary" disabled={busy} onClick={() => void run(() => move('resolved', resolveNote), tr('নিষ্পত্তি হয়েছে', 'Resolved'))}>
                    <CheckCircle2 size={18} aria-hidden="true" /> {tr('নিষ্পত্তি করুন', 'Mark resolved')}
                  </button>
                </div>
              )}

              {candidates.length > 0 && (
                <div className="stack" style={{ gap: 6 }}>
                  <span className="small strong">{tr('সম্ভাব্য একই ঘটনা', 'Possible same incident')}</span>
                  {candidates.map((c) => (
                    <div key={c.id} className="row card flat" style={{ padding: 10 }}>
                      <Link2 size={18} aria-hidden="true" />
                      <span className="grow small">
                        <Link to={`/admin/reports/${c.id}`}>{c.ref}</Link> · {tx(c.locationLabel)} · {Math.round(distanceKm(c, r) * 1000)} m
                      </span>
                      <button type="button" className="btn small outline" disabled={busy} onClick={() => void run(() => merge(c), tr('একত্রিত হয়েছে', 'Merged'))}>
                        {tr('এর সঙ্গে যুক্ত করুন', 'Merge into it')}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="row wrap" style={{ gap: 8 }}>
                <select className="select grow" aria-label={tr('বাতিলের কারণ', 'Reason for not accepting')} value={reason} onChange={(e) => setReason(e.target.value)} style={{ minWidth: 200 }}>
                  {REJECT.map((x) => (
                    <option key={x.id} value={x.id}>
                      {tx(x.label)}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn outline-danger" disabled={busy} onClick={() => void run(() => move('rejected', REJECT.find((x) => x.id === reason)!.label), tr('গ্রহণ করা হয়নি', 'Not accepted'))}>
                  <XCircle size={18} aria-hidden="true" /> {tr('গ্রহণযোগ্য নয়', 'Not accepted')}
                </button>
              </div>
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
          <MapView center={r} zoom={15} markers={[{ id: r.id, lat: r.lat, lng: r.lng, kind: 'report', color: '#c62828', title: tx(r.locationLabel) }, ...dups.map((x) => ({ id: x.id, lat: x.lat, lng: x.lng, kind: 'report' as const, color: '#1d4ed8', title: x.ref }))]} label={tr('ঘটনাস্থল', 'Location')} height={240} />
          <div className="kv">
            <div>{tr('রিপোর্টকারী', 'Reporter')}</div>
            <div>
              {r.anonymous || !r.reporterName ? (
                tr('বেনামে', 'Anonymous')
              ) : (
                <>
                  {r.reporterName} {r.reporterMobile && <span className="muted">· {maskMobile(r.reporterMobile)}</span>}
                </>
              )}
            </div>
            <div>{tr('পরিচয় সুরক্ষা', 'Identity protection')}</div>
            <div>{r.anonymous ? tr('বেনামে: কেউ পরিচয় জানেন না', 'Anonymous: nobody knows who sent it') : r.hideIdentity ? tr('জনসমক্ষে ও অভিযুক্তের কাছে গোপন; যাচাইকারী অফিসার দেখেন', 'Hidden from the public and the reported person; the verifying officer can see it') : tr('অভিযুক্তের কাছে গোপন', 'Hidden from the reported person')}</div>
            {r.vehicleNo && (
              <>
                <div>{tr('গাড়ি', 'Vehicle')}</div>
                <div>{r.vehicleNo}</div>
              </>
            )}
            {r.meta?.contact && (
              <>
                <div>{tr('যোগাযোগের পছন্দ', 'Contact preference')}</div>
                <div>{r.meta.contact}</div>
              </>
            )}
          </div>
          <div className="card flat">
            <div className="small muted" style={{ marginBottom: 6 }}>
              {tr('বিবরণ', 'Description')}
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{r.description}</p>
          </div>
          {r.photos.map((p) => (
            <div key={p.hash} className="row card flat" style={{ padding: 10 }}>
              {p.thumb ? <img src={p.thumb} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} /> : <ImageIcon size={22} aria-hidden="true" />}
              <div className="grow small">
                <div className="strong">{p.name}</div>
                <div className="muted tiny">SHA-256 {shortHash(p.hash)}</div>
              </div>
              <span className={`badge ${p.trust === 'high' ? 'success' : p.trust === 'needs_review' ? 'warn' : 'danger'}`}>{p.trust === 'high' ? tr('মাঝারি আস্থা', 'Moderate trust') : p.trust === 'needs_review' ? tr('যাচাই প্রয়োজন', 'Needs review') : tr('গ্রহণযোগ্য নয়', 'Not acceptable')}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Objections and nominations ---------------- */

export function ObjectionDesk() {
  const { state, update, notify, toast } = useApp();
  const { tr, tx, n, ago, date, taka } = useI18n();
  const [tab, setTab] = useState<'pending' | 'decided' | 'nominations'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [show, setShow] = useState<string>();
  const pending = state.cases.filter((c) => c.status === 'objection' && c.objection && !c.objection.decision);
  const decided = state.cases.filter((c) => c.objection?.decision).sort((a, b) => (b.objection!.decidedAt ?? '').localeCompare(a.objection!.decidedAt ?? ''));
  const noms = state.cases.filter((c) => c.nomination);

  const decide = (id: string, accept: boolean) => {
    const text = (notes[id] ?? '').trim();
    const decisionNote: L = text
      ? { bn: text, en: text }
      : accept
        ? { bn: 'প্রমাণ যাচাইয়ে আপত্তি গৃহীত হয়েছে; মামলা বাতিল।', en: 'The objection was upheld after checking the evidence; the case is cancelled.' }
        : { bn: 'প্রমাণে লঙ্ঘন নিশ্চিত হয়েছে; আপত্তি গৃহীত হয়নি।', en: 'The evidence confirms the violation; the objection was not upheld.' };
    update((d) => {
      const c = d.cases.find((x) => x.id === id);
      if (!c?.objection) return;
      const now = new Date();
      c.objection.decision = accept ? 'accepted' : 'rejected';
      c.objection.decidedAt = now.toISOString();
      c.objection.decisionNote = decisionNote;
      c.status = accept ? 'cancelled' : 'unpaid';
      if (!accept) {
        const minDue = now.getTime() + 7 * 86_400_000;
        if (new Date(c.dueDate).getTime() < minDue) c.dueDate = new Date(minDue).toISOString();
      }
      if (d.profile.vehicleIds.includes(c.vehicleId))
        notify(d, {
          category: 'cases',
          title: accept ? { bn: 'আপত্তি গৃহীত: মামলা বাতিল', en: 'Objection upheld: case cancelled' } : { bn: 'আপত্তি গৃহীত হয়নি', en: 'Objection not upheld' },
          body: decisionNote,
          link: `/cases/${c.id}`,
        });
    });
    toast(accept ? tr('আপত্তি গৃহীত; নাগরিককে জানানো হয়েছে', 'Objection upheld; the citizen was told') : tr('আপত্তি নাকচ; নাগরিককে জানানো হয়েছে', 'Objection not upheld; the citizen was told'));
  };

  const confirmNomination = (id: string) => {
    update((d) => {
      const c = d.cases.find((x) => x.id === id);
      if (!c?.nomination) return;
      c.nomination.status = 'confirmed';
      if (d.profile.vehicleIds.includes(c.vehicleId)) notify(d, { category: 'cases', title: { bn: 'চালক মনোনয়ন নিশ্চিত', en: 'Driver nomination confirmed' }, body: { bn: `মামলা ${c.id} মনোনীত চালকের নামে`, en: `Case ${c.id} is now in the nominated driver’s name` }, link: `/cases/${c.id}` });
    });
    toast(tr('মনোনয়ন নিশ্চিত হয়েছে', 'Nomination confirmed'));
  };

  const plate = (vid: string) => tx(state.vehicles.find((v) => v.id === vid)?.regNo);

  return (
    <>
      <PageHeader title={tr('আপত্তি ও মনোনয়ন', 'Objections and nominations')} back={false} />
      <div className="content stack" style={{ maxWidth: 1080 }}>
        <Tabs
          label={tr('তালিকা', 'Queue')}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pending', label: tr(`সিদ্ধান্ত বাকি (${n(pending.length)})`, `To decide (${pending.length})`) },
            { id: 'decided', label: tr('সিদ্ধান্ত হয়েছে', 'Decided') },
            { id: 'nominations', label: tr(`চালক মনোনয়ন (${n(noms.filter((c) => c.nomination!.status === 'pending').length)})`, `Driver nominations (${noms.filter((c) => c.nomination!.status === 'pending').length})`) },
          ]}
        />
        {tab === 'pending' &&
          (pending.length === 0 ? (
            <Empty icon={<Gavel size={28} />} title={tr('সিদ্ধান্তের অপেক্ষায় কোনো আপত্তি নেই', 'No objections waiting')} />
          ) : (
            pending.map((c) => {
              const o = c.objection!;
              return (
                <section key={c.id} className="card stack">
                  <div className="row between wrap">
                    <span className="strong">{c.id}</span>
                    <span className="small muted">
                      {tr('জমা', 'Filed')} {ago(o.submittedAt)}
                    </span>
                  </div>
                  <div className="kv">
                    <div>{tr('গাড়ি', 'Vehicle')}</div>
                    <div>{plate(c.vehicleId)}</div>
                    <div>{tr('লঙ্ঘন', 'Violation')}</div>
                    <div>
                      {tx(VIOLATIONS[c.violation].name)} · {tx(c.location)} · {date(c.occurredAt)}
                    </div>
                    <div>{tr('জরিমানা', 'Fine')}</div>
                    <div>{taka(c.amount)}</div>
                    <div>{tr('কারণ', 'Reason')}</div>
                    <div>{tx(OBJECTION_REASONS.find((x) => x.id === o.reason)?.label)}</div>
                    <div>{tr('বিবরণ', 'Details')}</div>
                    <div>{o.details}</div>
                    {o.attachments.length > 0 && (
                      <>
                        <div>{tr('সংযুক্তি', 'Attachments')}</div>
                        <div>{o.attachments.join(', ')}</div>
                      </>
                    )}
                  </div>
                  <button type="button" className="btn small ghost" style={{ alignSelf: 'flex-start' }} aria-expanded={show === c.id} onClick={() => setShow(show === c.id ? undefined : c.id)}>
                    {show === c.id ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />} {show === c.id ? tr('প্রমাণ লুকান', 'Hide evidence') : tr('প্রমাণ দেখুন', 'View evidence')}
                  </button>
                  {show === c.id && (
                    <div style={{ maxWidth: 520 }}>
                      <EvidenceViewer c={c} />
                    </div>
                  )}
                  <Field label={tr('সিদ্ধান্তের কারণ (নাগরিক দেখবেন)', 'Reason for the decision (the citizen will see it)')} htmlFor={`dn-${c.id}`}>
                    <textarea id={`dn-${c.id}`} className="textarea" rows={2} maxLength={300} value={notes[c.id] ?? ''} onChange={(e) => setNotes((x) => ({ ...x, [c.id]: e.target.value }))} />
                  </Field>
                  <div className="btn-row">
                    <button type="button" className="btn outline-danger" onClick={() => decide(c.id, false)}>
                      <XCircle size={18} aria-hidden="true" /> {tr('আপত্তি নাকচ', 'Do not uphold')}
                    </button>
                    <button type="button" className="btn primary" onClick={() => decide(c.id, true)}>
                      <CheckCircle2 size={18} aria-hidden="true" /> {tr('আপত্তি গ্রহণ (মামলা বাতিল)', 'Uphold (cancel case)')}
                    </button>
                  </div>
                </section>
              );
            })
          ))}
        {tab === 'decided' &&
          (decided.length === 0 ? (
            <Empty icon={<Gavel size={28} />} title={tr('এখনো কোনো সিদ্ধান্ত নেই', 'No decisions yet')} />
          ) : (
            <div className="list">
              {decided.map((c) => (
                <div key={c.id} className="list-row" style={{ cursor: 'default' }}>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block' }}>
                      {c.id} · {plate(c.vehicleId)}
                    </span>
                    <span className="lr-sub">{tx(c.objection!.decisionNote)}</span>
                  </span>
                  <span className={`badge ${c.objection!.decision === 'accepted' ? 'success' : 'danger'}`}>{c.objection!.decision === 'accepted' ? tr('গৃহীত', 'Upheld') : tr('নাকচ', 'Not upheld')}</span>
                </div>
              ))}
            </div>
          ))}
        {tab === 'nominations' &&
          (noms.length === 0 ? (
            <Empty icon={<UserCheck size={28} />} title={tr('কোনো মনোনয়ন নেই', 'No nominations')} body={tr('নাগরিক অ্যাপে গতির মামলায় "প্রকৃত চালক মনোনয়ন" দিয়ে চেষ্টা করুন।', 'Try "Nominate the actual driver" on a speeding case in the citizen app.')} />
          ) : (
            noms.map((c) => (
              <section key={c.id} className="card row wrap">
                <span className="grow small" style={{ minWidth: 220 }}>
                  <span className="strong" style={{ display: 'block' }}>
                    {c.id}
                  </span>
                  {c.nomination!.name} · {tr('লাইসেন্স', 'Licence')} {c.nomination!.license} · {maskMobile(c.nomination!.mobile)}
                </span>
                {c.nomination!.status === 'pending' ? (
                  <button type="button" className="btn small primary" onClick={() => confirmNomination(c.id)}>
                    <UserCheck size={16} aria-hidden="true" /> {tr('নিশ্চিত করুন', 'Confirm')}
                  </button>
                ) : (
                  <span className="badge success">{tr('নিশ্চিত', 'Confirmed')}</span>
                )}
              </section>
            ))
          ))}
      </div>
    </>
  );
}

/* ---------------- Content: alerts and announcements (SG-046) ---------------- */

const EMPTY_ALERT = { type: 'accident' as AlertType, severity: 'major' as Severity, areaId: 'farmgate', titleBn: '', titleEn: '', detailBn: '', detailEn: '', altBn: '', altEn: '' };
const EMPTY_NOTICE = { category: 'notice' as Announcement['category'], titleBn: '', titleEn: '', bodyBn: '', bodyEn: '' };

export function ContentDesk() {
  const { state, update, notify, toast } = useApp();
  const { tr, tx, ago, n } = useI18n();
  const [a, setA] = useState(EMPTY_ALERT);
  const [nn, setNn] = useState(EMPTY_NOTICE);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'alert' | 'notice' | null>(null);
  const [failed, setFailed] = useState<'alert' | 'notice' | null>(null);
  const live = state.alerts.filter((x) => x.status !== 'resolved').sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const matching = useMemo(() => state.routes.filter((r) => r.active && r.areaIds.includes(a.areaId)), [state.routes, a.areaId]);

  const publishAlert = async () => {
    const e: Record<string, string> = {};
    if (!a.titleBn.trim()) e.titleBn = tr('বাংলা শিরোনাম দিন', 'Enter a Bangla title');
    if (!a.detailBn.trim()) e.detailBn = tr('বাংলা বিবরণ দিন', 'Enter Bangla details');
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy('alert');
    setFailed(null);
    const area = AREAS.find((x) => x.id === a.areaId)!;
    const id = `A${state.alerts.reduce((m, x) => Math.max(m, Number(x.id.slice(1)) || 0), 0) + 1}`;
    const alert: TrafficAlert = {
      id,
      type: a.type,
      severity: a.severity,
      title: { bn: a.titleBn.trim(), en: a.titleEn.trim() },
      detail: { bn: a.detailBn.trim(), en: a.detailEn.trim() },
      alternate: a.altBn.trim() ? { bn: a.altBn.trim(), en: a.altEn.trim() } : undefined,
      areaId: area.id,
      lat: area.lat,
      lng: area.lng,
      createdAt: new Date().toISOString(),
      status: 'active',
      verifiedBy: 'DMP Traffic Control Room',
    };
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 500 });
      update((d) => {
        d.alerts.unshift(alert);
        if (matching.length) notify(d, { category: 'alerts', severity: alert.severity, title: { bn: `আপনার পথে: ${alert.title.bn}`, en: `On your route: ${alert.title.en || alert.title.bn}` }, body: alert.detail, link: `/alerts/${id}` });
      });
      toast(matching.length ? tr(`প্রকাশিত; ${n(matching.length)}টি সংরক্ষিত পথে মিলেছে, নাগরিককে জানানো হয়েছে`, `Published; matched ${matching.length} saved route(s) and notified the citizen`) : tr('প্রকাশিত; কোনো সংরক্ষিত পথে মেলেনি, তাই নোটিফিকেশন যায়নি', 'Published; no saved route matched, so no notification was sent'));
      setA(EMPTY_ALERT);
    } catch {
      setFailed('alert');
    } finally {
      setBusy(null);
    }
  };

  const publishNotice = async () => {
    const e: Record<string, string> = {};
    if (!nn.titleBn.trim()) e.nTitleBn = tr('বাংলা শিরোনাম দিন', 'Enter a Bangla title');
    if (!nn.bodyBn.trim()) e.nBodyBn = tr('বাংলা লেখা দিন', 'Enter the Bangla text');
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy('notice');
    setFailed(null);
    const id = `N${state.announcements.reduce((m, x) => Math.max(m, Number(x.id.slice(1)) || 0), 0) + 1}`;
    const item: Announcement = { id, category: nn.category, title: { bn: nn.titleBn.trim(), en: nn.titleEn.trim() }, body: { bn: nn.bodyBn.trim(), en: nn.bodyEn.trim() }, publishedAt: new Date().toISOString() };
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 500 });
      update((d) => {
        d.announcements.unshift(item);
        notify(d, { category: 'announcements', title: item.title, body: { bn: 'DMP-এর নতুন ঘোষণা', en: 'New DMP announcement' }, link: '/announcements' });
      });
      toast(tr('ঘোষণা প্রকাশিত হয়েছে', 'Announcement published'));
      setNn(EMPTY_NOTICE);
    } catch {
      setFailed('notice');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title={tr('সতর্কতা ও ঘোষণা প্রকাশ', 'Publish alerts and notices')} back={false} />
      <div className="content cols even" style={{ maxWidth: 1280 }}>
        <div className="stack-lg">
          <section className="card stack" aria-labelledby="pub-alert">
            <h2 id="pub-alert" className="row" style={{ fontSize: '1.05rem', gap: 8 }}>
              <TriangleAlert size={20} aria-hidden="true" /> {tr('যাচাই করা সতর্কতা প্রকাশ', 'Publish a verified alert')}
            </h2>
            <div className="grid-2">
              <Field label={tr('ধরন', 'Type')} htmlFor="al-type">
                <select id="al-type" className="select" value={a.type} onChange={(e) => setA({ ...a, type: e.target.value as AlertType })}>
                  {(Object.keys(ALERT_TYPES) as AlertType[]).map((k) => (
                    <option key={k} value={k}>
                      {tx(ALERT_TYPES[k].label)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={tr('মাত্রা', 'Severity')} htmlFor="al-sev">
                <select id="al-sev" className="select" value={a.severity} onChange={(e) => setA({ ...a, severity: e.target.value as Severity })}>
                  <option value="critical">{tr('গুরুতর', 'Critical')}</option>
                  <option value="major">{tr('বড়', 'Major')}</option>
                  <option value="minor">{tr('ছোট', 'Minor')}</option>
                </select>
              </Field>
            </div>
            <Field label={tr('এলাকা', 'Area')} hint={matching.length ? tr(`${n(matching.length)}টি সক্রিয় সংরক্ষিত পথ এই এলাকা দিয়ে যায়`, `${matching.length} active saved route(s) pass this area`) : tr('কোনো সক্রিয় সংরক্ষিত পথ এই এলাকা দিয়ে যায় না', 'No active saved route passes this area')} htmlFor="al-area">
              <select id="al-area" className="select" value={a.areaId} onChange={(e) => setA({ ...a, areaId: e.target.value })}>
                {AREAS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {tx(x.name)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={tr('শিরোনাম (বাংলা)', 'Title (Bangla)')} error={errs.titleBn} htmlFor="al-tbn">
              <input id="al-tbn" className="input" lang="bn" maxLength={80} value={a.titleBn} onChange={(e) => setA({ ...a, titleBn: e.target.value })} />
            </Field>
            <Field label={tr('শিরোনাম (ইংরেজি, ঐচ্ছিক)', 'Title (English, optional)')} htmlFor="al-ten">
              <input id="al-ten" className="input" lang="en" maxLength={80} value={a.titleEn} onChange={(e) => setA({ ...a, titleEn: e.target.value })} />
            </Field>
            <Field label={tr('বিবরণ (বাংলা)', 'Details (Bangla)')} error={errs.detailBn} htmlFor="al-dbn">
              <textarea id="al-dbn" className="textarea" lang="bn" rows={2} maxLength={200} value={a.detailBn} onChange={(e) => setA({ ...a, detailBn: e.target.value })} />
            </Field>
            <Field label={tr('বিবরণ (ইংরেজি, ঐচ্ছিক)', 'Details (English, optional)')} htmlFor="al-den">
              <textarea id="al-den" className="textarea" lang="en" rows={2} maxLength={200} value={a.detailEn} onChange={(e) => setA({ ...a, detailEn: e.target.value })} />
            </Field>
            <Field label={tr('বিকল্প পথ (ঐচ্ছিক)', 'Alternative route (optional)')} htmlFor="al-alt">
              <input id="al-alt" className="input" maxLength={120} value={a.altBn} onChange={(e) => setA({ ...a, altBn: e.target.value, altEn: a.altEn || '' })} />
            </Field>
            {failed === 'alert' && <ErrorBanner onRetry={() => void publishAlert()} />}
            <SubmitButton busy={busy === 'alert'} onClick={() => void publishAlert()}>
              <Send size={18} aria-hidden="true" /> {tr('প্রকাশ করুন', 'Publish')}
            </SubmitButton>
          </section>

          <section className="stack">
            <h2 className="section-title">{tr('চলমান ও নির্ধারিত সতর্কতা', 'Live and scheduled alerts')}</h2>
            {live.length === 0 && <Empty icon={<TriangleAlert size={28} />} title={tr('কোনো চলমান সতর্কতা নেই', 'No live alerts')} />}
            <div className="list">
              {live.map((x) => (
                <div key={x.id} className="list-row" style={{ cursor: 'default' }}>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block' }}>
                      {tx(x.title)}
                    </span>
                    <span className="lr-sub row wrap" style={{ gap: 6 }}>
                      <SeverityBadge severity={x.severity} /> {tx(ALERT_TYPES[x.type].label)} · {x.status === 'scheduled' ? tr('নির্ধারিত', 'Scheduled') : ago(x.createdAt)}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn small outline"
                    onClick={() => {
                      update((d) => {
                        const y = d.alerts.find((z) => z.id === x.id);
                        if (y) y.status = 'resolved';
                      });
                      toast(tr('সতর্কতা শেষ হিসেবে চিহ্নিত', 'Alert marked as cleared'));
                    }}
                  >
                    {tr('শেষ', 'Clear')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="stack-lg">
          <section className="card stack" aria-labelledby="pub-notice">
            <h2 id="pub-notice" className="row" style={{ fontSize: '1.05rem', gap: 8 }}>
              <Megaphone size={20} aria-hidden="true" /> {tr('ঘোষণা প্রকাশ', 'Publish an announcement')}
            </h2>
            <Field label={tr('ধরন', 'Type')} htmlFor="nt-cat">
              <select id="nt-cat" className="select" value={nn.category} onChange={(e) => setNn({ ...nn, category: e.target.value as Announcement['category'] })}>
                <option value="notice">{tr('নোটিশ', 'Notice')}</option>
                <option value="circular">{tr('পরিপত্র', 'Circular')}</option>
                <option value="news">{tr('খবর', 'News')}</option>
              </select>
            </Field>
            <Field label={tr('শিরোনাম (বাংলা)', 'Title (Bangla)')} error={errs.nTitleBn} htmlFor="nt-tbn">
              <input id="nt-tbn" className="input" lang="bn" maxLength={100} value={nn.titleBn} onChange={(e) => setNn({ ...nn, titleBn: e.target.value })} />
            </Field>
            <Field label={tr('শিরোনাম (ইংরেজি, ঐচ্ছিক)', 'Title (English, optional)')} htmlFor="nt-ten">
              <input id="nt-ten" className="input" lang="en" maxLength={100} value={nn.titleEn} onChange={(e) => setNn({ ...nn, titleEn: e.target.value })} />
            </Field>
            <Field label={tr('লেখা (বাংলা)', 'Text (Bangla)')} error={errs.nBodyBn} htmlFor="nt-bbn">
              <textarea id="nt-bbn" className="textarea" lang="bn" rows={4} maxLength={1000} value={nn.bodyBn} onChange={(e) => setNn({ ...nn, bodyBn: e.target.value })} />
            </Field>
            <Field label={tr('লেখা (ইংরেজি, ঐচ্ছিক)', 'Text (English, optional)')} htmlFor="nt-ben">
              <textarea id="nt-ben" className="textarea" lang="en" rows={4} maxLength={1000} value={nn.bodyEn} onChange={(e) => setNn({ ...nn, bodyEn: e.target.value })} />
            </Field>
            {failed === 'notice' && <ErrorBanner onRetry={() => void publishNotice()} />}
            <SubmitButton busy={busy === 'notice'} onClick={() => void publishNotice()}>
              <Send size={18} aria-hidden="true" /> {tr('প্রকাশ করুন', 'Publish')}
            </SubmitButton>
          </section>
          <section className="stack">
            <h2 className="section-title">{tr('প্রকাশিত ঘোষণা', 'Published announcements')}</h2>
            <div className="list">
              {state.announcements.map((x) => (
                <div key={x.id} className="list-row" style={{ cursor: 'default' }}>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block' }}>
                      {tx(x.title)}
                    </span>
                    <span className="lr-sub">{ago(x.publishedAt)}</span>
                  </span>
                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={() => {
                      update((d) => {
                        d.announcements = d.announcements.filter((z) => z.id !== x.id);
                      });
                      toast(tr('ঘোষণা সরানো হয়েছে', 'Announcement unpublished'), 'info');
                    }}
                  >
                    {tr('সরান', 'Unpublish')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ---------------- SOS desk ---------------- */

export function SosDesk() {
  const { state, update, notify, toast } = useApp();
  const { tr, tx, ago, n } = useI18n();
  const active = state.sosEvents.filter((s) => s.status === 'active');
  const closed = state.sosEvents.filter((s) => s.status === 'closed');
  const markers: MapMarker[] = [
    ...active.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, kind: 'sos' as const, color: '#d0102b', title: 'SOS' })),
    ...state.officers.filter((o) => o.onDuty).map((o) => ({ id: o.id, lat: o.lat, lng: o.lng, kind: 'officer' as const, color: '#027068', title: tx(o.name) })),
  ];
  return (
    <>
      <PageHeader title={tr('SOS ডেস্ক', 'SOS desk')} back={false} />
      <div className="content cols" style={{ maxWidth: 1280 }}>
        <div className="stack">
          <Banner tone="warn">{tr('ডেমো: SOS শুধু এই প্রোটোটাইপের ভেতরে আসে; কোনো আসল জরুরি সেবা যুক্ত নয়। আসল জরুরি অবস্থায় ৯৯৯।', 'Demo: SOS only arrives inside this prototype; no real emergency service is connected. In a real emergency, call 999.')}</Banner>
          {active.length === 0 ? (
            <Empty icon={<Siren size={28} />} title={tr('কোনো সক্রিয় SOS নেই', 'No active SOS')} body={tr('নাগরিক অ্যাপের SOS বোতাম দিয়ে একটি ডেমো SOS পাঠিয়ে দেখুন।', 'Send a demo SOS with the SOS button in the citizen app.')} />
          ) : (
            active.map((s) => {
              const near = nearestOfficers(state.officers, s).slice(0, 3);
              const resp = state.officers.find((o) => o.id === s.assignedOfficerId);
              return (
                <section key={s.id} className="card stack" style={{ borderColor: '#f3a6b0' }}>
                  <div className="row between wrap">
                    <span className="strong" style={{ color: 'var(--sos)' }}>
                      SOS · {tx(SOS_TYPES.find((t) => t.id === s.type)?.label)}
                    </span>
                    <span className="small muted">{ago(s.at)}</span>
                  </div>
                  <span className="small">
                    {tx(THANAS.find((t) => t.id === s.thanaId)?.name)} · {s.sharing ? tr('লাইভ অবস্থান চালু', 'live location on') : tr('লাইভ অবস্থান বন্ধ', 'live location off')}
                  </span>
                  <span className="small">{resp ? tr(`সাড়া দিচ্ছেন: ${tx(resp.name)}`, `Responding: ${tx(resp.name)}`) : tr('এখনো কেউ নিযুক্ত নয়', 'Nobody assigned yet')}</span>
                  <div className="stack" style={{ gap: 6 }}>
                    {near.map((o) => (
                      <div key={o.id} className="row card flat" style={{ padding: 8 }}>
                        <span className="grow small">
                          {tx(o.name)} · {tr(`${n(o.km.toFixed(1))} কিমি`, `${o.km.toFixed(1)} km`)}
                        </span>
                        <button
                          type="button"
                          className="btn small outline"
                          disabled={o.id === s.assignedOfficerId}
                          onClick={() => {
                            update((d) => {
                              const x = d.sosEvents.find((y) => y.id === s.id);
                              if (x) x.assignedOfficerId = o.id;
                              notify(d, { category: 'system', title: { bn: 'অফিসার নিযুক্ত (ডেমো SOS)', en: 'Officer assigned (demo SOS)' }, body: o.name, link: '/sos' });
                            });
                            toast(tr('অফিসার নিযুক্ত হয়েছে', 'Officer assigned'));
                          }}
                        >
                          {tr('পাঠান', 'Dispatch')}
                        </button>
                      </div>
                    ))}
                  </div>
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
                      });
                      toast(tr('SOS বন্ধ হয়েছে', 'SOS closed'));
                    }}
                  >
                    <CheckCircle2 size={18} aria-hidden="true" /> {tr('বন্ধ করুন', 'Close')}
                  </button>
                </section>
              );
            })
          )}
          {closed.length > 0 && (
            <section className="stack">
              <h2 className="section-title">{tr('বন্ধ SOS', 'Closed SOS')}</h2>
              <div className="list">
                {closed.map((s) => (
                  <div key={s.id} className="list-row" style={{ cursor: 'default' }}>
                    <span className="grow small">
                      {tx(SOS_TYPES.find((t) => t.id === s.type)?.label)} · {tx(THANAS.find((t) => t.id === s.thanaId)?.name)} · {ago(s.at)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <MapView center={active[0] ?? { lat: 23.7808, lng: 90.4 }} zoom={12} markers={markers} label={tr('SOS ও অফিসার', 'SOS and officers')} height={420} />
      </div>
    </>
  );
}
