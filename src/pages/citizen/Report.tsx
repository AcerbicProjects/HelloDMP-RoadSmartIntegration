import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, EyeOff, FileWarning, Info, MapPin, Send, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, ErrorBanner, Field, PageHeader, Stepper, SubmitButton } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { PhotoPicker } from '../../components/PhotoPicker';
import { usePosition } from './Thana';
import { COMPLAINT_CATEGORIES, REPORT_CATEGORIES, RICKSHAW_ISSUES } from '../../data/catalog';
import { AREAS } from '../../data/seed';
import type { AppState, CitizenReport, EvidencePhoto, L, ReportKind } from '../../data/types';
import { nextNumber, simulate, SimulatedNetworkError } from '../../services/api';
import { findDuplicate } from '../../services/reports';
import { nearestThanas } from '../../services/geo';
import { useOnline } from '../../components/AppShell';

export const CYBER_CATEGORIES: { id: string; label: L; icon: string }[] = [
  { id: 'online_fraud', label: { bn: 'অনলাইন প্রতারণা / টাকা হারানো', en: 'Online fraud or lost money' }, icon: 'Zap' },
  { id: 'hacked', label: { bn: 'অ্যাকাউন্ট হ্যাক', en: 'Hacked account' }, icon: 'Ban' },
  { id: 'harassment_online', label: { bn: 'অনলাইনে হয়রানি / ব্ল্যাকমেইল', en: 'Online harassment or blackmail' }, icon: 'TriangleAlert' },
  { id: 'fake_sms', label: { bn: 'ভুয়া SMS বা কল', en: 'Fake SMS or call' }, icon: 'FileText' },
  { id: 'other', label: { bn: 'অন্যান্য', en: 'Other' }, icon: 'Flag' },
];

export const WOMEN_CATEGORIES: { id: string; label: L; icon: string }[] = [
  { id: 'domestic_violence', label: { bn: 'পারিবারিক সহিংসতা', en: 'Domestic violence' }, icon: 'TriangleAlert' },
  { id: 'harassment', label: { bn: 'যৌন হয়রানি / উত্ত্যক্ত', en: 'Sexual harassment or stalking' }, icon: 'Ban' },
  { id: 'child_abuse', label: { bn: 'শিশু নির্যাতন', en: 'Child abuse' }, icon: 'Users' },
  { id: 'domestic_worker', label: { bn: 'গৃহকর্মী নির্যাতন', en: 'Abuse of a domestic worker' }, icon: 'HandHelping' },
  { id: 'other', label: { bn: 'অন্যান্য', en: 'Other' }, icon: 'Flag' },
];

const KIND_META: Record<'incident' | 'complaint' | 'cyber' | 'women_child', { title: L; categories: { id: string; label: L; icon?: string }[] }> = {
  incident: { title: { bn: 'রিপোর্ট করুন', en: 'Report' }, categories: REPORT_CATEGORIES },
  complaint: { title: { bn: 'অভিযোগ জানান', en: 'Make a complaint' }, categories: COMPLAINT_CATEGORIES },
  cyber: { title: { bn: 'সাইবার অপরাধের অভিযোগ', en: 'Report cyber crime' }, categories: CYBER_CATEGORIES },
  women_child: { title: { bn: 'গোপন অভিযোগ', en: 'Private report' }, categories: WOMEN_CATEGORIES },
};

export function categoryLabel(kind: ReportKind, id: string): L {
  const all = [...REPORT_CATEGORIES, ...COMPLAINT_CATEGORIES, ...CYBER_CATEGORIES, ...WOMEN_CATEGORIES, ...RICKSHAW_ISSUES];
  const scoped = kind === 'complaint' ? COMPLAINT_CATEGORIES : kind === 'cyber' ? CYBER_CATEGORIES : kind === 'women_child' ? WOMEN_CATEGORIES : kind === 'rickshaw' ? RICKSHAW_ISSUES : REPORT_CATEGORIES;
  return scoped.find((c) => c.id === id)?.label ?? all.find((c) => c.id === id)?.label ?? { bn: id, en: id };
}

interface Draft {
  kind: 'incident' | 'complaint' | 'cyber' | 'women_child';
  step: number;
  category: string;
  photos: EvidencePhoto[];
  description: string;
  vehicleNo: string;
  areaId: string; // '' = use GPS position
  hideIdentity: boolean;
  anonymous: boolean;
  contact: string;
}

