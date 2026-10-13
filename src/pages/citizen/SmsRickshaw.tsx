import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, CircleCheck, CircleX, Clock, Flag, MapPin, Send, Share2, ShieldCheck, TriangleAlert, UserRound } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, ErrorBanner, Field, PageHeader, SubmitButton } from '../../components/ui';
import { PhotoPicker } from '../../components/PhotoPicker';
import { QrScanner } from '../../components/QrScanner';
import { usePosition } from './Thana';
import { CONTACTS } from '../../data/directory';
import { RICKSHAWS } from '../../data/seed';
import { RICKSHAW_ISSUES } from '../../data/catalog';
import type { EvidencePhoto } from '../../data/types';
import { checkSms, SAMPLE_FAKE_SMS, type SmsCheck } from '../../services/sms';
import { nextNumber, simulate, SimulatedNetworkError } from '../../services/api';
import { signToken, verifyToken } from '../../services/crypto';
import { nearestThanas } from '../../services/geo';
import { formatPhone, daysUntil } from '../../lib/format';

/** Fake fine-SMS checker (proposal p.32). Runs on the device; reporting is stored in the prototype only. */
export function SmsCheckPage() {
  const { state, update, toast } = useApp();
  const { tr, tx, lang } = useI18n();
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<SmsCheck | null>(null);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState('');

  const run = () => {
    if (body.trim().length < 5) return setError(tr('SMS-এর লেখা পেস্ট করুন', 'Paste the text of the SMS'));
    setError('');
    setReported(false);
    setResult(checkSms(sender, body));
  };
  const report = () => {
    update((d) => {
      d.fakeSms.unshift({ id: `FS${d.fakeSms.length + 1}`, sender: sender.trim(), text: body.trim(), verdict: result!.verdict, at: new Date().toISOString() });
    });
    setReported(true);
    toast(tr('ভুয়া SMS রিপোর্ট সংরক্ষিত (ডেমো)', 'Fake SMS report saved (demo)'));
  };

  const tone = result?.verdict === 'official' ? 'success' : result?.verdict === 'fake' ? 'danger' : 'warn';
  return (
    <>
      <PageHeader title={tr('SMS যাচাই', 'SMS check')} />
      <div className="content cols">
        <div className="stack">
          <p className="small">{tr('জরিমানার SMS পেলে লিংকে চাপ দেবেন না। এখানে পেস্ট করে যাচাই করুন।', 'If you get a fine SMS, do not tap its link. Paste it here to check.')}</p>
          <Field label={tr('প্রেরকের নম্বর', 'Sender number')} htmlFor="snd">
            <input id="snd" className="input" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label={tr('প্রাপ্ত SMS', 'Message received')} htmlFor="sms" error={error}>
            <textarea id="sms" className="textarea" value={body} aria-invalid={!!error} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <button
            type="button"
            className="linklike small"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              setSender(SAMPLE_FAKE_SMS.sender);
              setBody(SAMPLE_FAKE_SMS.body);
              setResult(null);
            }}
          >
            {tr('নমুনা ভুয়া SMS বসান', 'Insert a sample fake SMS')}
          </button>
          <button type="button" className="btn primary" onClick={run}>
            <ShieldCheck size={18} aria-hidden="true" /> {tr('যাচাই করুন', 'Check')}
          </button>
          {result && (
            <div className={`card ${tone} stack`} role="status">
              <div className="row">
                {result.verdict === 'official' ? <CircleCheck size={28} color="var(--success)" aria-hidden="true" /> : <TriangleAlert size={28} color={result.verdict === 'fake' ? 'var(--danger)' : 'var(--warning)'} aria-hidden="true" />}
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{result.verdict === 'official' ? tr('অফিসিয়াল নম্বর থেকে', 'From an official number') : result.verdict === 'fake' ? tr('ভুয়া বার্তা', 'Fake message') : tr('সন্দেহজনক', 'Suspicious')}</strong>
                  <div className="small">{result.verdict === 'fake' ? tr('এই SMS DMP থেকে আসেনি', 'This SMS did not come from DMP') : result.verdict === 'official' ? tr('তবু আসল মামলা অ্যাপের "মামলা" অংশেই মিলিয়ে দেখুন', 'Still, match the case in the app’s Cases section') : tr('আসল মামলা অ্যাপেই দেখুন', 'Check real cases in the app')}</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                {result.findings.map((f) => (
                  <li key={f.text.en} className="row small" style={{ gap: 6 }}>
                    {f.ok ? <CircleCheck size={16} color="var(--success)" aria-hidden="true" /> : <CircleX size={16} color="var(--danger)" aria-hidden="true" />}
                    {tx(f.text)}
                  </li>
                ))}
              </ul>
              {result.verdict !== 'official' &&
                (reported ? (
                  <Banner tone="success">{tr('রিপোর্ট এই প্রোটোটাইপে সংরক্ষিত হয়েছে। আসল অ্যাপে এটি DMP সাইবার ইউনিট ও মোবাইল অপারেটরের কাছে যাবে।', 'The report is stored in this prototype. In the real app it would go to the DMP cyber unit and the mobile operator.')}</Banner>
                ) : (
                  <button type="button" className="btn danger" onClick={report}>
                    <Flag size={18} aria-hidden="true" /> {tr('ভুয়া SMS রিপোর্ট করুন', 'Report fake SMS')}
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="stack">
          <div className="card stack">
            <strong>{tr('DMP-এর অফিসিয়াল SMS নম্বর', 'DMP’s official SMS numbers')}</strong>
            <div className="chips">
              {CONTACTS.officialSmsSenders.map((s) => (
                <span key={s} className="badge success">
                  <BadgeCheck size={12} aria-hidden="true" /> {formatPhone(s, lang)}
                </span>
              ))}
            </div>
            <p className="small muted">{tr('আসল মামলা সবসময় অ্যাপের "মামলা ও জরিমানা" অংশে থাকবে।', 'Real cases always appear in the app’s “Cases & fines” section.')}</p>
            <Link to="/cases" className="btn outline">
              {tr('আমার আসল মামলা দেখুন', 'See my real cases')}
            </Link>
          </div>
          <Banner tone="brand">{tr('নোটিশ শুধু অ্যাপের ভেতরে আসে। DMP-এর SMS-এ কখনো লিংক থাকে না, শুধু লেখা থাকে: "রোডস্মার্ট অ্যাপে মামলাটি দেখুন।"', 'Notices arrive only inside the app. DMP SMS never contain links; they only say: “See the case in the RoadSmart app.”')}</Banner>
          {state.fakeSms.length > 0 && <p className="small muted">{tr(`আপনি ${state.fakeSms.length}টি ভুয়া SMS রিপোর্ট করেছেন।`, `You have reported ${state.fakeSms.length} fake SMS.`)}</p>}
        </div>
      </div>
    </>
  );
}

/** e-Rickshaw QR scan (proposal p.38). QR codes carry a signed token with the registration number. */
export function RickshawScan() {
  const { tr } = useI18n();
  const nav = useNavigate();
  const [reg, setReg] = useState('');
  const [error, setError] = useState('');
  const handle = async (text: string) => {
    const v = await verifyToken(text);
    if (v.ok && v.payload.t === 'rickshaw') return nav(`/rickshaw/${encodeURIComponent(String(v.payload.reg))}`);
    if (!v.ok && v.reason === 'signature') return setError(tr('QR-এর স্বাক্ষর মেলেনি: নকল বা বদলানো QR হতে পারে।', 'The QR signature does not match: it may be fake or altered.'));
    // Plain registration numbers printed on plates are accepted too.
    nav(`/rickshaw/${encodeURIComponent(text.trim())}`);
  };
  return (
    <>
      <PageHeader title={tr('ই-রিক্সার QR স্ক্যান', 'e-Rickshaw QR scan')} />
      <div className="content stack" style={{ maxWidth: 520 }}>
        <p className="small">{tr('রিক্সার নম্বর প্লেট বা চালকের পরিচয়পত্রের QR ফ্রেমের ভেতরে রাখুন', 'Hold the QR on the rickshaw’s number plate or the driver’s ID inside the frame')}</p>
        <QrScanner
          onResult={handle}
          onSample={async () => handle(await signToken({ t: 'rickshaw', reg: RICKSHAWS[0].regNo }))}
          sampleLabel={tr('প্রোটোটাইপ: ফ্রেমে চাপ দিলে নমুনা স্ক্যান হবে', 'Prototype: tap the frame to scan a sample')}
        />
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label={tr('অথবা নিবন্ধন নম্বর লিখুন', 'Or type the registration number')} htmlFor="rreg">
          <input id="rreg" className="input" value={reg} onChange={(e) => setReg(e.target.value)} placeholder={tr('যেমন: ER-DS1-00872', 'e.g. ER-DS1-00872')} />
        </Field>
        <button type="button" className="btn primary" disabled={reg.trim().length < 4} onClick={() => handle(reg)}>
          <ShieldCheck size={18} aria-hidden="true" /> {tr('যাচাই করুন', 'Verify')}
        </button>
        <p className="tiny muted">{tr('নমুনা নম্বর: ', 'Sample numbers: ')}{RICKSHAWS.map((r) => r.regNo).join(', ')}</p>
      </div>
    </>
  );
}

export function RickshawInfo() {
  const { reg = '' } = useParams();
  const { toast } = useApp();
  const { tr, tx, date } = useI18n();
  const { pos } = usePosition();
  const r = RICKSHAWS.find((x) => x.regNo.toLowerCase() === decodeURIComponent(reg).trim().toLowerCase());
  const share = async () => {
    const text = `${tr('আমি এই ই-রিক্সায় যাচ্ছি', 'I am travelling on this e-rickshaw')}: ${r?.regNo ?? reg}${pos ? `\nhttps://www.openstreetmap.org/?mlat=${pos.lat.toFixed(5)}&mlon=${pos.lng.toFixed(5)}#map=17/${pos.lat.toFixed(5)}/${pos.lng.toFixed(5)}` : ''}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Hello DMP', text });
      else {
        await navigator.clipboard.writeText(text);
        toast(tr('যাত্রার তথ্য কপি হয়েছে; পরিবারকে পাঠান', 'Trip details copied; send them to your family'));
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') toast(tr('শেয়ার করা যায়নি', 'Could not share'), 'error');
    }
  };
  if (!r)
    return (
      <>
        <PageHeader title={tr('ই-রিক্সার তথ্য', 'e-Rickshaw details')} />
        <div className="content stack" style={{ maxWidth: 560 }}>
          <div className="card danger stack" style={{ textAlign: 'center' }}>
            <CircleX size={40} color="var(--danger)" style={{ margin: '0 auto' }} aria-hidden="true" />
            <strong>{tr('নিবন্ধন পাওয়া যায়নি', 'No registration found')}</strong>
            <p className="small">{tr(`"${decodeURIComponent(reg)}" নম্বরে কোনো নিবন্ধিত ই-রিক্সা নেই। অবৈধ হতে পারে।`, `There is no registered e-rickshaw with number "${decodeURIComponent(reg)}". It may be unregistered.`)}</p>
          </div>
          <Link to={`/rickshaw/${encodeURIComponent(reg)}/complain`} className="btn danger">
            <Flag size={18} aria-hidden="true" /> {tr('অভিযোগ করুন', 'Complain')}
          </Link>
        </div>
      </>
    );
  const valid = r.status === 'valid' && daysUntil(r.validUntil) >= 0;
  return (
    <>
      <PageHeader title={tr('ই-রিক্সার তথ্য', 'e-Rickshaw details')} />
      <div className="content stack" style={{ maxWidth: 560 }}>
        <div className={`card ${valid ? 'success' : 'danger'} row`}>
          {valid ? <CircleCheck size={30} color="var(--success)" aria-hidden="true" /> : <CircleX size={30} color="var(--danger)" aria-hidden="true" />}
          <div>
            <strong>{valid ? tr('নিবন্ধিত ও বৈধ', 'Registered and valid') : tr('নিবন্ধনের মেয়াদ শেষ', 'Registration expired')}</strong>
            <div className="small">{valid ? tr('রুট পারমিট ও ফিটনেস বৈধ', 'Route permit and fitness valid') : tr('এই রিক্সা চলাচলের অনুমতি নেই', 'This rickshaw is not allowed to operate')}</div>
          </div>
        </div>
        <div className="kv">
          <div>{tr('নিবন্ধন নং', 'Registration')}</div>
          <div>{r.regNo}</div>
          <div>{tr('শ্রেণি', 'Category')}</div>
          <div>{tx(r.category)}</div>
          <div>{tr('জোন', 'Zone')}</div>
          <div>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: r.zone.color, marginRight: 6 }} aria-hidden="true" />
            {tx(r.zone.name)}
          </div>
          <div>{tr('রুট', 'Route')}</div>
          <div>{tx(r.route)}</div>
          <div>{tr('নিবন্ধনের মেয়াদ', 'Valid until')}</div>
          <div>{date(r.validUntil)}</div>
        </div>
        <div>
          <span className="tag-heading">{tr('চালক', 'Driver')}</span>
          <div className="tag-rule" />
        </div>
        <div className="card row">
          <span style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
            <UserRound size={26} aria-hidden="true" />
          </span>
          <div className="grow">
            <div className="strong">{tx(r.driver.name)}</div>
            <div className="small muted">{r.driver.licenseValid ? tr('লাইসেন্স বৈধ · ছবি মিলিয়ে নিন', 'Licence valid · match the photo') : tr('লাইসেন্স বৈধ নয়', 'Licence not valid')}</div>
          </div>
          <span className={`badge ${r.driver.licenseValid ? 'success' : 'danger'}`}>{r.driver.licenseValid ? tr('বৈধ', 'Valid') : tr('অবৈধ', 'Invalid')}</span>
        </div>
        <Banner tone="warn">{tr('ছবির সঙ্গে চালক না মিললে বা রিক্সা অন্য জোনে দেখলে অভিযোগ করুন।', 'If the driver does not match the photo, or the rickshaw is outside its zone, complain.')}</Banner>
        <div className="btn-row">
          <button type="button" className="btn outline" onClick={share}>
            <MapPin size={18} aria-hidden="true" /> {tr('যাত্রা শেয়ার', 'Share trip')}
          </button>
          <Link to={`/rickshaw/${encodeURIComponent(r.regNo)}/complain`} className="btn danger">
            <Flag size={18} aria-hidden="true" /> {tr('অভিযোগ করুন', 'Complain')}
          </Link>
        </div>
        <p className="tiny muted">
          <Share2 size={12} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden="true" /> {tr('যাত্রা শেয়ার আপনার ফোনের শেয়ার মেনু খোলে; অ্যাপ নিজে কাউকে কিছু পাঠায় না।', 'Share trip opens your phone’s share menu; the app itself sends nothing.')}
        </p>
      </div>
    </>
  );
}

export function RickshawComplaint() {
  const { reg = '' } = useParams();
  const { state, update, notify } = useApp();
  const { tr, tx, time } = useI18n();
  const nav = useNavigate();
  const { pos, rationale } = usePosition();
  const [issue, setIssue] = useState('');
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const r = RICKSHAWS.find((x) => x.regNo.toLowerCase() === decodeURIComponent(reg).toLowerCase());
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (pos) setLabel(tx(nearestThanas(pos, 1)[0].name).replace(/ থানা| Thana/, ''));
  }, [pos, tx]);
  const submit = async () => {
    if (!issue) return setError(tr('কী হয়েছে বেছে নিন', 'Choose what happened'));
    setError('');
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure });
      const p = pos ?? { lat: 23.7383, lng: 90.4006 };
      const ref = nextNumber(state.reports.map((x) => x.ref), `RPT-${new Date().getFullYear()}-`);
      const id = `R${ref.slice(-6).replace(/^0+/, '')}`;
      const now = new Date().toISOString();
      const thana = nearestThanas(p, 1)[0];
      const issueLabel = RICKSHAW_ISSUES.find((i) => i.id === issue)!.label;
      update((d) => {
        d.reports.unshift({
          id,
          ref,
          kind: 'rickshaw',
          mine: true,
          category: issue,
          description: `${issueLabel.bn} · ${decodeURIComponent(reg)}`,
          vehicleNo: decodeURIComponent(reg),
          lat: p.lat,
          lng: p.lng,
          locationLabel: { bn: thana.name.bn, en: thana.name.en },
          thanaId: thana.id,
          createdAt: now,
          anonymous: !d.session.loggedIn,
          hideIdentity: true,
          photos,
          status: 'received',
          timeline: [{ status: 'received', at: now, note: { bn: 'জোনের ট্রাফিক অফিসার ও সিটি কর্পোরেশনের কাছে পাঠানো হয়েছে', en: 'Sent to the zone’s traffic officer and the city corporation' } }],
        });
        notify(d, { category: 'reports', title: { bn: `ই-রিক্সা অভিযোগ জমা: ${ref}`, en: `e-Rickshaw complaint received: ${ref}` }, body: issueLabel, link: `/reports/${id}` });
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
      <PageHeader title={tr('ই-রিক্সার বিরুদ্ধে অভিযোগ', 'Complain about an e-rickshaw')} />
      <div className="content stack" style={{ maxWidth: 560 }}>
        <div className="card row">
          <ShieldCheck size={22} aria-hidden="true" />
          <div>
            <strong>{decodeURIComponent(reg)}</strong>
            <div className="small muted">{r ? tr(`QR থেকে স্বয়ংক্রিয়ভাবে যুক্ত · জোন ${tx(r.zone.name)}`, `Added automatically from the QR · zone ${tx(r.zone.name)}`) : tr('নিবন্ধন পাওয়া যায়নি', 'Registration not found')}</div>
          </div>
        </div>
        <div>
          <span className="tag-heading">{tr('কী হয়েছে?', 'What happened?')}</span>
          <div className="tag-rule" />
        </div>
        <div className="choice-grid" role="radiogroup" aria-label={tr('কী হয়েছে', 'What happened')}>
          {RICKSHAW_ISSUES.map((i) => (
            <button key={i.id} type="button" role="radio" aria-checked={issue === i.id} className="choice" onClick={() => setIssue(i.id)}>
              {tx(i.label)}
            </button>
          ))}
        </div>
        {error && (
          <p className="danger-text small strong" role="alert">
            {error}
          </p>
        )}
        <PhotoPicker photos={photos} onChange={setPhotos} max={2} allowSample={false} label={tr('ছবি যুক্ত করুন (ঐচ্ছিক)', 'Add a photo (optional)')} />
        <div className="chips">
          <span className="badge brand">
            <MapPin size={12} aria-hidden="true" /> {label || tr('অবস্থান', 'Location')} · GPS
          </span>
          <span className="badge brand">
            <Clock size={12} aria-hidden="true" /> {tr('এখন', 'Now')}, {time(new Date().toISOString())}
          </span>
        </div>
        <p className="small muted">{tr('অভিযোগ সংশ্লিষ্ট জোনের ট্রাফিক অফিসার ও সিটি কর্পোরেশনের কাছে যাবে; আপনার পরিচয় গোপন থাকবে।', 'The complaint goes to the zone’s traffic officer and the city corporation; your identity stays hidden.')}</p>
        {failed && <ErrorBanner onRetry={submit} />}
        <SubmitButton busy={busy} className="danger block" onClick={submit}>
          <Send size={18} aria-hidden="true" /> {tr('অভিযোগ জমা দিন', 'Submit complaint')}
        </SubmitButton>
      </div>
      {rationale}
    </>
  );
}
