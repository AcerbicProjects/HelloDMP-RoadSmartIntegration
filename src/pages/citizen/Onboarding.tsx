import { useState } from 'react';
import { Bell, Camera, CarFront, FileWarning, MapPin, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { LangToggle } from '../../components/AppShell';
import { Sheet, Switch } from '../../components/ui';
import { PrivacyPolicy } from './Settings';

export function Splash() {
  return (
    <div className="splash" role="status" aria-label="Hello DMP">
      <div className="stack" style={{ alignItems: 'center' }}>
        <img src="./dmp-badge.svg" alt="" width={84} height={84} />
        <div className="title">Hello DMP</div>
        <div style={{ opacity: 0.9 }}>ঢাকা মেট্রোপলিটন পুলিশ · Dhaka Metropolitan Police</div>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    icon: FileWarning,
    title: { bn: 'ছবি ও GPS দিয়ে রিপোর্ট', en: 'Report with photo and GPS' },
    body: {
      bn: 'অবৈধ পার্কিং, দুর্ঘটনা বা জলাবদ্ধতা দেখলে রিপোর্ট করুন। প্রতিটি ধাপ অ্যাপে দেখতে পাবেন: যাচাই, অফিসার নিযুক্ত, নিষ্পত্তি।',
      en: 'Report illegal parking, crashes or waterlogging. Follow every step in the app: verified, officer assigned, resolved.',
    },
  },
  {
    icon: Bell,
    title: { bn: 'আপনার পথের যাচাই করা সতর্কতা', en: 'Verified alerts on your route' },
    body: {
      bn: 'DMP-যাচাইকৃত দুর্ঘটনা, ডাইভারশন ও জলাবদ্ধতার খবর, বিকল্প পথসহ। শুধু আপনার পথের খবর পেতে পথ সংরক্ষণ করুন।',
      en: 'DMP-verified crashes, diversions and waterlogging, with alternatives. Save your routes to hear only what matters to you.',
    },
  },
  {
    icon: CarFront,
    title: { bn: 'মামলা, পরিশোধ ও QR ওয়ালেট', en: 'Cases, payment and QR wallet' },
    body: {
      bn: 'AI ক্যামেরার মামলা প্রমাণসহ দেখুন, আপত্তি জানান বা অফিসিয়াল মাধ্যমে পরিশোধ করুন। লাইসেন্স ও গাড়ির কাগজ এক QR-এ।',
      en: 'See AI camera cases with evidence, object or pay through official channels. Licence and vehicle papers in one QR.',
    },
  },
];

/** First-run flow: welcome (proposal p.27), short tour (SG-001), privacy and permissions (SG-036, SG-038). */
export function Onboarding() {
  const { state, update } = useApp();
  const { tr, tx } = useI18n();
  const [step, setStep] = useState<'welcome' | 'tour' | 'consent'>('welcome');
  const [slide, setSlide] = useState(0);
  // A replay from Settings keeps the choices already made; a first run starts with the task permissions on.
  const [consent, setConsent] = useState(
    state.settings.consent.accepted ? { ...state.settings.consent } : { ...state.settings.consent, location: true, notifications: true, camera: true },
  );
  const [accepted, setAccepted] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const finish = () =>
    update((d) => {
      d.settings.onboarded = true;
      d.settings.consent = { ...consent, accepted: true, at: new Date().toISOString() };
    });

  return (
    <div className="onboard">
      <div className="ob-inner">
        <div className="row between">
          <span className="badge dark">{tr('প্রোটোটাইপ', 'Prototype')}</span>
          <LangToggle />
        </div>

        {step === 'welcome' && (
          <>
            <img src="./dmp-badge.svg" alt="" width={96} height={96} style={{ margin: '0 auto' }} />
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', color: 'var(--brand-700)' }}>Hello DMP</h1>
              <p className="strong" style={{ color: 'var(--sos)' }}>
                {tr('রোডস্মার্টসহ · ঢাকার বাসিন্দাদের জন্য অফিসিয়াল সেবা অ্যাপ', 'with RoadSmart · the official service app for Dhaka residents')}
              </p>
            </div>
            <div className="grid-2">
              {[
                { i: CarFront, l: tr('মামলা দেখুন ও পরিশোধ', 'See and pay cases') },
                { i: Camera, l: tr('রিপোর্ট করুন', 'Report') },
                { i: Sparkles, l: tr('আইন সহকারী', 'Law assistant') },
                { i: QrCode, l: tr('ডিজিটাল লাইসেন্স', 'Digital licence') },
              ].map((x) => (
                <div key={x.l} className="card flat" style={{ textAlign: 'center' }}>
                  <x.i size={26} style={{ margin: '0 auto 6px', color: 'var(--brand-700)' }} aria-hidden="true" />
                  <div className="small strong">{x.l}</div>
                </div>
              ))}
            </div>
            <button type="button" className="btn primary block" onClick={() => setStep('tour')}>
              {tr('শুরু করুন', 'Get started')}
            </button>
            <p className="tiny muted" style={{ textAlign: 'center' }}>
              {tr(
                'অফিসার ও কন্ট্রোল রুমের ভিউ ডেমোর উপরের কালো ফিতা থেকে খোলা যাবে, পরিচিতি শেষ করার পর।',
                'Officer and control-room views open from the dark ribbon at the top once this introduction is done.',
              )}
            </p>
          </>
        )}

        {step === 'tour' && (
          <>
            {(() => {
              const S = SLIDES[slide];
              return (
                <div className="stack" style={{ textAlign: 'center' }} aria-live="polite">
                  <div className="ob-art">
                    <S.icon size={52} aria-hidden="true" />
                  </div>
                  <h2 style={{ fontSize: '1.4rem' }}>{tx(S.title)}</h2>
                  <p className="muted">{tx(S.body)}</p>
                </div>
              );
            })()}
            <div className="dots" aria-hidden="true">
              {SLIDES.map((_, i) => (
                <span key={i} className={i === slide ? 'on' : ''} />
              ))}
            </div>
            <div className="btn-row">
              <button type="button" className="btn ghost" onClick={() => setStep('consent')}>
                {tr('বাদ দিন', 'Skip')}
              </button>
              <button type="button" className="btn primary" onClick={() => (slide < SLIDES.length - 1 ? setSlide(slide + 1) : setStep('consent'))}>
                {slide < SLIDES.length - 1 ? tr('পরবর্তী', 'Next') : tr('চালিয়ে যান', 'Continue')}
              </button>
            </div>
          </>
        )}

        {step === 'consent' && (
          <>
            <div className="ob-art" style={{ width: 88, height: 88 }}>
              <ShieldCheck size={44} aria-hidden="true" />
            </div>
            <h2 style={{ textAlign: 'center', fontSize: '1.35rem' }}>{tr('আপনার তথ্য, আপনার নিয়ন্ত্রণ', 'Your data, your choice')}</h2>
            <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
              <li>{tr('অবস্থান শুধু রিপোর্ট, SOS ও নিকটস্থ থানা খুঁজতে ব্যবহার হয়; সারাক্ষণ ট্র্যাক করা হয় না।', 'Location is used only for reports, SOS and finding the nearest thana; you are never tracked in the background.')}</li>
              <li>{tr('রিপোর্টে আপনার পরিচয় জনসমক্ষে গোপন রাখা যায়; বেনামেও রিপোর্ট করা যায়।', 'You can hide your identity on reports, or report anonymously.')}</li>
              <li>{tr('এই প্রোটোটাইপে সব তথ্য শুধু এই ব্রাউজারে থাকে; কোনো সার্ভারে পাঠানো হয় না।', 'In this prototype everything stays in this browser; nothing is sent to a server.')}</li>
            </ul>
            <div className="card flat" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <Switch
                checked={consent.location}
                onChange={(v) => setConsent({ ...consent, location: v })}
                label={tr('অবস্থান', 'Location')}
                description={tr('রিপোর্ট, SOS ও নিকটস্থ থানার জন্য', 'For reports, SOS and nearest thana')}
              />
              <Switch checked={consent.camera} onChange={(v) => setConsent({ ...consent, camera: v })} label={tr('ক্যামেরা', 'Camera')} description={tr('প্রমাণের ছবি ও QR স্ক্যানের জন্য', 'For evidence photos and QR scans')} />
              <Switch
                checked={consent.notifications}
                onChange={(v) => setConsent({ ...consent, notifications: v })}
                label={tr('নোটিফিকেশন', 'Notifications')}
                description={tr('মামলা, রিপোর্টের অবস্থা ও পথের সতর্কতা', 'Cases, report updates and route alerts')}
              />
              <Switch
                checked={consent.analytics}
                onChange={(v) => setConsent({ ...consent, analytics: v })}
                label={tr('ব্যবহারের পরিসংখ্যান (ঐচ্ছিক)', 'Usage statistics (optional)')}
                description={tr('নাম ছাড়া, সেবা উন্নত করতে', 'Anonymous, to improve the service')}
              />
            </div>
            <label className="check">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span className="small">
                {tr('আমি ', 'I have read the ')}
                <button type="button" className="linklike" onClick={() => setPolicyOpen(true)}>
                  {tr('গোপনীয়তা নীতি', 'privacy policy')}
                </button>
                {tr(' পড়েছি এবং সম্মত।', ' and agree.')}
              </span>
            </label>
            <button type="button" className="btn primary block" disabled={!accepted} onClick={finish}>
              {tr('সম্মত ও শুরু করুন', 'Agree and start')}
            </button>
            <p className="tiny muted" style={{ textAlign: 'center' }}>
              <MapPin size={12} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden="true" />{' '}
              {tr('যেকোনো সময় সেটিংস থেকে বদলানো যাবে।', 'You can change these any time in Settings.')}
            </p>
          </>
        )}
      </div>
      <Sheet open={policyOpen} onClose={() => setPolicyOpen(false)} title={tr('গোপনীয়তা নীতি', 'Privacy policy')}>
        <PrivacyPolicy />
      </Sheet>
    </div>
  );
}
