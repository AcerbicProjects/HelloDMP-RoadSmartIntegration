import { Link } from 'react-router-dom';
import { Bell, CarFront, ChevronRight, ClipboardList, FileWarning, GraduationCap, IdCard, LayoutGrid, MessageSquareText, QrCode, ScanLine, Search, Sparkles, TriangleAlert } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { LangToggle } from '../../components/AppShell';
import { CyberArt, HeroArt, OfficerFigure, OnlineServiceArt, ShieldArt, TrafficLightArt, WomenChildArt } from '../../components/Art';
import { SeverityBadge } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { ALERT_TYPES, SEVERITY, VIOLATIONS } from '../../data/catalog';
import { daysUntil } from '../../lib/format';

/** The six module tiles exactly as labelled in the existing app (screenshot 21637a0e). */
const MODULES = [
  { to: '/online-services', label: { bn: 'অনলাইন সেবা', en: 'Online Services' }, tile: 'var(--tile-cream)', art: <OnlineServiceArt /> },
  { to: '/cyber', label: { bn: 'সাইবার ক্রাইম', en: 'Cyber Crime' }, tile: 'var(--tile-aqua)', art: <CyberArt /> },
  { to: '/women-child', label: { bn: 'নারী, শিশু ও গৃহকর্মী নির্যাতন', en: 'Women, Child & Domestic Worker Abuse' }, tile: 'var(--tile-ice)', art: <WomenChildArt /> },
  { to: '/traffic', label: { bn: 'ডিএমপি ট্রাফিক', en: 'DMP Traffic' }, tile: 'var(--tile-cream)', art: <TrafficLightArt /> },
  { to: '/complaint', label: { bn: 'আপনার অভিযোগ', en: 'Your Complaint' }, tile: 'var(--tile-lime)', art: <ShieldArt /> },
  { to: '/thana', label: { bn: 'নিকটস্থ থানা', en: 'Nearest Thana' }, tile: 'var(--tile-rose)', art: <ShieldArt ribbon /> },
];

