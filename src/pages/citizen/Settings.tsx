import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Database, Download, FlaskConical, Languages, LogIn, LogOut, PlayCircle, RotateCcw, ShieldCheck, Trash2, Type, User } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, DemoTag, LinkRow, PageHeader, Sheet, Switch } from '../../components/ui';
import { SEVERITY } from '../../data/catalog';
import type { Severity } from '../../data/types';

/** Plain-language privacy notice (SG-036, SG-039, SG-040). Written for the prototype; it is not DMP's policy. */
export function PrivacyPolicy() {
  const { tr } = useI18n();
  const sections: { h: string; p: string[] }[] = [
    {
      h: tr('আমরা কী তথ্য নিই', 'What we collect'),
      p: [
        tr('মোবাইল নম্বর: লগইন ও যাচাইয়ের জন্য। NID ও লাইসেন্স নম্বর: শুধু আপনি যাচাই করলে, মামলা ও ওয়ালেট দেখাতে।', 'Mobile number: for sign-in and verification. NID and licence numbers: only if you verify, to show cases and the wallet.'),
        tr('অবস্থান: শুধু থানা খোঁজা, রিপোর্ট বা SOS-এর সময়, আপনার অনুমতিতে। পেছনে ট্র্যাক করা হয় না।', 'Location: only when finding a thana, reporting or using SOS, with your permission. Never tracked in the background.'),
        tr('ছবি: শুধু আপনি রিপোর্টে যুক্ত করলে। ছবির আঙুলছাপ (হ্যাশ) রাখা হয় যাতে পরে বদলানো ধরা যায়।', 'Photos: only those you attach to a report. A fingerprint (hash) is kept so later changes can be detected.'),
      ],
    },
    {
      h: tr('কেন নিই', 'Why'),
      p: [tr('প্রতিটি তথ্য একটি নির্দিষ্ট কাজের জন্য নেওয়া হয়; সেই কাজ ছাড়া অন্য কিছুতে ব্যবহার হয় না।', 'Each item is collected for one task and is not used for anything else.')],
    },
    {
      h: tr('অভিযোগকারীর পরিচয় সুরক্ষা', 'Protecting people who report'),
      p: [
        tr('আপনার নাম ও নম্বর অভিযুক্ত ব্যক্তি বা অন্য নাগরিক কখনো দেখতে পান না। শুধু যাচাইকারী অফিসার নাম দেখেন।', 'The person you report and other citizens never see your name or number. Only the verifying officer sees your name.'),
        tr('বেনামে রিপোর্ট করলে অফিসারও আপনার পরিচয় জানেন না।', 'If you report anonymously, not even the officer knows who you are.'),
      ],
    },
    {
      h: tr('আপনার নিয়ন্ত্রণ', 'Your controls'),
      p: [
        tr('সেটিংসে যেকোনো সময় অবস্থান, ক্যামেরা, নোটিফিকেশন ও বিশ্লেষণের অনুমতি বদলাতে পারেন।', 'You can change location, camera, notification and analytics permissions in Settings at any time.'),
        tr('এই ডিভাইসে রাখা আপনার তথ্য ডাউনলোড বা মুছে ফেলা যায়।', 'You can download or delete the data kept on this device.'),
      ],
    },
    {
      h: tr('এই প্রোটোটাইপে', 'In this prototype'),
      p: [tr('সব তথ্য শুধু এই ব্রাউজারে (localStorage) থাকে। কোনো সার্ভারে পাঠানো হয় না। নথিটি নমুনা খসড়া; DMP-এর অফিসিয়াল নীতি নয় এবং আইনি পর্যালোচনা প্রয়োজন।', 'All data stays in this browser (localStorage) and is never sent to a server. This text is a sample draft, not DMP’s official policy, and needs legal review.')],
    },
  ];
  return (
    <div className="stack">
      {sections.map((s) => (
        <section key={s.h} className="stack" style={{ gap: 6 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--brand-700)' }}>{s.h}</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }} className="small stack">
            {s.p.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function PrivacyPage() {
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('গোপনীয়তা নীতি', 'Privacy policy')} />
      <div className="content stack" style={{ maxWidth: 760 }}>
        <Banner tone="warn">{tr('নমুনা খসড়া: DMP-এর অফিসিয়াল নীতি নয়।', 'Sample draft: not DMP’s official policy.')}</Banner>
        <div className="card">
          <PrivacyPolicy />
        </div>
        <Link to="/settings#privacy" className="btn outline">
          <ShieldCheck size={18} aria-hidden="true" /> {tr('অনুমতি পরিবর্তন করুন', 'Change permissions')}
        </Link>
      </div>
    </>
  );
}

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="row" style={{ fontSize: '1.05rem', gap: 8, scrollMarginTop: 80 }}>
      <span style={{ color: 'var(--brand-700)', display: 'inline-flex' }} aria-hidden="true">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default function SettingsPage() {
  const { state, update, reset, toast, notify } = useApp();
  const { tr, tx, n } = useI18n();
  const loc = useLocation();
  const nav = useNavigate();
  const s = state.settings;
  const [confirm, setConfirm] = useState<'reset' | 'delete' | null>(null);

  useEffect(() => {
    if (!loc.hash) return;
    const el = document.getElementById(loc.hash.slice(1));
    if (el) window.setTimeout(() => el.scrollIntoView({ block: 'start' }), 50);
  }, [loc.hash]);

  const set = (fn: (d: typeof state) => void) => update(fn);

  const download = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hello-dmp-prototype-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const testNotification = () => {
    update((d) =>
      notify(d, {
        category: 'system',
        title: { bn: 'পরীক্ষামূলক নোটিফিকেশন', en: 'Test notification' },
        body: { bn: 'নোটিফিকেশন ঠিকমতো আসছে। (শুধু অ্যাপের ভেতরে)', en: 'Notifications are working. (In-app only)' },
        link: '/notifications',
      }),
    );
    toast(tr('ইনবক্সে একটি পরীক্ষামূলক নোটিফিকেশন যোগ হয়েছে', 'A test notification was added to your inbox'), 'info');
  };

  return (
    <>
      <PageHeader title={tr('সেটিংস', 'Settings')} />
      <div className="content cols even">
        <div className="stack-lg">
          <section className="card stack" aria-labelledby="set-display">
            <SectionTitle icon={<Languages size={20} />} id="set-display">
              {tr('ভাষা ও প্রদর্শন', 'Language and display')}
            </SectionTitle>
            <div role="radiogroup" aria-label={tr('ভাষা', 'Language')} className="choice-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {(
                [
                  ['bn', 'বাংলা'],
                  ['en', 'English'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={s.lang === id}
                  className="choice"
                  lang={id}
                  onClick={() =>
                    set((d) => {
                      d.settings.lang = id;
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <span className="row strong small" style={{ gap: 6 }}>
                <Type size={16} aria-hidden="true" /> {tr('লেখার আকার', 'Text size')}
              </span>
              <div role="radiogroup" aria-label={tr('লেখার আকার', 'Text size')} className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {(
                  [
                    [1, tr('স্বাভাবিক', 'Normal')],
                    [1.15, tr('বড়', 'Large')],
                    [1.3, tr('আরও বড়', 'Larger')],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={s.textScale === v}
                    className="choice"
                    style={{ fontSize: `${v}rem` }}
                    onClick={() =>
                      set((d) => {
                        d.settings.textScale = v;
                      })
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Switch
              checked={s.highContrast}
              onChange={(v) =>
                set((d) => {
                  d.settings.highContrast = v;
                })
              }
              label={tr('উচ্চ কনট্রাস্ট', 'High contrast')}
              description={tr('গাঢ় লেখা ও স্পষ্ট সীমারেখা', 'Darker text and stronger borders')}
            />
            <Switch
              checked={s.lowBandwidth}
              onChange={(v) =>
                set((d) => {
                  d.settings.lowBandwidth = v;
                })
              }
              label={tr('কম ডেটা মোড', 'Low-data mode')}
              description={tr('সাজসজ্জার ছবি লুকায়, ছবির প্রিভিউ বানায় না, মানচিত্র দরকার হলে তবেই', 'Hides decorative images, skips photo previews, loads maps only on demand')}
            />
            <button
              type="button"
              className="btn outline"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                nav('/');
                set((d) => {
                  d.settings.onboarded = false;
                });
              }}
            >
              <PlayCircle size={18} aria-hidden="true" /> {tr('পরিচিতি আবার দেখুন', 'Show the introduction again')}
            </button>
          </section>

          <section className="card stack" aria-labelledby="notifications">
            <SectionTitle icon={<Bell size={20} />} id="notifications">
              {tr('নোটিফিকেশন', 'Notifications')}
            </SectionTitle>
            {(
              [
                ['alerts', tr('যানবাহন সতর্কতা', 'Traffic alerts'), tr('আপনার সংরক্ষিত পথের খবর', 'News on your saved routes')],
                ['cases', tr('মামলা ও পরিশোধ', 'Cases and payments'), tr('নতুন মামলা, আপত্তির সিদ্ধান্ত, রসিদ', 'New cases, objection decisions, receipts')],
                ['reports', tr('আমার রিপোর্ট', 'My reports'), tr('যাচাই, অফিসার নিযুক্ত, নিষ্পত্তি', 'Verified, officer assigned, resolved')],
                ['announcements', tr('DMP ঘোষণা', 'DMP announcements'), tr('নোটিশ ও পরিপত্র', 'Notices and circulars')],
              ] as const
            ).map(([key, label, desc]) => (
              <Switch
                key={key}
                checked={s.notif[key]}
                onChange={(v) =>
                  set((d) => {
                    d.settings.notif[key] = v;
                  })
                }
                label={label}
                description={desc}
              />
            ))}
            <div className="field">
              <label htmlFor="min-sev">{tr('কোন মাত্রার সতর্কতা জানাবে', 'Alert severity to notify')}</label>
              <select
                id="min-sev"
                className="select"
                value={s.notif.minSeverity}
                onChange={(e) =>
                  set((d) => {
                    d.settings.notif.minSeverity = e.target.value as Severity;
                  })
                }
              >
                {(['minor', 'major', 'critical'] as Severity[]).map((v) => (
                  <option key={v} value={v}>
                    {v === 'minor' ? tr('সব সতর্কতা', 'All alerts') : v === 'major' ? tr('বড় ও গুরুতর', 'Major and critical') : tr('শুধু গুরুতর', 'Critical only')} ({tx(SEVERITY[v].label)}
                    {v !== 'critical' ? '+' : ''})
                  </option>
                ))}
              </select>
            </div>
            <Switch
              checked={s.notif.quietHours}
              onChange={(v) =>
                set((d) => {
                  d.settings.notif.quietHours = v;
                })
              }
              label={tr('নীরব সময়', 'Quiet hours')}
              description={tr('এই সময়ে শব্দ হবে না; খবর ইনবক্সে জমা থাকবে', 'No sound during these hours; items still collect in the inbox')}
            />
            {s.notif.quietHours && (
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="q-from">{tr('শুরু', 'From')}</label>
                  <input
                    id="q-from"
                    type="time"
                    className="input"
                    value={s.notif.quietFrom}
                    onChange={(e) =>
                      e.target.value &&
                      set((d) => {
                        d.settings.notif.quietFrom = e.target.value;
                      })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="q-to">{tr('শেষ', 'To')}</label>
                  <input
                    id="q-to"
                    type="time"
                    className="input"
                    value={s.notif.quietTo}
                    onChange={(e) =>
                      e.target.value &&
                      set((d) => {
                        d.settings.notif.quietTo = e.target.value;
                      })
                    }
                  />
                </div>
              </div>
            )}
            <button type="button" className="btn outline" onClick={testNotification}>
              <Bell size={18} aria-hidden="true" /> {tr('পরীক্ষামূলক নোটিফিকেশন পাঠান', 'Send a test notification')}
            </button>
            <p className="tiny muted">{tr('প্রোটোটাইপে নোটিফিকেশন শুধু অ্যাপের ইনবক্সে দেখা যায়; ফোনে পুশ পাঠানো হয় না।', 'In the prototype, notifications appear only in the in-app inbox; no phone push is sent.')}</p>
          </section>
        </div>

        <div className="stack-lg">
          <section className="card stack" aria-labelledby="privacy">
            <SectionTitle icon={<ShieldCheck size={20} />} id="privacy">
              {tr('গোপনীয়তা ও অনুমতি', 'Privacy and permissions')}
            </SectionTitle>
            {(
              [
                ['location', tr('অবস্থান', 'Location'), tr('থানা, রিপোর্ট ও SOS-এর সময়', 'When finding thanas, reporting and SOS')],
                ['camera', tr('ক্যামেরা ও ছবি', 'Camera and photos'), tr('রিপোর্টে ছবি ও QR স্ক্যান', 'Report photos and QR scanning')],
                ['notifications', tr('নোটিফিকেশন', 'Notifications'), tr('ইনবক্সে খবর', 'Updates in the inbox')],
                ['analytics', tr('ব্যবহার-বিশ্লেষণ', 'Usage analytics'), tr('নাম ছাড়া, সেবা উন্নয়নে (প্রোটোটাইপে কিছু পাঠানো হয় না)', 'Anonymous, to improve services (nothing is sent in the prototype)')],
              ] as const
            ).map(([key, label, desc]) => (
              <Switch
                key={key}
                checked={s.consent[key]}
                onChange={(v) =>
                  set((d) => {
                    d.settings.consent[key] = v;
                    if (key === 'location' && v) d.settings.locationRationaleSeen = false;
                  })
                }
                label={label}
                description={desc}
              />
            ))}
            <LinkRow to="/privacy" icon={<ShieldCheck size={20} />} title={tr('গোপনীয়তা নীতি পড়ুন', 'Read the privacy policy')} />
          </section>

          <section className="card stack" aria-labelledby="set-data">
            <SectionTitle icon={<Database size={20} />} id="set-data">
              {tr('আপনার তথ্য', 'Your data')}
            </SectionTitle>
            <p className="small muted">{tr('এই প্রোটোটাইপের সব তথ্য শুধু এই ব্রাউজারে আছে।', 'Everything in this prototype is stored only in this browser.')}</p>
            <button type="button" className="btn outline" onClick={download}>
              <Download size={18} aria-hidden="true" /> {tr('আমার তথ্য ডাউনলোড (JSON)', 'Download my data (JSON)')}
            </button>
            <button type="button" className="btn outline-danger" onClick={() => setConfirm('delete')}>
              <Trash2 size={18} aria-hidden="true" /> {tr('এই ডিভাইস থেকে আমার তথ্য মুছুন', 'Delete my data from this device')}
            </button>
          </section>

          <section className="card stack" aria-labelledby="set-account">
            <SectionTitle icon={<User size={20} />} id="set-account">
              {tr('অ্যাকাউন্ট', 'Account')}
            </SectionTitle>
            {state.session.loggedIn ? (
              <>
                <LinkRow to="/profile" icon={<User size={20} />} title={state.profile.name} sub={tr(`যাচাইয়ের স্তর ${n(state.profile.tier)}`, `Verification level ${state.profile.tier}`)} />
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => {
                    set((d) => {
                      d.session.loggedIn = false;
                    });
                    toast(tr('সাইন আউট হয়েছে', 'Signed out'), 'info');
                    nav('/');
                  }}
                >
                  <LogOut size={18} aria-hidden="true" /> {tr('সাইন আউট', 'Sign out')}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn primary">
                <LogIn size={18} aria-hidden="true" /> {tr('সাইন ইন', 'Sign in')}
              </Link>
            )}
          </section>

          <section className="card stack" aria-labelledby="set-demo" style={{ borderStyle: 'dashed' }}>
            <SectionTitle icon={<FlaskConical size={20} />} id="set-demo">
              {tr('ডেমো নিয়ন্ত্রণ', 'Demo controls')} <DemoTag />
            </SectionTitle>
            <Switch
              checked={s.simulateFailure}
              onChange={(v) =>
                set((d) => {
                  d.settings.simulateFailure = v;
                })
              }
              label={tr('নেটওয়ার্ক ব্যর্থতা অনুকরণ', 'Simulate network failure')}
              description={tr('চালু থাকলে জমা, পরিশোধ ও OTP ব্যর্থ হবে, যাতে ত্রুটি ও আবার-চেষ্টা দেখা যায়', 'When on, submissions, payments and OTP fail so error and retry states can be seen')}
            />
            <button type="button" className="btn outline" onClick={() => setConfirm('reset')}>
              <RotateCcw size={18} aria-hidden="true" /> {tr('ডেমো তথ্য আগের অবস্থায় ফেরান', 'Reset demo data')}
            </button>
            <div className="grid-2">
              <Link to="/officer" className="btn ghost">
                {tr('অফিসার অ্যাপ', 'Officer app')}
              </Link>
              <Link to="/admin" className="btn ghost">
                {tr('কন্ট্রোল রুম', 'Control room')}
              </Link>
            </div>
            <p className="tiny muted">Hello DMP · RoadSmart {tr('প্রোটোটাইপ', 'prototype')} v1.0</p>
          </section>
        </div>
      </div>

      <Sheet open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'delete' ? tr('তথ্য মুছবেন?', 'Delete your data?') : tr('ডেমো রিসেট করবেন?', 'Reset the demo?')}>
        <div className="stack">
          <p>
            {confirm === 'delete'
              ? tr('আপনার রিপোর্ট, পরিশোধ, পথ, সেটিংস ও অনুমতি এই ডিভাইস থেকে মুছে যাবে এবং অ্যাপ শুরু থেকে চালু হবে।', 'Your reports, payments, routes, settings and permissions will be removed from this device and the app will start from the beginning.')
              : tr('সব রিপোর্ট, মামলা, পরিশোধ ও নোটিফিকেশন নমুনা অবস্থায় ফিরে যাবে। ভাষা ও অনুমতি একই থাকবে।', 'All reports, cases, payments and notifications return to the sample state. Language and permissions stay as they are.')}
          </p>
          <div className="btn-row">
            <button type="button" className="btn outline" onClick={() => setConfirm(null)}>
              {tr('বাতিল', 'Cancel')}
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                const full = confirm === 'delete';
                setConfirm(null);
                reset({ full });
                toast(full ? tr('তথ্য মুছে ফেলা হয়েছে', 'Your data was deleted') : tr('ডেমো তথ্য রিসেট হয়েছে', 'Demo data was reset'));
                nav('/');
              }}
            >
              {confirm === 'delete' ? tr('মুছে ফেলুন', 'Delete') : tr('রিসেট', 'Reset')}
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
