import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Siren, X } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, ErrorBanner, PageHeader, Switch } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { useContactSheet } from '../../components/Contact';
import { SOS_TYPES } from '../../data/catalog';
import { usePosition } from './Thana';
import { nearestThanas } from '../../services/geo';
import { nearestOfficers } from '../../services/workflow';
import { simulate, SimulatedNetworkError } from '../../services/api';
import { formatPhone } from '../../lib/format';

/** Emergency assistance (proposal p.35, SG-017). In the prototype the alert goes only to the demo control room. */
export default function Sos() {
  const { state, update, toast } = useApp();
  const { tr, tx, n, lang, time } = useI18n();
  const { pos, rationale } = usePosition();
  const contact = useContactSheet();
  const [type, setType] = useState(SOS_TYPES[0].id);
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number>();
  const active = state.sosEvents.find((s) => s.status === 'active');

  useEffect(() => () => window.clearInterval(timer.current), []);

  const send = async () => {
    const p = pos ?? { lat: 23.7383, lng: 90.4006 };
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure, delay: 400 });
      const thana = nearestThanas(p, 1)[0];
      const officer = nearestOfficers(state.officers, p)[0];
      update((d) => {
        d.sosEvents.unshift({ id: `SOS${d.sosEvents.length + 1}`, type, at: new Date().toISOString(), lat: p.lat, lng: p.lng, thanaId: thana.id, status: 'active', sharing: true, assignedOfficerId: officer?.id });
      });
      setFailed(false);
    } catch (e) {
      if (e instanceof SimulatedNetworkError) setFailed(true);
    }
  };

  const start = () => {
    setCount(3);
    timer.current = window.setInterval(() => {
      setCount((c) => {
        if (c === null) return null;
        if (c <= 1) {
          window.clearInterval(timer.current);
          void send();
          return null;
        }
        return c - 1;
      });
    }, 1000);
  };
  const cancel = () => {
    window.clearInterval(timer.current);
    setCount(null);
  };

  const stop = () => {
    update((d) => {
      const s = d.sosEvents.find((x) => x.status === 'active');
      if (s) {
        s.status = 'closed';
        s.sharing = false;
      }
    });
    toast(tr('SOS বন্ধ হয়েছে; অবস্থান শেয়ার বন্ধ', 'SOS closed; location sharing stopped'), 'info');
  };

  const near = pos ? nearestThanas(pos, 2) : [];
  const officer = active ? state.officers.find((o) => o.id === active.assignedOfficerId) : undefined;

  return (
    <div className="sos-page">
      <PageHeader title={tr('জরুরি সাহায্য', 'Emergency help')} />
      <div className="content stack-lg" style={{ maxWidth: 560 }}>
        {active ? (
          <>
            <div className="card danger stack" style={{ color: 'var(--text)' }}>
              <div className="row">
                <Siren size={24} color="var(--sos)" aria-hidden="true" />
                <strong className="grow">{tr('SOS চালু আছে', 'SOS is active')}</strong>
                <span className="small">{time(active.at)}</span>
              </div>
              <p className="small">
                {tr(
                  'প্রোটোটাইপ: সংকেতটি শুধু এই ডেমোর কন্ট্রোল রুম ভিউতে গেছে। কোনো আসল পুলিশ ইউনিট জানে না। সত্যিকারের বিপদে এখনই ৯৯৯-এ কল করুন।',
                  'Prototype: the alert went only to this demo’s control-room view. No real police unit has been told. In a real emergency, call 999 now.',
                )}
              </p>
              <div className="kv">
                <div>{tr('ধরন', 'Type')}</div>
                <div>{tx(SOS_TYPES.find((s) => s.id === active.type)?.label)}</div>
                <div>{tr('নিকটস্থ থানা', 'Nearest thana')}</div>
                <div>{tx(nearestThanas(active, 1)[0].name)}</div>
                <div>{tr('প্রস্তাবিত ইউনিট (ডেমো)', 'Suggested unit (demo)')}</div>
                <div>{officer ? tx(officer.name) : '—'}</div>
              </div>
              <Switch
                checked={active.sharing}
                onChange={(v) =>
                  update((d) => {
                    const s = d.sosEvents.find((x) => x.id === active.id);
                    if (s) s.sharing = v;
                  })
                }
                label={tr('লাইভ অবস্থান শেয়ার', 'Share live location')}
                description={tr('শুধু এই ঘটনার জন্য; SOS বন্ধ করলে থেমে যায়', 'For this incident only; stops when SOS ends')}
              />
              <button type="button" className="btn outline-danger" onClick={stop}>
                <X size={18} aria-hidden="true" />
                {tr('আমি নিরাপদ: SOS বন্ধ করুন', 'I am safe: end SOS')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{tr('ধরন বেছে নিন, তারপর বড় বোতাম চাপুন', 'Choose what happened, then press the big button')}</p>
            <div className="grid-2" role="radiogroup" aria-label={tr('জরুরি অবস্থার ধরন', 'Type of emergency')}>
              {SOS_TYPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={type === s.id}
                  className="choice"
                  style={type === s.id ? { background: '#fff', color: '#111', borderColor: '#fff' } : { background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
                  onClick={() => setType(s.id)}
                >
                  <Icon name={s.icon} size={18} />
                  {tx(s.label)}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', placeItems: 'center', padding: '12px 0' }}>
              {count === null ? (
                <button
                  type="button"
                  onClick={start}
                  style={{ width: 200, height: 200, borderRadius: '50%', border: '10px solid rgba(255,255,255,.15)', background: 'var(--sos)', color: '#fff', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 12px rgba(208,16,43,.25)' }}
                >
                  <span>
                    <Siren size={40} style={{ margin: '0 auto 6px' }} aria-hidden="true" />
                    {tr('সাহায্য চাই', 'I need help')}
                  </span>
                </button>
              ) : (
                <div className="stack" style={{ alignItems: 'center' }} role="alert">
                  <div style={{ width: 200, height: 200, borderRadius: '50%', background: '#fff', color: 'var(--sos)', display: 'grid', placeItems: 'center', fontSize: '4rem', fontWeight: 800 }}>{n(count)}</div>
                  <button type="button" className="btn" style={{ background: '#fff', color: '#111' }} onClick={cancel}>
                    {tr('বাতিল করুন', 'Cancel')}
                  </button>
                </div>
              )}
            </div>
            {failed && <ErrorBanner onRetry={() => void send()} text={tr('SOS পাঠানো যায়নি (ডেমো নেটওয়ার্ক ব্যর্থতা)। ৯৯৯-এ কল করুন বা আবার চেষ্টা করুন।', 'SOS could not be sent (demo network failure). Call 999 or try again.')} />}
            <div className="row small" style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '10px 12px' }}>
              <MapPin size={16} aria-hidden="true" />
              {tr('লাইভ লোকেশন শুধু এই ঘটনার জন্য শেয়ার হবে', 'Live location is shared for this incident only')}
            </div>
            <Banner tone="warn">{tr('প্রোটোটাইপ: এই বোতাম কোনো আসল পুলিশকে জানায় না।', 'Prototype: this button does not alert real police.')}</Banner>
          </>
        )}

        <button type="button" className="btn block" style={{ background: '#fff', color: 'var(--sos)' }} onClick={() => contact.open({ kind: 'tel', value: '999', label: tr('জাতীয় জরুরি সেবা ৯৯৯', 'National emergency 999') })}>
          <Phone size={18} aria-hidden="true" />
          {tr('৯৯৯-এ কল করুন', 'Call 999')}
        </button>
        {near.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="small" style={{ opacity: 0.85 }}>
              {tr('কাছের থানা', 'Nearest thanas')}
            </div>
            {near.map((t) => (
              <button key={t.id} type="button" className="list-row" style={{ borderRadius: 12 }} onClick={() => contact.open({ kind: 'tel', value: t.phone, label: tx(t.name) })}>
                <span className="lr-icon">
                  <Building2 size={18} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tx(t.name)}
                  </span>
                  <span className="lr-sub">
                    {tr(`${n(t.km.toFixed(1))} কিমি`, `${t.km.toFixed(1)} km`)} · {formatPhone(t.phone, lang)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        <Link to="/emergency" style={{ color: '#fff' }} className="small">
          {tr('সব জরুরি নম্বর', 'All emergency numbers')}
        </Link>
      </div>
      {contact.sheet}
      {rationale}
    </div>
  );
}
