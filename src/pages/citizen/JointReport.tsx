import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Send, Siren, TriangleAlert, UserPlus, Users } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, ErrorBanner, Field, PageHeader, SubmitButton, Tabs } from '../../components/ui';
import { PhotoPicker } from '../../components/PhotoPicker';
import { QrCode } from '../../components/QrCode';
import { usePosition } from './Thana';
import type { EvidencePhoto } from '../../data/types';
import { signToken } from '../../services/crypto';
import { nextNumber, simulate, SimulatedNetworkError } from '../../services/api';
import { nearestThanas } from '../../services/geo';

interface Party {
  name: string;
  license: string;
  vehicle: string;
  mobile: string;
}

const SAMPLE_PARTY: Party = { name: 'Sabrina Haque', license: 'DK0000000000 (demo)', vehicle: 'Dhaka Metro-Ga 33-1020', mobile: '01800000000' };

/** Minor-crash joint report (proposal p.34): both drivers in one report, sent as a draft to DMP's accident records. */
export default function JointReport() {
  const { state, update, notify } = useApp();
  const { tr } = useI18n();
  const nav = useNavigate();
  const { pos, rationale } = usePosition();
  const [tab, setTab] = useState<'type' | 'parties' | 'photos'>('type');
  const [injured, setInjured] = useState<boolean | null>(null);
  const [token, setToken] = useState('');
  const [other, setOther] = useState<Party>({ name: '', license: '', vehicle: '', mobile: '' });
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const me = state.profile;
  const myVehicle = state.vehicles.find((v) => me.vehicleIds.includes(v.id));

  useEffect(() => {
    void signToken({ t: 'joint', exp: Date.now() + 10 * 60_000, from: state.session.loggedIn ? me.name : 'guest', at: Date.now() }).then(setToken);
  }, [state.session.loggedIn, me.name]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (injured !== false) e.type = tr('কেউ আহত না হলেই যৌথ রিপোর্ট করা যায়', 'A joint report is only for crashes where nobody is hurt');
    if (other.name.trim().length < 2) e.name = tr('অন্য চালকের নাম দিন', 'Enter the other driver’s name');
    if (other.vehicle.trim().length < 4) e.vehicle = tr('অন্য গাড়ির নম্বর দিন', 'Enter the other vehicle’s number');
    if (other.mobile && !/^01\d{9}$/.test(other.mobile.replace(/[^0-9]/g, ''))) e.mobile = tr('১১ সংখ্যার মোবাইল নম্বর দিন', 'Enter an 11-digit mobile number');
    if (photos.length < 1) e.photos = tr('অন্তত একটি ছবি দিন (ঘটনাস্থল বা ক্ষতি)', 'Add at least one photo (scene or damage)');
    setErrors(e);
    if (e.type) setTab('type');
    else if (e.name || e.vehicle || e.mobile) setTab('parties');
    else if (e.photos) setTab('photos');
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure });
      const p = pos ?? { lat: 23.7383, lng: 90.4006 };
      const ref = nextNumber(state.reports.map((r) => r.ref), `RPT-${new Date().getFullYear()}-`);
      const id = `R${ref.slice(-6).replace(/^0+/, '')}`;
      const now = new Date().toISOString();
      update((d) => {
        d.reports.unshift({
          id,
          ref,
          kind: 'joint_accident',
          mine: true,
          category: 'accident',
          description: note.trim() || tr('ছোট দুর্ঘটনা, কেউ আহত নয়, শুধু গাড়ির ক্ষতি।', 'Minor crash, nobody hurt, vehicle damage only.'),
          vehicleNo: myVehicle ? myVehicle.regNo.en : undefined,
          lat: p.lat,
          lng: p.lng,
          locationLabel: p === pos && pos?.source === 'device' ? { bn: 'আপনার অবস্থান (GPS)', en: 'Your location (GPS)' } : { bn: 'ডেমো অবস্থান: রমনা', en: 'Demo position: Ramna' },
          thanaId: nearestThanas(p, 1)[0].id,
          createdAt: now,
          anonymous: false,
          hideIdentity: true,
          reporterName: state.session.loggedIn ? me.name : undefined,
          photos,
          status: 'received',
          timeline: [{ status: 'received', at: now, note: { bn: 'যৌথ রিপোর্ট: দুই পক্ষের তথ্য ও ছবিসহ। DARC-এ খসড়া হিসেবে যাবে।', en: 'Joint report with both parties and photos. Goes to DARC as a draft.' } }],
          meta: { otherName: other.name.trim(), otherLicense: other.license.trim(), otherVehicle: other.vehicle.trim(), otherMobile: other.mobile.trim() },
        });
        notify(d, { category: 'reports', title: { bn: `যৌথ রিপোর্ট জমা: ${ref}`, en: `Joint report received: ${ref}` }, body: { bn: 'অফিসার যাচাই করে চূড়ান্ত করবেন', en: 'An officer will verify and finalise it' }, link: `/reports/${id}` });
      });
      nav(`/reports/${id}?new=1`, { replace: true });
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={tr('ছোট দুর্ঘটনা: যৌথ রিপোর্ট', 'Minor crash: joint report')} />
      <div className="content stack-lg" style={{ maxWidth: 720 }}>
        <Tabs
          label={tr('ধাপ', 'Steps')}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'type', label: tr('১ · ধরন', '1 · Type') },
            { id: 'parties', label: tr('২ · দুই পক্ষ', '2 · Parties') },
            { id: 'photos', label: tr('৩ · ছবি', '3 · Photos') },
          ]}
        />
        <div className="card danger row">
          <Siren size={22} color="var(--sos)" aria-hidden="true" />
          <span className="grow small strong">{tr('কেউ আহত? এই ফর্ম নয়, এখনই জরুরি সাহায্য নিন।', 'Anyone hurt? Not this form: get emergency help now.')}</span>
          <Link to="/sos" className="btn small danger">
            SOS
          </Link>
        </div>

        {tab === 'type' && (
          <section className="stack">
            <div>
              <span className="tag-heading">{tr('দুর্ঘটনার ধরন', 'Type of crash')}</span>
              <div className="tag-rule" />
            </div>
            <div className="grid-2" role="radiogroup" aria-label={tr('দুর্ঘটনার ধরন', 'Type of crash')}>
              <button type="button" role="radio" aria-checked={injured === false} className="card" style={{ textAlign: 'left', cursor: 'pointer', borderColor: injured === false ? 'var(--brand-700)' : undefined, borderWidth: 2 }} onClick={() => setInjured(false)}>
                <Car size={26} aria-hidden="true" />
                <div className="strong">{tr('ছোট দুর্ঘটনা', 'Minor crash')}</div>
                <div className="small muted">{tr('কেউ আহত নয়, শুধু গাড়ির ক্ষতি', 'Nobody hurt, vehicle damage only')}</div>
              </button>
              <button type="button" role="radio" aria-checked={injured === true} className="card" style={{ textAlign: 'left', cursor: 'pointer', borderColor: injured === true ? 'var(--sos)' : undefined, borderWidth: 2 }} onClick={() => setInjured(true)}>
                <TriangleAlert size={26} color="var(--sos)" aria-hidden="true" />
                <div className="strong">{tr('আহতসহ দুর্ঘটনা', 'Crash with injuries')}</div>
                <div className="small muted">{tr('৯৯৯ ও নিকটস্থ ইউনিট', '999 and the nearest unit')}</div>
              </button>
            </div>
            {injured === true && (
              <Banner tone="danger">
                {tr('আহত থাকলে যৌথ রিপোর্ট নয়। SOS চাপুন বা ৯৯৯-এ কল করুন।', 'With injuries, do not file a joint report. Press SOS or call 999.')} <Link to="/sos">SOS</Link>
              </Banner>
            )}
            {errors.type && (
              <p className="danger-text small strong" role="alert">
                {errors.type}
              </p>
            )}
            <button type="button" className="btn primary" disabled={injured !== false} onClick={() => setTab('parties')}>
              {tr('পরবর্তী', 'Next')}
            </button>
          </section>
        )}

        {tab === 'parties' && (
          <section className="stack">
            <div>
              <span className="tag-heading">{tr('দ্বিতীয় পক্ষ যুক্ত করুন', 'Add the second party')}</span>
              <div className="tag-rule" />
            </div>
            <div className="card row" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 120, flexShrink: 0 }}>{token && <QrCode value={token} label={tr('যৌথ রিপোর্টের QR', 'Joint report QR')} size={160} />}</div>
              <div className="small">
                <strong>{tr('অন্য চালক এই QR স্ক্যান করবেন', 'The other driver scans this QR')}</strong>
                <p>{tr('দুজনের লাইসেন্স ও গাড়ির তথ্য একটি রিপোর্টে যুক্ত হবে; আলাদা ফর্ম লাগবে না। QR ১০ মিনিট বৈধ ও স্বাক্ষরিত।', 'Both licences and vehicles go into one report; no separate form. The QR is signed and valid for 10 minutes.')}</p>
                <p className="muted">{tr('প্রোটোটাইপে দ্বিতীয় ফোন নেই, তাই নিচে হাতে তথ্য লিখুন।', 'There is no second phone in the prototype, so enter the details below by hand.')}</p>
              </div>
            </div>
            <div className="card flat stack">
              <div className="row between">
                <strong>
                  <Users size={16} style={{ display: 'inline', verticalAlign: '-3px' }} aria-hidden="true" /> {tr('আপনি', 'You')}
                </strong>
                <span className="small muted">
                  {state.session.loggedIn ? me.name : tr('অতিথি', 'Guest')}
                  {myVehicle ? ` · ${myVehicle.regNo.en}` : ''}
                </span>
              </div>
            </div>
            <Field label={tr('অন্য চালকের নাম', 'Other driver’s name')} htmlFor="on" error={errors.name}>
              <input id="on" className="input" value={other.name} aria-invalid={!!errors.name} onChange={(e) => setOther({ ...other, name: e.target.value })} />
            </Field>
            <Field label={tr('গাড়ির নম্বর', 'Vehicle number')} htmlFor="ov" error={errors.vehicle}>
              <input id="ov" className="input" value={other.vehicle} aria-invalid={!!errors.vehicle} onChange={(e) => setOther({ ...other, vehicle: e.target.value })} />
            </Field>
            <div className="grid-2">
              <Field label={tr('লাইসেন্স নম্বর', 'Licence number')} htmlFor="ol">
                <input id="ol" className="input" value={other.license} onChange={(e) => setOther({ ...other, license: e.target.value })} />
              </Field>
              <Field label={tr('মোবাইল', 'Mobile')} htmlFor="om" error={errors.mobile}>
                <input id="om" className="input" inputMode="tel" value={other.mobile} aria-invalid={!!errors.mobile} onChange={(e) => setOther({ ...other, mobile: e.target.value })} />
              </Field>
            </div>
            <button type="button" className="linklike small" style={{ alignSelf: 'flex-start' }} onClick={() => setOther(SAMPLE_PARTY)}>
              <UserPlus size={14} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden="true" /> {tr('নমুনা চালকের তথ্য বসান (ডেমো)', 'Fill in a sample driver (demo)')}
            </button>
            <button type="button" className="btn primary" onClick={() => setTab('photos')}>
              {tr('পরবর্তী', 'Next')}
            </button>
          </section>
        )}

        {tab === 'photos' && (
          <section className="stack">
            <div>
              <span className="tag-heading">{tr('ঘটনাস্থল ও ক্ষতির ছবি', 'Scene and damage photos')}</span>
              <div className="tag-rule" />
            </div>
            <PhotoPicker photos={photos} onChange={setPhotos} max={4} />
            {errors.photos && (
              <p className="danger-text small strong" role="alert">
                {errors.photos}
              </p>
            )}
            <Field label={tr('সংক্ষেপে কী ঘটেছে (ঐচ্ছিক)', 'What happened, briefly (optional)')} htmlFor="jn">
              <textarea id="jn" className="textarea" style={{ minHeight: 80 }} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Banner>{tr('রিপোর্টটি DMP-JICA-র DARC দুর্ঘটনা ডেটাবেসে খসড়া হিসেবে যাবে; অফিসার যাচাই করে চূড়ান্ত করবেন। বিমা দাবির জন্য রিপোর্টের কপি পাবেন।', 'The report goes to the DMP-JICA DARC crash database as a draft; an officer verifies and finalises it. You get a copy for insurance claims.')}</Banner>
            {failed && <ErrorBanner onRetry={submit} />}
            <SubmitButton busy={busy} onClick={submit}>
              <Send size={18} aria-hidden="true" />
              {tr('যৌথ রিপোর্ট জমা দিন', 'Submit joint report')}
            </SubmitButton>
          </section>
        )}
      </div>
      {rationale}
    </>
  );
}
