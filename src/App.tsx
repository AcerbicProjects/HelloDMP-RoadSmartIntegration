import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { SignpostBig } from 'lucide-react';
import { useApp } from './store/AppStore';
import { useI18n } from './lib/i18n';
import { CitizenShell, useDocumentSettings } from './components/AppShell';
import { Empty, PageHeader } from './components/ui';
import { Onboarding, Splash } from './pages/citizen/Onboarding';
import Home from './pages/citizen/Home';
import { ActPage, Complaint, CyberCrime, Emergency, Faq, OnlineServices, TrafficHub, WomenChild } from './pages/citizen/Directory';
import ThanaPage from './pages/citizen/Thana';
import Alerts, { AlertDetail, RoutesPage } from './pages/citizen/Alerts';
import ReportPage from './pages/citizen/Report';
import MyReports, { ReportDetail } from './pages/citizen/MyReports';
import Sos from './pages/citizen/Sos';
import JointReport from './pages/citizen/JointReport';
import Cases, { CaseDetail, NominatePage, ObjectionPage, PayPage, ReceiptPage, ViolationsPage } from './pages/citizen/Cases';
import { Login, Profile, VerifyIdentity, Wallet } from './pages/citizen/Account';
import Assistant from './pages/citizen/Assistant';
import { RickshawComplaint, RickshawInfo, RickshawScan, SmsCheckPage } from './pages/citizen/SmsRickshaw';
import Learn, { CertificatePage, GuidePage, LessonPage, QuizPage, SignsPage } from './pages/citizen/Learn';
import { Announcements, Feedback, Notifications } from './pages/citizen/Inbox';
import SettingsPage, { PrivacyPage } from './pages/citizen/Settings';
import { Menu, Search } from './pages/citizen/Explore';

// Staff views are separate bundles: most citizens never load them.
const OfficerRoot = lazy(() => import('./pages/officer/Officer'));
const AdminRoot = lazy(() => import('./pages/admin/Admin'));

function NotFound() {
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('পাতা পাওয়া যায়নি', 'Page not found')} />
      <div className="content">
        <Empty
          icon={<SignpostBig size={28} />}
          title={tr('এই ঠিকানায় কোনো পাতা নেই', 'There is no page at this address')}
          action={
            <Link to="/" className="btn primary small">
              {tr('হোমে যান', 'Go home')}
            </Link>
          }
        />
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="content stack" aria-busy="true" aria-live="polite">
      <div className="skeleton" style={{ height: 64 }} />
      <div className="skeleton" style={{ height: 180 }} />
      <div className="skeleton" style={{ height: 120 }} />
    </div>
  );
}

function CitizenRoutes() {
  return (
    <CitizenShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/search" element={<Search />} />
        <Route path="/online-services" element={<OnlineServices />} />
        <Route path="/cyber" element={<CyberCrime />} />
        <Route path="/women-child" element={<WomenChild />} />
        <Route path="/traffic" element={<TrafficHub />} />
        <Route path="/traffic/act" element={<ActPage />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/thana" element={<ThanaPage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetail />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/report/joint" element={<JointReport />} />
        <Route path="/reports" element={<MyReports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/sos" element={<Sos />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/cases/:id/pay" element={<PayPage />} />
        <Route path="/cases/:id/object" element={<ObjectionPage />} />
        <Route path="/cases/:id/nominate" element={<NominatePage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/violations" element={<ViolationsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/verify" element={<VerifyIdentity />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/sms-check" element={<SmsCheckPage />} />
        <Route path="/rickshaw" element={<RickshawScan />} />
        <Route path="/rickshaw/:reg" element={<RickshawInfo />} />
        <Route path="/rickshaw/:reg/complain" element={<RickshawComplaint />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/lesson/:id" element={<LessonPage />} />
        <Route path="/learn/quiz" element={<QuizPage />} />
        <Route path="/learn/certificate" element={<CertificatePage />} />
        <Route path="/learn/signs" element={<SignsPage />} />
        <Route path="/learn/guide/:id" element={<GuidePage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CitizenShell>
  );
}

export default function App() {
  useDocumentSettings();
  const { state } = useApp();
  const loc = useLocation();
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 700);
    return () => window.clearTimeout(t);
  }, []);
  const staff = loc.pathname.startsWith('/officer') || loc.pathname.startsWith('/admin');

  if (splash && !staff) return <Splash />;
  if (staff)
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/officer/*" element={<OfficerRoot />} />
          <Route path="/admin/*" element={<AdminRoot />} />
        </Routes>
      </Suspense>
    );
  if (!state.settings.onboarded) return <Onboarding />;
  return <CitizenRoutes />;
}
