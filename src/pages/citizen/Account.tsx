import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Check, ChevronRight, Clock, Database, IdCard, KeyRound, LogOut, Maximize2, QrCode as QrIcon, ScanLine, ShieldCheck, Smartphone, TriangleAlert, UserRound } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, ErrorBanner, Field, PageHeader, Sheet, SubmitButton } from '../../components/ui';
import { RequireTier } from '../../components/Gate';
import { QrCode } from '../../components/QrCode';
import { simulate, SimulatedNetworkError } from '../../services/api';
import { signToken } from '../../services/crypto';
import { daysUntil, formatPhone } from '../../lib/format';
import type { AppState } from '../../data/types';

export function demoLicence(now = Date.now()): NonNullable<AppState['profile']['license']> {
  return {
    number: 'DK0000000000',
    class: { bn: 'হালকা মোটরযান', en: 'Light motor vehicle' },
    validUntil: new Date(now + 28 * 86_400_000).toISOString(),
    points: 10,
    maxPoints: 12,
    verifiedAt: new Date(now).toISOString(),
  };
}

/** Mobile OTP sign-in (proposal p.27). No SMS is sent: the code is shown on screen for the demo. */
export function Login() {
  const { state, update, toast } = useApp();
  const { tr, lang } = useI18n();
  const nav = useNavigate();
  const [mobile, setMobile] = useState(state.profile.mobile);
  const [sent, setSent] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [left, setLeft] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  const send = async () => {
    const digits = mobile.replace(/[^0-9]/g, '');
    if (!/^01[3-9]\d{8}$/.test(digits)) return setError(tr('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (০১…)', 'Enter a valid 11-digit mobile number (01…)'));
    setError('');
    setBusy(true);
    setFailed(false);
    try {
      const code = await simulate(() => String(Math.floor(100000 + Math.random() * 900000)), { fail: state.settings.simulateFailure });
      setSent(code);
      setOtp(['', '', '', '', '', '']);
      setLeft(45);
      window.setTimeout(() => refs.current[0]?.focus(), 50);
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const verify = () => {
    if (otp.join('') !== sent) return setError(tr('কোডটি মেলেনি। আবার দেখুন।', 'The code does not match. Please check it.'));
    update((d) => {
      d.session.loggedIn = true;
      d.profile.mobile = mobile.replace(/[^0-9]/g, '');
    });
    toast(tr('লগইন হয়েছে (স্তর ১)', 'Signed in (level 1)'));
    nav(-1);
  };

  const demoAccount = () => {
    update((d) => {
      d.session.loggedIn = true;
      d.profile.tier = 3;
      d.profile.nidLinked = true;
      d.profile.license = demoLicence();
    });
    toast(tr('ডেমো অ্যাকাউন্ট: সব স্তর যাচাইকৃত', 'Demo account: all levels verified'));
    nav('/', { replace: true });
  };

  return (
    <>
      <PageHeader title={tr('লগইন', 'Sign in')} />
      <div className="content stack-lg" style={{ maxWidth: 520 }}>
        <Field label={tr('মোবাইল নম্বর', 'Mobile number')} htmlFor="mob" error={!sent ? error : undefined}>
          <div className="row">
            <input id="mob" className="input" inputMode="tel" autoComplete="tel" value={mobile} aria-invalid={!sent && !!error} onChange={(e) => setMobile(e.target.value)} disabled={!!sent} />
            {!sent ? (
              <SubmitButton busy={busy} className="outline" onClick={send}>
                {tr('OTP পাঠান', 'Send OTP')}
              </SubmitButton>
            ) : (
              <button type="button" className="btn ghost small" onClick={() => setSent(null)}>
                {tr('বদলান', 'Change')}
              </button>
            )}
          </div>
        </Field>
        {failed && <ErrorBanner onRetry={send} />}
        {sent && (
          <>
            <Banner tone="warn">
              {tr('ডেমো: কোনো SMS পাঠানো হয়নি। আপনার কোড: ', 'Demo: no SMS was sent. Your code is ')}
              <strong style={{ letterSpacing: 2 }}>{sent}</strong>
            </Banner>
            <div className="field">
              <span className="label">{tr('৬ অঙ্কের OTP', '6-digit OTP')}</span>
              <div className="otp" role="group" aria-label={tr('OTP কোড', 'OTP code')}>
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={tr(`অঙ্ক ${i + 1}`, `Digit ${i + 1}`)}
                    value={v}
                    onChange={(e) => {
                      const ch = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                      const next = [...otp];
                      next[i] = ch;
                      setOtp(next);
                      setError('');
                      if (ch && i < 5) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
                    }}
                    onPaste={(e) => {
                      const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                      if (digits.length === 6) {
                        e.preventDefault();
                        setOtp(digits.split(''));
                        refs.current[5]?.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <span className="hint">
                {left > 0 ? tr(`আবার পাঠান: ০০:${String(left).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])}`, `Resend in 00:${String(left).padStart(2, '0')}`) : (
                  <button type="button" className="linklike" onClick={send}>
                    {tr('আবার কোড পাঠান', 'Resend code')}
                  </button>
                )}
              </span>
              {error && (
                <span className="error" role="alert">
                  {error}
                </span>
              )}
            </div>
            <button type="button" className="btn primary block" disabled={otp.join('').length < 6} onClick={verify}>
              {tr('প্রবেশ করুন', 'Sign in')}
            </button>
          </>
        )}
        <Banner tone="danger" icon={<KeyRound size={18} aria-hidden="true" />}>
          {tr('DMP কখনো ফোন, SMS বা লিংকে OTP বা PIN চায় না। OTP শুধু এই অ্যাপের ভেতরেই লিখুন।', 'DMP never asks for an OTP or PIN by phone, SMS or link. Type the OTP only inside this app.')}
        </Banner>
        <TierLadder />
        <div className="card flat stack" style={{ gap: 8 }}>
          <strong className="small">{tr('প্রোটোটাইপ পরীক্ষার জন্য', 'For testing the prototype')}</strong>
          <button type="button" className="btn outline" onClick={demoAccount}>
            {tr('ডেমো অ্যাকাউন্ট ব্যবহার করুন (সব স্তর যাচাইকৃত)', 'Use the demo account (all levels verified)')}
          </button>
          <span className="tiny muted">{tr(`নমুনা নাগরিক: ${state.profile.name}, ${formatPhone(state.profile.mobile, lang)}`, `Sample citizen: ${state.profile.name}, ${formatPhone(state.profile.mobile, lang)}`)}</span>
        </div>
      </div>
    </>
  );
}

function TierLadder() {
  const { state } = useApp();
  const { tr } = useI18n();
  const tier = state.session.loggedIn ? state.profile.tier : 0;
  const rows = [
    { t: 1, icon: Smartphone, title: tr('স্তর ১ · মোবাইল OTP', 'Level 1 · mobile OTP'), body: tr('রিপোর্ট, সতর্কতা, AI সহকারী, SMS যাচাই', 'Reports, alerts, AI assistant, SMS check') },
    { t: 2, icon: IdCard, title: tr('স্তর ২ · NID যাচাই', 'Level 2 · NID verified'), body: tr('নিজের গাড়ির মামলা, পরিশোধ, আপত্তি', 'Your vehicle’s cases, payment, objections') },
    { t: 3, icon: QrIcon, title: tr('স্তর ৩ · লাইসেন্স ও গাড়ির কাগজ (BRTA)', 'Level 3 · licence and vehicle papers (BRTA)'), body: tr('ডিজিটাল লাইসেন্স, নিবন্ধন, ফিটনেস ও ট্যাক্স টোকেন; অফিসারকে QR দেখানো', 'Digital licence, registration, fitness and tax token; show a QR to officers') },
  ];
  return (
    <section className="stack">
      <div>
        <span className="tag-heading">{tr('যাচাই স্তর', 'Verification levels')}</span>
        <div className="tag-rule" />
      </div>
      <div className="list">
        {rows.map((r) => (
          <div key={r.t} className="list-row" style={{ cursor: 'default' }}>
            <span className="lr-icon" style={tier >= r.t ? { background: 'var(--brand-700)', color: '#fff' } : undefined}>
              {tier >= r.t ? <Check size={20} aria-hidden="true" /> : <r.icon size={20} aria-hidden="true" />}
            </span>
            <span className="grow">
              <span className="lr-title" style={{ display: 'block' }}>
                {r.title}
              </span>
              <span className="lr-sub">{r.body}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Profile() {
  const { state, update, toast } = useApp();
  const { tr, lang } = useI18n();
  const nav = useNavigate();
  if (!state.session.loggedIn)
    return (
      <>
        <PageHeader title={tr('প্রোফাইল', 'Profile')} />
        <RequireTier tier={1} what={tr('প্রোফাইল', 'your profile')}>
          <span />
        </RequireTier>
      </>
    );
  return (
    <>
      <PageHeader title={tr('প্রোফাইল', 'Profile')} />
      <div className="content stack-lg" style={{ maxWidth: 640 }}>
        <div className="card tinted row">
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}>
            <UserRound size={28} aria-hidden="true" />
          </span>
          <div className="grow">
            <div className="strong" style={{ fontSize: '1.15rem' }}>
              {state.profile.name}
            </div>
            <div className="small">{formatPhone(state.profile.mobile, lang)}</div>
          </div>
        </div>
        <TierLadder />
        {state.profile.tier < 3 && (
          <Link to="/profile/verify" className="btn primary">
            {state.profile.tier === 1 ? tr('NID যাচাই করুন (স্তর ২)', 'Verify NID (level 2)') : tr('লাইসেন্স ও গাড়ির কাগজ যুক্ত করুন (স্তর ৩)', 'Link licence and vehicle papers (level 3)')}
          </Link>
        )}
        <div className="list">
          <Link to="/wallet" className="list-row">
            <span className="lr-icon">
              <QrIcon size={20} aria-hidden="true" />
            </span>
            <span className="grow lr-title">{tr('QR ওয়ালেট', 'QR wallet')}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/settings" className="list-row">
            <span className="lr-icon">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <span className="grow lr-title">{tr('গোপনীয়তা ও সেটিংস', 'Privacy and settings')}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          className="btn outline-danger"
          onClick={() => {
            update((d) => {
              d.session.loggedIn = false;
            });
            toast(tr('লগআউট হয়েছে', 'Signed out'), 'info');
            nav('/');
          }}
        >
          <LogOut size={18} aria-hidden="true" /> {tr('লগআউট', 'Sign out')}
        </button>
      </div>
    </>
  );
}

/** NID (level 2) and BRTA licence + vehicle linking (level 3), proposal p.30–31. Checks are simulated. */
export function VerifyIdentity() {
  const { state, update, toast } = useApp();
  const { tr } = useI18n();
  const nav = useNavigate();
  const tier = state.profile.tier;
  const [nid, setNid] = useState('');
  const [dob, setDob] = useState('');
  const [lic, setLic] = useState('');
  const [reg, setReg] = useState('Dhaka Metro-Ga 12-3456');
  const [chassis, setChassis] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!state.session.loggedIn)
    return (
      <>
        <PageHeader title={tr('যাচাই', 'Verify')} />
        <RequireTier tier={1} what={tr('যাচাই', 'verification')}>
          <span />
        </RequireTier>
      </>
    );

  const run = async (target: 2 | 3) => {
    const e: Record<string, string> = {};
    if (target === 2) {
      if (!/^(\d{10}|\d{13}|\d{17})$/.test(nid.replace(/\s/g, ''))) e.nid = tr('১০, ১৩ বা ১৭ অঙ্কের NID নম্বর দিন', 'Enter a 10, 13 or 17-digit NID number');
      if (!dob) e.dob = tr('জন্মতারিখ দিন', 'Enter your date of birth');
    } else {
      if (lic.trim().length < 6) e.lic = tr('লাইসেন্স নম্বর দিন', 'Enter the licence number');
      if (reg.trim().length < 6) e.reg = tr('নিবন্ধন নম্বর দিন', 'Enter the registration number');
      if (!/^[A-Za-z0-9]{5}$/.test(chassis.trim())) e.chassis = tr('চেসিস নম্বরের শেষ ৫ অক্ষর দিন', 'Enter the last 5 characters of the chassis number');
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setFailed(false);
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 1200 });
      update((d) => {
        if (target === 2) {
          d.profile.tier = 2;
          d.profile.nidLinked = true;
        } else {
          d.profile.tier = 3;
          d.profile.license = { ...demoLicence(), number: lic.trim().toUpperCase() };
        }
      });
      toast(target === 2 ? tr('NID যাচাই হয়েছে (ডেমো)', 'NID verified (demo)') : tr('লাইসেন্স ও গাড়ির কাগজ যুক্ত হয়েছে (ডেমো)', 'Licence and vehicle papers linked (demo)'));
      if (target === 3) nav('/wallet', { replace: true });
    } catch (err) {
      if (err instanceof SimulatedNetworkError) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={tr('লাইসেন্স ও গাড়ির কাগজ যুক্ত করুন', 'Link licence and vehicle papers')} />
      <div className="content stack-lg" style={{ maxWidth: 560 }}>
        <Banner tone="brand" icon={<ShieldCheck size={18} aria-hidden="true" />}>
          {tr('সব তথ্য সরাসরি BRTA থেকে যাচাই হয় এবং আপনার NID-এর সঙ্গে মেলানো হয়। অন্যের কাগজ যুক্ত করা যায় না।', 'Everything is checked directly with BRTA and matched to your NID. Someone else’s papers cannot be added.')}
        </Banner>
        <Banner tone="warn">{tr('প্রোটোটাইপ: NID ও BRTA-র সঙ্গে কোনো আসল সংযোগ নেই; যেকোনো সঠিক ফরম্যাটের নমুনা নম্বর গ্রহণ করা হবে। আসল নম্বর দেবেন না।', 'Prototype: there is no real NID or BRTA connection; any correctly formatted sample number is accepted. Do not enter real numbers.')}</Banner>
        <section className="card stack" style={{ borderColor: tier >= 2 ? 'var(--brand-border)' : undefined }}>
          <div className="row">
            <span className="lr-icon" style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: tier >= 2 ? 'var(--brand-700)' : 'var(--surface-2)', color: tier >= 2 ? '#fff' : 'inherit' }}>
              {tier >= 2 ? <Check size={18} aria-hidden="true" /> : '১'}
            </span>
            <div>
              <strong>{tr('জাতীয় পরিচয়পত্র (NID)', 'National ID (NID)')}</strong>
              <div className="small muted">{tier >= 2 ? tr('যাচাইকৃত · স্তর ২', 'Verified · level 2') : tr('স্তর ২-এর জন্য', 'For level 2')}</div>
            </div>
          </div>
          {tier < 2 && (
            <>
              <Field label={tr('NID নম্বর', 'NID number')} htmlFor="nid" error={errors.nid}>
                <input id="nid" className="input" inputMode="numeric" value={nid} aria-invalid={!!errors.nid} onChange={(e) => setNid(e.target.value)} placeholder="0000000000" />
              </Field>
              <Field label={tr('জন্মতারিখ', 'Date of birth')} htmlFor="dob" error={errors.dob}>
                <input id="dob" type="date" className="input" value={dob} aria-invalid={!!errors.dob} onChange={(e) => setDob(e.target.value)} />
              </Field>
              <SubmitButton busy={busy} onClick={() => run(2)}>
                {tr('NID যাচাই করুন', 'Verify NID')}
              </SubmitButton>
            </>
          )}
        </section>
        <section className="card stack" style={{ opacity: tier < 2 ? 0.6 : 1 }}>
          <div className="row">
            <span className="lr-icon" style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: tier >= 3 ? 'var(--brand-700)' : 'var(--surface-2)', color: tier >= 3 ? '#fff' : 'inherit' }}>
              {tier >= 3 ? <Check size={18} aria-hidden="true" /> : '২'}
            </span>
            <div>
              <strong>{tr('ড্রাইভিং লাইসেন্স ও গাড়ির নিবন্ধন', 'Driving licence and vehicle registration')}</strong>
              <div className="small muted">{tr('নিবন্ধন সনদ (DRC), ফিটনেস, ট্যাক্স টোকেন', 'Registration (DRC), fitness, tax token')}</div>
            </div>
          </div>
          {tier === 2 && (
            <>
              <Field label={tr('লাইসেন্স নম্বর', 'Licence number')} htmlFor="lic" error={errors.lic}>
                <input id="lic" className="input" value={lic} aria-invalid={!!errors.lic} onChange={(e) => setLic(e.target.value)} placeholder="DK…" />
              </Field>
              <Field label={tr('নিবন্ধন নম্বর', 'Registration number')} htmlFor="reg" error={errors.reg}>
                <input id="reg" className="input" value={reg} aria-invalid={!!errors.reg} onChange={(e) => setReg(e.target.value)} />
              </Field>
              <Field label={tr('চেসিস নম্বরের শেষ ৫ অক্ষর', 'Last 5 characters of the chassis number')} htmlFor="ch" error={errors.chassis}>
                <input id="ch" className="input" maxLength={5} value={chassis} aria-invalid={!!errors.chassis} onChange={(e) => setChassis(e.target.value)} placeholder="47B2K" />
              </Field>
              <SubmitButton busy={busy} onClick={() => run(3)}>
                <BadgeCheck size={18} aria-hidden="true" /> {tr('BRTA-তে যাচাই করুন', 'Verify with BRTA')}
              </SubmitButton>
            </>
          )}
          {tier < 2 && <p className="small muted">{tr('আগে NID যাচাই করুন।', 'Verify your NID first.')}</p>}
        </section>
        <section className="card flat row" style={{ opacity: 0.75 }}>
          <span className="lr-icon" style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--surface-2)' }}>
            ৩
          </span>
          <div>
            <strong>{tr('বিমা', 'Insurance')}</strong>
            <div className="small muted">{tr('বিমা কোম্পানির সঙ্গে সংযোগ পরের ধাপে', 'Insurer connection comes in a later phase')}</div>
          </div>
        </section>
        {failed && <ErrorBanner />}
        {tier >= 3 && (
          <Link to="/wallet" className="btn primary">
            <QrIcon size={18} aria-hidden="true" /> {tr('QR ওয়ালেটে দেখুন', 'View in QR wallet')}
          </Link>
        )}
      </div>
    </>
  );
}

export function Wallet() {
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('QR ওয়ালেট', 'QR wallet')} />
      <RequireTier tier={3} what={tr('QR ওয়ালেট', 'the QR wallet')}>
        <WalletBody />
      </RequireTier>
    </>
  );
}