/** Creates the report record; shared with the queued-report retry in My reports. */
export function buildReport(state: AppState, d: Draft, pos: { lat: number; lng: number }, label: L, status: 'received' | 'queued'): CitizenReport {
  const year = new Date().getFullYear();
  const ref = nextNumber(state.reports.map((r) => r.ref), `RPT-${year}-`);
  const thana = nearestThanas(pos, 1)[0];
  const now = new Date().toISOString();
  return {
    id: `R${ref.slice(-6).replace(/^0+/, '')}`,
    ref,
    kind: d.kind,
    mine: true,
    category: d.category,
    description: d.description.trim(),
    vehicleNo: d.vehicleNo.trim() || undefined,
    lat: pos.lat,
    lng: pos.lng,
    locationLabel: label,
    thanaId: thana.id,
    createdAt: now,
    anonymous: d.anonymous || !state.session.loggedIn,
    hideIdentity: d.hideIdentity,
    reporterName: d.anonymous || !state.session.loggedIn ? undefined : state.profile.name,
    reporterMobile: d.anonymous || !state.session.loggedIn ? undefined : state.profile.mobile,
    photos: d.photos,
    status,
    timeline:
      status === 'queued'
        ? [{ status: 'queued', at: now, note: { bn: 'সংযোগ না থাকায় এই ডিভাইসে রাখা হয়েছে; এখনো পাঠানো হয়নি', en: 'Kept on this device because there was no connection; not sent yet' } }]
        : [{ status: 'received', at: now, note: { bn: `${d.photos.length ? 'ছবি ও ' : ''}GPS সহ জমা হয়েছে`, en: `Submitted${d.photos.length ? ' with photos and' : ' with'} GPS` } }],
    meta: d.contact ? { contact: d.contact } : undefined,
  };
}

const EMPTY = (kind: Draft['kind'], category = ''): Draft => ({
  kind,
  step: category ? 2 : 1,
  category,
  photos: [],
  description: '',
  vehicleNo: '',
  areaId: '',
  hideIdentity: true,
  anonymous: false,
  contact: '',
});