export default function Home() {
  const { state } = useApp();
  const { tr, tx, n, ago, taka } = useI18n();
  const unread = state.notifications.filter((x) => !x.read).length;
  const { profile, session } = state;
  const loggedIn = session.loggedIn;
  const unpaid = profile.tier >= 2 ? state.cases.filter((c) => c.status === 'unpaid' && c.officerVerified && profile.vehicleIds.includes(c.vehicleId)) : [];
  const licenceDays = profile.license ? daysUntil(profile.license.validUntil) : undefined;
  const activeSos = state.sosEvents.find((s) => s.status === 'active');
  const myOpenReports = state.reports.filter((r) => r.mine && !['resolved', 'rejected'].includes(r.status));
  const alerts = state.alerts
    .filter((a) => a.status === 'active')
    .sort((a, b) => SEVERITY[b.severity].rank - SEVERITY[a.severity].rank)
    .slice(0, 3);
  const hour = new Date().getHours();
  const greet = hour < 12 ? tr('শুভ সকাল', 'Good morning') : hour < 17 ? tr('শুভ বিকেল', 'Good afternoon') : tr('শুভ সন্ধ্যা', 'Good evening');
  const tierLabel = [tr('স্তর ১ · মোবাইল OTP', 'Level 1 · mobile OTP'), tr('স্তর ২ · NID যাচাই', 'Level 2 · NID verified'), tr('স্তর ৩ · NID, লাইসেন্স, গাড়ি', 'Level 3 · NID, licence, vehicle')][profile.tier - 1];

  return (
    <div>
      <section className="home-hero" aria-label="Hello DMP">
        <HeroArt />
        <div className="hero-inner">
          <div className="hero-top">
            <Link to="/menu" className="icon-btn" style={{ color: '#fff', background: 'rgba(0,0,0,.18)' }} aria-label={tr('সব সেবা', 'All services')}>
              <LayoutGrid size={22} />
            </Link>
            <div className="row" style={{ gap: 6 }}>
              <LangToggle />
              <Link to="/notifications" className="icon-btn" style={{ color: '#fff', background: 'rgba(0,0,0,.18)' }} aria-label={tr(`নোটিফিকেশন, ${unread}টি নতুন`, `Notifications, ${unread} new`)}>
                <Bell size={22} />
                {unread > 0 && <span className="dot">{n(unread)}</span>}
              </Link>
            </div>
          </div>
          <div className="hero-title">Hello DMP</div>
        </div>
        <div className="welcome-card">
          <h2>
            <Sparkles size={30} aria-hidden="true" />
            {tr('স্বাগতম ডিএমপি', 'Welcome to DMP')}
          </h2>
          <OfficerFigure className="officer decor" />
          {/* The bubble now opens a working assistant instead of only implying one (IM-004). */}
          <Link to="/assistant" className="bubble" style={{ textDecoration: 'none' }}>
            {tr('হ্যালো!\nআমি ঢাকা মেট্রোপলিটন পুলিশের বিভিন্ন সেবা ও তথ্য বিষয়ে আপনাকে জানাতে প্রস্তুত।', 'Hello!\nI am ready to tell you about the services and information of Dhaka Metropolitan Police.')
              .split('\n')
              .map((l) => (
                <span key={l} style={{ display: 'block' }}>
                  {l}
                </span>
              ))}
            <span className="ask">
              {tr('প্রশ্ন করুন', 'Ask a question')} <ChevronRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      <div className="content stack-lg" style={{ paddingTop: 40 }}>
        <Link to="/search" className="search-box" aria-label={tr('সেবা, থানা বা প্রশ্ন খুঁজুন', 'Search services, thanas or questions')}>
          <Search size={20} aria-hidden="true" />
          <span>{tr('সেবা, থানা বা প্রশ্ন খুঁজুন…', 'Search services, thanas or questions…')}</span>
        </Link>

        <div className="cols">
          <div className="stack-lg">
            <section aria-labelledby="modules-h">
              <h2 id="modules-h" className="sr-only">
                {tr('সেবাসমূহ', 'Services')}
              </h2>
              <div className="module-grid">
                {MODULES.map((m) => (
                  <Link key={m.to} to={m.to} className="module-tile" style={{ background: m.tile }}>
                    <span className="art">{m.art}</span>
                    <span className="label">{tx(m.label)}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="rs-h" className="stack">
              <div>
                <span className="tag-heading" id="rs-h">
                  {tr('রোডস্মার্ট', 'RoadSmart')}
                </span>
                <div className="tag-rule" />
              </div>
              <div className="quick-grid">
                <Link className="quick" to="/report">
                  <span className="q-icon">
                    <FileWarning size={20} aria-hidden="true" />
                  </span>
                  {tr('রিপোর্ট করুন', 'Report')}
                </Link>
                <Link className="quick" to="/reports">
                  <span className="q-icon">
                    <ClipboardList size={20} aria-hidden="true" />
                  </span>
                  {tr('আমার রিপোর্ট', 'My reports')}
                </Link>
                <Link className="quick" to="/cases">
                  <span className="q-icon">
                    <CarFront size={20} aria-hidden="true" />
                  </span>
                  {tr('মামলা ও জরিমানা', 'Cases & fines')}
                </Link>
                <Link className="quick" to="/sms-check">
                  <span className="q-icon">
                    <MessageSquareText size={20} aria-hidden="true" />
                  </span>
                  {tr('SMS যাচাই', 'SMS check')}
                </Link>
                <Link className="quick" to="/wallet">
                  <span className="q-icon">
                    <QrCode size={20} aria-hidden="true" />
                  </span>
                  {tr('QR ওয়ালেট', 'QR wallet')}
                </Link>
                <Link className="quick" to="/rickshaw">
                  <span className="q-icon">
                    <ScanLine size={20} aria-hidden="true" />
                  </span>
                  {tr('ই-রিক্সা স্ক্যান', 'e-Rickshaw scan')}
                </Link>
                <Link className="quick" to="/learn">
                  <span className="q-icon">
                    <GraduationCap size={20} aria-hidden="true" />
                  </span>
                  {tr('শিখুন ও সনদ', 'Learn & certificate')}
                </Link>
                <Link className="quick" to="/assistant">
                  <span className="q-icon">
                    <Sparkles size={20} aria-hidden="true" />
                  </span>
                  {tr('আইন সহকারী', 'Law assistant')}
                </Link>
              </div>
            </section>
          </div>

          <div className="stack-lg">
            <section className="card tinted stack" aria-labelledby="acct-h">
              <div className="row between">
                <div>
                  <div className="small muted">{greet},</div>
                  <h2 id="acct-h" style={{ fontSize: '1.15rem' }}>
                    {loggedIn ? profile.name : tr('অতিথি', 'Guest')}
                  </h2>
                </div>
                {loggedIn ? (
                  <Link to="/profile" className="badge warn" style={{ textDecoration: 'none' }}>
                    <IdCard size={14} aria-hidden="true" /> {tierLabel}
                  </Link>
                ) : (
                  <Link to="/login" className="btn small primary">
                    {tr('লগইন', 'Sign in')}
                  </Link>
                )}
              </div>
              {!loggedIn && <p className="small muted">{tr('মোবাইল নম্বর দিয়ে লগইন করলে রিপোর্ট ট্র্যাক, মামলা দেখা ও পরিশোধ করা যাবে।', 'Sign in with your mobile number to track reports, see cases and pay fines.')}</p>}
              {loggedIn && (
                <div className="btn-row">
                  <Link to="/wallet" className="btn small outline">
                    <QrCode size={16} aria-hidden="true" /> {tr('QR ওয়ালেট', 'QR wallet')}
                  </Link>
                  <Link to="/cases" className="btn small outline">
                    <CarFront size={16} aria-hidden="true" /> {tr(`আমার গাড়ি (${n(profile.vehicleIds.length)})`, `My vehicles (${profile.vehicleIds.length})`)}
                  </Link>
                </div>
              )}
            </section>

            {(activeSos || unpaid.length > 0 || (licenceDays !== undefined && licenceDays <= 30) || myOpenReports.length > 0) && (
              <section aria-labelledby="todo-h" className="stack">
                <div>
                  <span className="tag-heading" id="todo-h">
                    {tr('অপেক্ষমাণ কাজ', 'Waiting for you')}
                  </span>
                  <div className="tag-rule" />
                </div>
                <div className="list">
                  {activeSos && (
                    <Link className="list-row" to="/sos">
                      <span className="lr-icon" style={{ background: 'var(--danger-50)', color: 'var(--sos)' }}>
                        <TriangleAlert size={20} aria-hidden="true" />
                      </span>
                      <span className="grow">
                        <span className="lr-title" style={{ display: 'block' }}>
                          {tr('SOS চালু আছে', 'SOS is active')}
                        </span>
                        <span className="lr-sub">{tr('অবস্থান শেয়ার হচ্ছে · বন্ধ করতে খুলুন', 'Location is being shared · open to stop')}</span>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  )}
                  {unpaid.slice(0, 2).map((c) => (
                    <Link key={c.id} className="list-row" to={`/cases/${c.id}`}>
                      <span className="lr-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger)' }}>
                        <Icon name={VIOLATIONS[c.violation].icon} size={20} />
                      </span>
                      <span className="grow">
                        <span className="lr-title" style={{ display: 'block' }}>
                          {tr('নতুন মামলা · পরিশোধ বাকি', 'New case · payment due')}
                        </span>
                        <span className="lr-sub">
                          {tx(VIOLATIONS[c.violation].name)} · {taka(c.amount)}
                        </span>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  ))}
                  {licenceDays !== undefined && licenceDays <= 30 && (
                    <Link className="list-row" to="/wallet">
                      <span className="lr-icon" style={{ background: '#fff3cc', color: '#8a4b00' }}>
                        <IdCard size={20} aria-hidden="true" />
                      </span>
                      <span className="grow">
                        <span className="lr-title" style={{ display: 'block' }}>
                          {tr('লাইসেন্স নবায়ন', 'Licence renewal')}
                        </span>
                        <span className="lr-sub">{tr(`মেয়াদ শেষ হতে ${n(licenceDays)} দিন বাকি`, `${licenceDays} days until expiry`)}</span>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  )}
                  {myOpenReports.slice(0, 2).map((r) => (
                    <Link key={r.id} className="list-row" to={`/reports/${r.id}`}>
                      <span className="lr-icon">
                        <ClipboardList size={20} aria-hidden="true" />
                      </span>
                      <span className="grow">
                        <span className="lr-title" style={{ display: 'block' }}>
                          {tr(`রিপোর্ট #${n(r.ref.slice(-3))}`, `Report #${r.ref.slice(-3)}`)}
                        </span>
                        <span className="lr-sub">
                          {tx(r.locationLabel)} · {ago(r.timeline[r.timeline.length - 1]?.at ?? r.createdAt)}
                        </span>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="alerts-h" className="stack">
              <h2 className="section-title" id="alerts-h">
                {tr('যাচাই করা সতর্কতা', 'Verified alerts')}
                <Link to="/alerts">{tr('মানচিত্রে দেখুন', 'View on map')}</Link>
              </h2>
              <div className="list">
                {alerts.map((a) => (
                  <Link key={a.id} className="list-row" to={`/alerts/${a.id}`}>
                    <span className="lr-icon">
                      <Icon name={ALERT_TYPES[a.type].icon} size={20} />
                    </span>
                    <span className="grow">
                      <span className="lr-title" style={{ display: 'block' }}>
                        {tx(a.title)}
                      </span>
                      <span className="lr-sub">
                        {tr('DMP যাচাইকৃত', 'DMP verified')} · {ago(a.createdAt)}
                      </span>
                    </span>
                    <SeverityBadge severity={a.severity} />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