function WalletBody() {
  const { state } = useApp();
  const { tr, tx, n, date, time, ago } = useI18n();
  const lic = state.profile.license!;
  const vehicles = state.vehicles.filter((v) => state.profile.vehicleIds.includes(v.id));
  const [token, setToken] = useState('');
  const [left, setLeft] = useState(60);
  const [full, setFull] = useState(false);
  const unpaid = state.cases.filter((c) => c.officerVerified && c.status === 'unpaid' && state.profile.vehicleIds.includes(c.vehicleId));

  // A new signed token every minute, so a screenshot stops working (proposal p.30).
  useEffect(() => {
    let alive = true;
    const issue = async () => {
      const exp = Date.now() + 60_000;
      const t = await signToken({ t: 'wallet', exp, sub: state.profile.name, lic: lic.number, cls: lic.class.en, veh: vehicles.map((v) => v.regNo.en), pts: lic.points });
      if (alive) {
        setToken(t);
        setLeft(60);
      }
    };
    void issue();
    const tick = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          void issue();
          return 60;
        }
        return l - 1;
      });
    }, 1000);
    return () => {
      alive = false;
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renewDays = daysUntil(lic.validUntil);
  const masked = `${lic.number.slice(0, 2)}${'X'.repeat(Math.max(0, lic.number.length - 2))}`;

  const qrPanel = (
    <div className="qr-panel">
      <div className="strong">{tr('অফিসারকে দেখান', 'Show to the officer')}</div>
      <div className="qr-box">{token ? <QrCode value={token} label={tr('লাইসেন্স ও গাড়ির কাগজের QR', 'QR for licence and vehicle papers')} /> : <div className="skeleton" style={{ aspectRatio: '1' }} />}</div>
      <div className="small">{tr('লাইসেন্স + গাড়ির কাগজ, এক QR-এ', 'Licence + vehicle papers in one QR')}</div>
      <div style={{ margin: '10px 0' }}>
        <span className="timer" aria-live="off">
          <Clock size={14} aria-hidden="true" /> {tr(`নতুন QR ${n(left)} সেকেন্ডে`, `New QR in ${left} s`)}
        </span>
      </div>
      <div className="tiny" style={{ opacity: 0.85 }}>
        {tr('প্রতি মিনিটে বদলায়, তাই স্ক্রিনশট দিয়ে চলবে না · ইন্টারনেট ছাড়াও যাচাই হয়', 'Changes every minute, so screenshots do not work · verifiable without internet')}
      </div>
    </div>
  );

  return (
    <div className="content cols">
      <div className="stack">
        {qrPanel}
        <button type="button" className="btn outline" onClick={() => setFull(true)}>
          <Maximize2 size={18} aria-hidden="true" /> {tr('বড় করে দেখান', 'Show full screen')}
        </button>
        <div className="badge success" style={{ alignSelf: 'flex-start' }}>
          <ShieldCheck size={12} aria-hidden="true" /> {tr(`BRTA থেকে যাচাইকৃত · ${date(lic.verifiedAt)}, ${time(lic.verifiedAt)}`, `Verified with BRTA · ${date(lic.verifiedAt)}, ${time(lic.verifiedAt)}`)}
        </div>
      </div>
      <div className="stack">
        <div className="card stack" style={{ gap: 6 }}>
          <div className="row between">
            <strong>{tr('ড্রাইভিং লাইসেন্স', 'Driving licence')}</strong>
            <span className="badge success">
              <Check size={12} aria-hidden="true" /> {renewDays >= 0 ? tr('বৈধ', 'Valid') : tr('মেয়াদোত্তীর্ণ', 'Expired')}
            </span>
          </div>
          <div className="small">
            {state.profile.name} · {masked} · {tx(lic.class)}
          </div>
          <div className="small muted">
            {tr('মেয়াদ', 'Valid until')}: {date(lic.validUntil)} · {tr(`দোষসূচক পয়েন্ট ${n(lic.points)}/${n(lic.maxPoints)} বাকি`, `Demerit points ${lic.points}/${lic.maxPoints} left`)}
          </div>
        </div>
        {vehicles.map((v) => (
          <div key={v.id} className="card stack" style={{ gap: 6 }}>
            <div className="row between">
              <strong>{tx(v.regNo)}</strong>
              <span className="badge brand">
                <UserRound size={12} aria-hidden="true" /> {v.ownership === 'owner' ? tr('মালিক: আপনি', 'Owner: you') : tr('চালক', 'Driver')}
              </span>
            </div>
            <div className="small muted">{tx(v.kind)}</div>
            <div className="grid-2 small">
              <span className="row" style={{ gap: 4 }}>
                <Check size={14} color="var(--success)" aria-hidden="true" /> {tr('নিবন্ধন (DRC)', 'Registration (DRC)')}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <Check size={14} color="var(--success)" aria-hidden="true" /> {tr(`ফিটনেস: ${date(v.fitnessUntil)}`, `Fitness: ${date(v.fitnessUntil)}`)}
              </span>
              <span className="row" style={{ gap: 4 }}>
                {daysUntil(v.taxTokenUntil) > 60 ? <Check size={14} color="var(--success)" aria-hidden="true" /> : <TriangleAlert size={14} color="var(--warning)" aria-hidden="true" />}{' '}
                {tr(`ট্যাক্স টোকেন: ${date(v.taxTokenUntil)}`, `Tax token: ${date(v.taxTokenUntil)}`)}
              </span>
              <span className="row muted" style={{ gap: 4 }}>
                <Clock size={14} aria-hidden="true" /> {tr('বিমা: পরের ধাপে', 'Insurance: next phase')}
              </span>
            </div>
          </div>
        ))}
        {renewDays <= 30 && (
          <Banner tone="warn">
            {tr(`লাইসেন্সের মেয়াদ শেষ হতে ${n(renewDays)} দিন · নবায়ন করুন (BRTA)`, `Licence expires in ${renewDays} days · renew with BRTA`)}
          </Banner>
        )}
        {unpaid.length > 0 && (
          <Link to="/cases" className="card danger row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <TriangleAlert size={20} aria-hidden="true" />
            <span className="grow small strong">{tr(`${n(unpaid.length)}টি অপরিশোধিত মামলা; অফিসার স্ক্যানে দেখতে পাবেন`, `${unpaid.length} unpaid cases; officers see them when scanning`)}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        )}
        <section className="stack">
          <h2 className="section-title">
            <span className="row" style={{ gap: 6 }}>
              <ScanLine size={18} aria-hidden="true" /> {tr('কে আমার QR স্ক্যান করেছেন', 'Who scanned my QR')}
            </span>
          </h2>
          <div className="list">
            {state.scanLog.length === 0 && <div className="list-row small muted">{tr('এখনো কোনো স্ক্যান হয়নি', 'No scans yet')}</div>}
            {state.scanLog
              .filter((s) => s.kind === 'wallet')
              .map((s) => {
                const o = state.officers.find((x) => x.id === s.officerId);
                return (
                  <div key={s.id} className="list-row" style={{ cursor: 'default' }}>
                    <span className="lr-icon">
                      <Database size={18} aria-hidden="true" />
                    </span>
                    <span className="grow">
                      <span className="lr-title" style={{ display: 'block' }}>
                        {tx(o?.name)}
                      </span>
                      <span className="lr-sub">
                        {tx(o?.division)} · {ago(s.at)}
                      </span>
                    </span>
                    <span className={`badge ${s.result === 'valid' ? 'success' : s.result === 'expired' ? 'warn' : 'danger'}`}>{s.result === 'valid' ? tr('বৈধ', 'Valid') : s.result === 'expired' ? tr('মেয়াদোত্তীর্ণ', 'Expired') : tr('অবৈধ', 'Invalid')}</span>
                  </div>
                );
              })}
          </div>
          <p className="tiny muted">{tr('প্রতিটি স্ক্যান লগ হয়; অফিসার শুধু প্রয়োজনীয় তথ্যটুকু দেখেন।', 'Every scan is logged; officers see only what they need.')}</p>
        </section>
      </div>
      <Sheet open={full} onClose={() => setFull(false)} title={tr('অফিসারকে দেখান', 'Show to the officer')}>
        {qrPanel}
      </Sheet>
    </div>
  );
}