export default function ReportPage() {
  const [params] = useSearchParams();
  const kindParam = (params.get('kind') as Draft['kind']) || 'incident';
  const kind: Draft['kind'] = kindParam in KIND_META ? kindParam : 'incident';
  const { state, update, notify } = useApp();
  const { tr, tx, time, ago } = useI18n();
  const nav = useNavigate();
  const online = useOnline();
  const { pos, rationale } = usePosition();

  const saved = state.reportDraft as (Partial<Draft> & { step?: number }) | undefined;
  const [d, setD] = useState<Draft>(() => EMPTY(kind, params.get('category') ?? ''));
  const [resumeOffer, setResumeOffer] = useState(!!saved && saved.kind === kind && !params.get('category'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dupChoice, setDupChoice] = useState<'join' | 'separate' | null>(null);

  // Keep the draft on the device so nothing is lost if the user leaves (SG-044).
  useEffect(() => {
    if (resumeOffer) return;
    const dirty = d.category || d.description || d.photos.length;
    update((s) => {
      s.reportDraft = dirty ? ({ ...d } as unknown as AppState['reportDraft']) : undefined;
    });
  }, [d, resumeOffer, update]);

  const meta = KIND_META[kind];
  const isTraffic = kind === 'incident';
  const area = AREAS.find((a) => a.id === d.areaId);
  const place = area ? { lat: area.lat, lng: area.lng } : pos ?? { lat: 23.7383, lng: 90.4006 };
  const placeLabel: L = area ? area.name : pos?.source === 'device' ? { bn: 'আপনার বর্তমান অবস্থান (GPS)', en: 'Your current location (GPS)' } : { bn: 'ডেমো অবস্থান: রমনা', en: 'Demo position: Ramna' };
  const duplicate = useMemo(() => (isTraffic && d.category ? findDuplicate(state.reports, d.category, place.lat, place.lng) : undefined), [isTraffic, d.category, state.reports, place.lat, place.lng]);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const totalSteps = 4;

  const validate = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 1 && !d.category) e.category = tr('একটি ধরন বেছে নিন', 'Choose a type');
    if (step === 2 && d.photos.some((p) => p.trust === 'rejected')) e.photos = tr('গ্রহণযোগ্য নয় এমন ছবি সরিয়ে দিন', 'Remove the photo that is not acceptable');
    if (step === 3) {
      if (d.description.trim().length < 10) e.description = tr('অন্তত ১০ অক্ষরে কী ঘটেছে লিখুন', 'Describe what happened in at least 10 characters');
      if (d.contact && !/^01\d{9}$/.test(d.contact.replace(/[^0-9]/g, ''))) e.contact = tr('১১ সংখ্যার মোবাইল নম্বর দিন (০১…)', 'Enter an 11-digit mobile number (01…)');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validate(d.step) && set({ step: Math.min(totalSteps, d.step + 1) });

  const submit = async () => {
    if (!validate(3)) return set({ step: 3 });
    setBusy(true);
    setFailed(false);
    const offline = !online;
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure || offline });
      const r = buildReport(state, d, place, placeLabel, 'received');
      if (duplicate && dupChoice !== 'separate') {
        r.duplicateOf = duplicate.id;
        r.status = duplicate.status;
        if (duplicate.status !== 'received')
          r.timeline.push({ status: duplicate.status, at: new Date().toISOString(), note: { bn: `একই ঘটনার আগের রিপোর্ট ${duplicate.ref}-এর সঙ্গে যুক্ত`, en: `Linked to the earlier report ${duplicate.ref} about the same incident` } });
        if (duplicate.assignedOfficerId) r.assignedOfficerId = duplicate.assignedOfficerId;
      }
      update((s) => {
        s.reports.unshift(r);
        s.reportDraft = undefined;
        notify(s, { category: 'reports', title: { bn: `রিপোর্ট জমা হয়েছে: ${r.ref}`, en: `Report received: ${r.ref}` }, body: categoryLabel(r.kind, r.category), link: `/reports/${r.id}` });
      });
      nav(`/reports/${r.id}?new=1`, { replace: true });
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const saveQueued = () => {
    const r = buildReport(state, d, place, placeLabel, 'queued');
    update((s) => {
      s.reports.unshift(r);
      s.reportDraft = undefined;
    });
    nav(`/reports/${r.id}`, { replace: true });
  };

  if (resumeOffer && saved) {
    return (
      <>
        <PageHeader title={tx(meta.title)} />
        <div className="content stack">
          <Banner tone="brand">{tr('আগের একটি অসম্পূর্ণ খসড়া এই ডিভাইসে আছে।', 'There is an unfinished draft on this device.')}</Banner>
          <div className="btn-row">
            <button
              type="button"
              className="btn outline"
              onClick={() => {
                update((s) => {
                  s.reportDraft = undefined;
                });
                setResumeOffer(false);
              }}
            >
              {tr('নতুন করে শুরু', 'Start over')}
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setD({ ...EMPTY(kind), ...(saved as Partial<Draft>), kind });
                setResumeOffer(false);
              }}
            >
              {tr('খসড়া চালিয়ে যান', 'Continue draft')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={tx(meta.title)} />
      <div className="content" style={{ maxWidth: 720 }}>
        <div className="stack-lg">
          <Stepper total={totalSteps} current={d.step} label={tr(`ধাপ ${d.step} / ${totalSteps}`, `Step ${d.step} of ${totalSteps}`)} />

          {kind === 'women_child' && (
            <Banner tone="brand" icon={<ShieldCheck size={18} aria-hidden="true" />}>
              {tr('এই অভিযোগ গোপন থাকবে। এখনই বিপদে থাকলে ফর্ম নয়, SOS বা ৯৯৯ ব্যবহার করুন।', 'This report stays confidential. If you are in danger now, use SOS or 999 instead of this form.')}{' '}
              <Link to="/sos">SOS</Link>
            </Banner>
          )}

          {d.step === 1 && (
            <section className="stack">
              <div>
                <span className="tag-heading">{tr('কী দেখেছেন?', 'What did you see?')}</span>
                <div className="tag-rule" />
              </div>
              <div className="choice-grid" role="radiogroup" aria-label={tr('ধরন', 'Type')}>
                {meta.categories.map((c) => (
                  <button key={c.id} type="button" role="radio" aria-checked={d.category === c.id} className="choice" onClick={() => set({ category: c.id })}>
                    {c.icon && <Icon name={c.icon} size={18} />}
                    {tx(c.label)}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="danger-text small strong" role="alert">
                  {errors.category}
                </p>
              )}
              {kind === 'cyber' && d.category === 'fake_sms' && (
                <Banner>
                  {tr('বার্তাটি আগে ', 'You can first check the message with the ')}
                  <Link to="/sms-check">{tr('SMS যাচাই', 'SMS checker')}</Link>
                  {tr(' দিয়ে দেখতে পারেন।', '.')}
                </Banner>
              )}
            </section>
          )}

          {d.step === 2 && (
            <section className="stack">
              <div>
                <span className="tag-heading">{kind === 'cyber' ? tr('স্ক্রিনশট / প্রমাণ', 'Screenshots / evidence') : tr('ছবি ও স্থান', 'Photo and place')}</span>
                <div className="tag-rule" />
              </div>
              <PhotoPicker photos={d.photos} onChange={(photos) => set({ photos })} allowSample={isTraffic} />
              {errors.photos && (
                <p className="danger-text small strong" role="alert">
                  {errors.photos}
                </p>
              )}
              {kind !== 'cyber' && (
                <div className="stack" style={{ gap: 8 }}>
                  <div className="chips">
                    <span className="badge brand">
                      <MapPin size={12} aria-hidden="true" /> {tx(placeLabel)}
                    </span>
                    <span className="badge brand">
                      <Clock size={12} aria-hidden="true" /> {tr('এখন', 'Now')}, {time(new Date().toISOString())}
                    </span>
                  </div>
                  <Field label={tr('স্থান ঠিক নেই? এলাকা বেছে নিন', 'Wrong place? Choose the area')} htmlFor="area">
                    <select id="area" className="select" value={d.areaId} onChange={(e) => set({ areaId: e.target.value })}>
                      <option value="">{tr('GPS অবস্থান ব্যবহার করুন', 'Use GPS position')}</option>
                      {AREAS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {tx(a.name)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
              {d.photos.length === 0 && <p className="small muted">{tr('ছবি ঐচ্ছিক, তবে ছবি থাকলে দ্রুত যাচাই হয়।', 'Photos are optional, but they speed up verification.')}</p>}
            </section>
          )}

          {d.step === 3 && (
            <section className="stack">
              <div>
                <span className="tag-heading">{tr('বিস্তারিত', 'Details')}</span>
                <div className="tag-rule" />
              </div>
              <Field label={tr('কী ঘটেছে?', 'What happened?')} htmlFor="desc" error={errors.description} hint={tr('সময়, স্থান ও যা দেখেছেন সংক্ষেপে লিখুন', 'Briefly say when, where and what you saw')}>
                <textarea id="desc" className="textarea" value={d.description} aria-invalid={!!errors.description} onChange={(e) => set({ description: e.target.value })} maxLength={600} />
              </Field>
              {isTraffic && (
                <Field label={tr('গাড়ির নম্বর (জানা থাকলে)', 'Vehicle number (if known)')} htmlFor="veh">
                  <input id="veh" className="input" value={d.vehicleNo} onChange={(e) => set({ vehicleNo: e.target.value })} placeholder={tr('ঢাকা মেট্রো-ঠ ১১-২২৩৩', 'Dhaka Metro-Tha 11-2233')} />
                </Field>
              )}
              {(kind === 'women_child' || kind === 'cyber') && (
                <Field label={tr('নিরাপদ যোগাযোগ নম্বর (ঐচ্ছিক)', 'Safe contact number (optional)')} htmlFor="contact" error={errors.contact} hint={tr('অফিসার শুধু এই নম্বরে যোগাযোগ করবেন', 'The officer will contact you only on this number')}>
                  <input id="contact" className="input" inputMode="tel" value={d.contact} aria-invalid={!!errors.contact} onChange={(e) => set({ contact: e.target.value })} placeholder="01XXXXXXXXX" />
                </Field>
              )}
              <div className="card flat stack" style={{ gap: 10 }}>
                {state.session.loggedIn ? (
                  <>
                    <label className="check">
                      <input type="checkbox" checked={d.hideIdentity} onChange={(e) => set({ hideIdentity: e.target.checked })} />
                      <span>
                        <span className="strong">{tr('আমার পরিচয় জনসমক্ষে গোপন রাখুন', 'Keep my identity hidden from the public')}</span>
                        <span className="small muted" style={{ display: 'block' }}>
                          {tr('শুধু যাচাইকারী অফিসার নাম দেখবেন', 'Only the verifying officer sees your name')}
                        </span>
                      </span>
                    </label>
                    {kind !== 'women_child' && (
                      <label className="check">
                        <input type="checkbox" checked={d.anonymous} onChange={(e) => set({ anonymous: e.target.checked })} />
                        <span>
                          <span className="strong">{tr('বেনামে পাঠান', 'Send anonymously')}</span>
                          <span className="small muted" style={{ display: 'block' }}>
                            {tr('অফিসারও নাম দেখবেন না; অবস্থা শুধু এই ডিভাইসে দেখা যাবে', 'Not even the officer sees your name; you can follow it only on this device')}
                          </span>
                        </span>
                      </label>
                    )}
                  </>
                ) : (
                  <div className="row small" style={{ alignItems: 'flex-start' }}>
                    <EyeOff size={18} aria-hidden="true" />
                    <span>
                      {tr('আপনি লগইন করেননি, তাই রিপোর্টটি বেনামে যাবে। রেফারেন্স নম্বর দিয়ে এই ডিভাইসে অবস্থা দেখতে পারবেন। ', 'You are not signed in, so this report will be anonymous. You can follow it on this device with its reference number. ')}
                      <Link to="/login">{tr('লগইন করুন', 'Sign in')}</Link>
                    </span>
                  </div>
                )}
              </div>
              <p className="small muted row" style={{ alignItems: 'flex-start' }}>
                <ShieldCheck size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                {tr('প্রতিটি রিপোর্ট অফিসার যাচাই করবেন; যাচাই ছাড়া কোনো মামলা হয় না।', 'Every report is checked by an officer; no case is made without verification.')}
              </p>
            </section>
          )}

          {d.step === 4 && (
            <section className="stack">
              <div>
                <span className="tag-heading">{tr('পাঠানোর আগে দেখুন', 'Check before sending')}</span>
                <div className="tag-rule" />
              </div>
              <div className="kv">
                <div>{tr('ধরন', 'Type')}</div>
                <div>{tx(categoryLabel(kind, d.category))}</div>
                <div>{tr('ছবি', 'Photos')}</div>
                <div>{d.photos.length}</div>
                <div>{tr('স্থান', 'Place')}</div>
                <div>{tx(placeLabel)}</div>
                {d.vehicleNo && (
                  <>
                    <div>{tr('গাড়ি', 'Vehicle')}</div>
                    <div>{d.vehicleNo}</div>
                  </>
                )}
                <div>{tr('পরিচয়', 'Identity')}</div>
                <div>{d.anonymous || !state.session.loggedIn ? tr('বেনামে', 'Anonymous') : d.hideIdentity ? tr('জনসমক্ষে গোপন', 'Hidden from public') : tr('দৃশ্যমান', 'Visible')}</div>
              </div>
              <p className="card flat small" style={{ whiteSpace: 'pre-line' }}>
                {d.description}
              </p>
              {duplicate && (
                <div className="card warn stack" style={{ gap: 10 }}>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <Users size={20} aria-hidden="true" />
                    <div>
                      <strong>{tr('কাছেই একই ধরনের রিপোর্ট আছে', 'A similar report exists nearby')}</strong>
                      <p className="small">
                        {tr(`${duplicate.ref} · ${ago(duplicate.createdAt)} · ৩০০ মিটারের মধ্যে। যুক্ত করলে আপনি একই অগ্রগতি দেখবেন এবং অফিসার একবারেই ব্যবস্থা নেবেন।`, `${duplicate.ref} · ${ago(duplicate.createdAt)} · within 300 m. If you join it you will see the same progress and the officer acts once.`)}
                      </p>
                    </div>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="chip" aria-pressed={dupChoice !== 'separate'} onClick={() => setDupChoice('join')}>
                      {tr('একই ঘটনায় যুক্ত করুন', 'Add to the same incident')}
                    </button>
                    <button type="button" className="chip" aria-pressed={dupChoice === 'separate'} onClick={() => setDupChoice('separate')}>
                      {tr('আলাদা ঘটনা', 'It is a different incident')}
                    </button>
                  </div>
                </div>
              )}
              <Banner icon={<Info size={18} aria-hidden="true" />}>
                {tr('পাঠানোর পর: ট্রাফিক কন্ট্রোল রুম যাচাই করবে → কাছের অফিসার নিযুক্ত হবেন → ঘটনাস্থলে ব্যবস্থা → নিষ্পত্তি। প্রতিটি ধাপ নোটিফিকেশনে জানাবে।', 'After sending: the control room verifies → the nearest officer is assigned → action on scene → resolved. Each step is notified.')}
              </Banner>
              {failed && (
                <div className="stack">
                  <ErrorBanner onRetry={submit} />
                  <button type="button" className="btn outline" onClick={saveQueued}>
                    {tr('ডিভাইসে রেখে দিন, পরে পাঠাব', 'Keep it on this device and send later')}
                  </button>
                </div>
              )}
              {!online && !failed && (
                <div className="stack">
                  <Banner tone="warn">{tr('আপনি অফলাইনে আছেন। পাঠানো যাবে না; ডিভাইসে রেখে পরে পাঠাতে পারবেন।', 'You are offline. It cannot be sent now; you can keep it on this device and send it later.')}</Banner>
                  <button type="button" className="btn outline" onClick={saveQueued}>
                    {tr('ডিভাইসে রেখে দিন, পরে পাঠাব', 'Keep it on this device and send later')}
                  </button>
                </div>
              )}
            </section>
          )}

          <div className="sticky-actions">
            <div className="btn-row">
              {d.step > 1 && (
                <button type="button" className="btn outline" onClick={() => set({ step: d.step - 1 })}>
                  {tr('পেছনে', 'Back')}
                </button>
              )}
              {d.step < totalSteps ? (
                <button type="button" className="btn primary" onClick={next}>
                  {tr('পরবর্তী', 'Next')}
                </button>
              ) : (
                <SubmitButton busy={busy} className="danger" onClick={submit}>
                  <Send size={18} aria-hidden="true" />
                  {tr('রিপোর্ট পাঠান', 'Send report')}
                </SubmitButton>
              )}
            </div>
          </div>
          <p className="tiny muted" style={{ textAlign: 'center' }}>
            <FileWarning size={12} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden="true" /> {tr('খসড়া স্বয়ংক্রিয়ভাবে এই ডিভাইসে সংরক্ষিত হচ্ছে', 'Your draft is saved on this device automatically')}
          </p>
        </div>
      </div>
      {rationale}
    </>
  );
}

/** Explanation shown right after submission (SG-015). */
export function SubmittedPanel({ r }: { r: CitizenReport }) {
  const { tr } = useI18n();
  const { toast } = useApp();
  return (
    <div className="card success stack" style={{ textAlign: 'center' }}>
      <CheckCircle2 size={44} style={{ margin: '0 auto', color: 'var(--success)' }} aria-hidden="true" />
      <h2>{r.duplicateOf ? tr('আগের রিপোর্টের সঙ্গে যুক্ত হয়েছে', 'Added to the earlier report') : tr('রিপোর্ট জমা হয়েছে', 'Report received')}</h2>
      <div className="row" style={{ justifyContent: 'center' }}>
        <code className="strong" style={{ fontSize: '1.1rem' }}>
          {r.ref}
        </code>
        <button
          type="button"
          className="icon-btn"
          aria-label={tr('রেফারেন্স কপি করুন', 'Copy reference')}
          onClick={() =>
            navigator.clipboard
              .writeText(r.ref)
              .then(() => toast(tr('কপি হয়েছে', 'Copied')))
              .catch(() => toast(tr('কপি করা যায়নি', 'Could not copy'), 'error'))
          }
        >
          <Copy size={18} />
        </button>
      </div>
      <p className="small">
        {tr(
          'এটি এই প্রোটোটাইপের ভেতরে জমা হয়েছে, কোনো আসল সার্ভারে নয়। পরের ধাপ (যাচাই, অফিসার নিযুক্ত) দেখতে উপরের ফিতা থেকে "কন্ট্রোল রুম" বা "অফিসার" ভিউ খুলুন।',
          'It was stored inside this prototype, not on a real server. To take the next steps (verify, assign an officer), open the "Control room" or "Officer" view from the ribbon at the top.',
        )}
      </p>
    </div>
  );
}
