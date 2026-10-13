import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Info, Plus, Siren, WifiOff, X } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useI18n } from '../lib/i18n';
import { BOTTOM_NAV, CITIZEN_NAV } from './nav';

/** Applies language, text size, contrast and low-bandwidth settings to the document (SG-003, SG-031, SG-033, SG-043). */
export function useDocumentSettings() {
  const { state } = useApp();
  const s = state.settings;
  useEffect(() => {
    const root = document.documentElement;
    root.lang = s.lang;
    root.style.setProperty('--text-scale', String(s.textScale));
    root.dataset.contrast = s.highContrast ? 'high' : 'normal';
    root.dataset.lowbw = String(s.lowBandwidth);
  }, [s.lang, s.textScale, s.highContrast, s.lowBandwidth]);
}

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function LangToggle() {
  const { state, update } = useApp();
  const lang = state.settings.lang;
  const set = (l: 'bn' | 'en') =>
    update((d) => {
      d.settings.lang = l;
    });
  return (
    <div className="lang-toggle" role="group" aria-label="Language / ভাষা">
      <button type="button" aria-pressed={lang === 'en'} onClick={() => set('en')} lang="en">
        EN
      </button>
      <button type="button" aria-pressed={lang === 'bn'} onClick={() => set('bn')} lang="bn">
        বাং
      </button>
    </div>
  );
}

/** Thin dark strip that keeps the prototype honest: demo data, switchable views, quick reset. */
export function DemoRibbon() {
  const { state } = useApp();
  const { tr } = useI18n();
  const loc = useLocation();
  const view = loc.pathname.startsWith('/officer') ? 'officer' : loc.pathname.startsWith('/admin') ? 'admin' : 'citizen';
  return (
    <div className="demo-ribbon no-print">
      <span>
        {tr('প্রোটোটাইপ · নমুনা তথ্য, কোনো আসল সার্ভারে কিছু যায় না', 'Prototype · sample data, nothing is sent to a real server')}
        {state.settings.simulateFailure && <strong style={{ color: '#ffb4b4' }}> · {tr('নেটওয়ার্ক ব্যর্থতা চালু', 'network failure ON')}</strong>}
      </span>
      <nav aria-label={tr('ডেমো ভিউ', 'Demo views')} className="row" style={{ gap: 2 }}>
        <Link to="/" style={{ color: view === 'citizen' ? '#fff' : 'var(--gold)', fontWeight: view === 'citizen' ? 800 : 400 }} aria-current={view === 'citizen' ? 'page' : undefined}>
          {tr('নাগরিক', 'Citizen')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link to="/officer" style={{ color: view === 'officer' ? '#fff' : 'var(--gold)', fontWeight: view === 'officer' ? 800 : 400 }} aria-current={view === 'officer' ? 'page' : undefined}>
          {tr('অফিসার', 'Officer')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link to="/admin" style={{ color: view === 'admin' ? '#fff' : 'var(--gold)', fontWeight: view === 'admin' ? 800 : 400 }} aria-current={view === 'admin' ? 'page' : undefined}>
          {tr('কন্ট্রোল রুম', 'Control room')}
        </Link>
      </nav>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  const { tr } = useI18n();
  return (
    <div className="toasts" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone === 'error' ? 'error' : ''}`}>
          {t.tone === 'error' ? <CircleAlert size={18} aria-hidden="true" /> : t.tone === 'info' ? <Info size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
          <span>{t.text}</span>
          <button type="button" aria-label={tr('বন্ধ করুন', 'Dismiss')} onClick={() => dismissToast(t.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function OfflineBanner() {
  const online = useOnline();
  const { tr } = useI18n();
  if (online) return null;
  return (
    <div className="banner warn" role="status" style={{ borderRadius: 0 }}>
      <WifiOff size={18} aria-hidden="true" />
      <span>
        {tr(
          'আপনি অফলাইনে আছেন। থানা, জরুরি নম্বর, FAQ ও শেখার পাঠ দেখা যাবে; নতুন রিপোর্ট খসড়া হিসেবে থাকবে।',
          'You are offline. Thanas, emergency numbers, FAQs and lessons still work; new reports are kept as drafts.',
        )}
      </span>
    </div>
  );
}

function SideNav() {
  const { tx, tr } = useI18n();
  const { state } = useApp();
  const unread = state.notifications.filter((n) => !n.read).length;
  return (
    <nav className="side-nav no-print" aria-label={tr('প্রধান মেনু', 'Main menu')}>
      <Link to="/" className="brand">
        <img src="./dmp-badge.svg" alt="" width={36} height={36} />
        <span>
          <strong>Hello DMP</strong>
          <span className="tiny muted" style={{ display: 'block' }}>
            {tr('রোডস্মার্টসহ', 'with RoadSmart')}
          </span>
        </span>
      </Link>
      {CITIZEN_NAV.map((g) => (
        <div key={g.group.en}>
          <div className="group-label">{tx(g.group)}</div>
          {g.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === '/'}>
              <it.icon size={19} aria-hidden="true" />
              <span className="grow">{tx(it.label)}</span>
              {it.to === '/notifications' && unread > 0 && <span className="badge danger">{unread}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function BottomNav() {
  const { tx, tr } = useI18n();
  return (
    <nav className="bottom-nav no-print" aria-label={tr('প্রধান মেনু', 'Main menu')}>
      {BOTTOM_NAV.map((it) =>
        it.to === '/report' ? (
          <NavLink key={it.to} to={it.to} className="report-tab">
            <span className="plus">
              <Plus size={26} aria-hidden="true" />
            </span>
            <span>{tx(it.label)}</span>
          </NavLink>
        ) : (
          <NavLink key={it.to} to={it.to} end={it.to === '/'}>
            <it.icon size={22} aria-hidden="true" />
            <span>{tx(it.label)}</span>
          </NavLink>
        ),
      )}
    </nav>
  );
}

/** Citizen layout: side menu on desktop, bottom bar on phones, floating SOS everywhere except the SOS screens. */
export function CitizenShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const { tr } = useI18n();
  const hideSos = ['/sos', '/emergency', '/report/joint'].some((p) => loc.pathname.startsWith(p));
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {tr('মূল অংশে যান', 'Skip to content')}
      </a>
      <SideNav />
      <div className="main-col">
        <DemoRibbon />
        <OfflineBanner />
        <main id="main" tabIndex={-1} className={hideSos ? undefined : 'with-fab'} style={{ outline: 'none' }}>
          {children}
        </main>
      </div>
      <BottomNav />
      {!hideSos && (
        <Link to="/sos" className="sos-fab no-print" aria-label={tr('জরুরি সাহায্য (SOS)', 'Emergency help (SOS)')}>
          <Siren size={20} aria-hidden="true" />
          SOS
        </Link>
      )}
      <Toasts />
    </div>
  );
}
