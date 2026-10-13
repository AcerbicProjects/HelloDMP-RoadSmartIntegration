// Screens that exist in the current Hello DMP app (screenshots 75a8ed72, 59d864c8, 0ce66abe, 934eff64; APK layouts),
// kept recognisable and extended with the in-app forms and tracking the workbook asks for (IM-001, IM-002, IM-005).
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CarFront,
  ClipboardList,
  ExternalLink,
  FileWarning,
  Gauge,
  GraduationCap,
  Mail,
  Map,
  MessageSquareText,
  Phone,
  ScanLine,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  TrafficCone,
  Users,
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { useApp } from '../../store/AppStore';
import { Banner, Empty, LinkRow, PageHeader, Sheet } from '../../components/ui';
import { ContactCard, useContactSheet } from '../../components/Contact';
import { Icon } from '../../components/Icon';
import { CONTACTS, EMERGENCY_NUMBERS, ONLINE_SERVICES } from '../../data/directory';
import { FAQS } from '../../data/faqs';
import { formatPhone } from '../../lib/format';
import { DEMO_POSITION, nearestThanas } from '../../services/geo';

function FacebookIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" fill="#fff">
      <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9H17l.5-4h-4V8.8c0-.5.3-.8.5-.8z" />
    </svg>
  );
}

export function CyberCrime() {
  const { tr, lang } = useI18n();
  const contact = useContactSheet();
  return (
    <>
      <PageHeader title={tr('সাইবার ক্রাইম', 'Cyber Crime')} />
      <div className="content stack">
        <ContactCard
          icon={<Phone size={26} />}
          title={tr('হট লাইন নম্বর', 'Hotline number')}
          sub={formatPhone(CONTACTS.cyberHotline, lang).replace('-', '')}
          subClass="phone"
          onClick={() => contact.open({ kind: 'tel', value: CONTACTS.cyberHotline, label: tr('সাইবার হটলাইন', 'Cyber hotline') })}
        />
        <ContactCard
          icon={<Mail size={26} />}
          title={tr('ইমেইল করুন', 'Send an e-mail')}
          sub={CONTACTS.cyberEmail}
          onClick={() => contact.open({ kind: 'mail', value: CONTACTS.cyberEmail, label: tr('সাইবার সাপোর্ট ইমেইল', 'Cyber support e-mail') })}
        />
        <ContactCard icon={<FacebookIcon />} iconClass="fb" title={tr('আমাদের সাথে যোগাযোগ করুন', 'Contact us on Facebook')} href={CONTACTS.cyberFacebook} />

        <h2 className="section-title" style={{ marginTop: 8 }}>
          {tr('অ্যাপেই অভিযোগ করুন', 'Report in the app')}
        </h2>
        <div className="list">
          <LinkRow to="/report?kind=cyber" icon={<FileWarning size={20} />} title={tr('সাইবার অপরাধের অভিযোগ ফর্ম', 'Cyber crime report form')} sub={tr('স্ক্রিনশট যুক্ত করুন, রেফারেন্স নম্বর পান, অবস্থা দেখুন', 'Attach screenshots, get a reference number, follow progress')} />
          <LinkRow to="/sms-check" icon={<MessageSquareText size={20} />} title={tr('সন্দেহজনক SMS যাচাই', 'Check a suspicious SMS')} sub={tr('ভুয়া জরিমানা বার্তা চিনুন', 'Spot fake fine messages')} />
          <LinkRow to="/reports" icon={<ClipboardList size={20} />} title={tr('আমার অভিযোগের অবস্থা', 'Status of my reports')} />
        </div>
      </div>
      {contact.sheet}
    </>
  );
}

export function WomenChild() {
  const { tr, lang } = useI18n();
  const contact = useContactSheet();
  const [divisionOpen, setDivisionOpen] = useState(false);
  return (
    <>
      <PageHeader title={tr('নারী, শিশু ও গৃহকর্মী নির্যাতন', 'Women, Child & Domestic Worker Abuse')} />
      <div className="content stack">
        <ContactCard
          icon={<Phone size={26} />}
          title={tr('জরুরী সেবা পেতে কল করুন: ডিউটি অফিসার:', 'Call for urgent help: duty officer:')}
          sub={formatPhone(CONTACTS.womenDutyOfficer, lang).replace('-', '')}
          subClass="phone"
          onClick={() => contact.open({ kind: 'tel', value: CONTACTS.womenDutyOfficer, label: tr('ডিউটি অফিসার', 'Duty officer') })}
        />
        <ContactCard
          icon={<Mail size={26} />}
          title={tr('ইমেইল করুন', 'Send an e-mail')}
          sub={CONTACTS.womenEmail}
          onClick={() => contact.open({ kind: 'mail', value: CONTACTS.womenEmail, label: tr('ইমেইল', 'E-mail') })}
        />
        <ContactCard icon={<ShieldCheck size={26} />} iconClass="light" title={tr('নারী সহায়তা ও তদন্ত বিভাগ', 'Women Support & Investigation Division')} onClick={() => setDivisionOpen(true)} />

        <Banner tone="brand" icon={<ShieldCheck size={18} aria-hidden="true" />}>
          {tr('এই অভিযোগ গোপন থাকে। আপনার নাম শুধু তদন্তকারী কর্মকর্তা দেখতে পান।', 'These reports are confidential. Only the investigating officer sees your name.')}
        </Banner>
        <div className="list">
          <LinkRow to="/report?kind=women_child" icon={<FileWarning size={20} />} title={tr('গোপনে অভিযোগ জমা দিন', 'Report privately')} sub={tr('ধাপে ধাপে ফর্ম; ছবি বা অবস্থান ঐচ্ছিক', 'Step-by-step form; photo and location optional')} />
          <LinkRow to="/sos" icon={<Siren size={20} />} title={tr('এখনই বিপদে? SOS', 'In danger now? SOS')} sub={tr('অবস্থান শেয়ার করে সাহায্য চান', 'Share your location and ask for help')} />
          <button type="button" className="list-row" onClick={() => contact.open({ kind: 'tel', value: '109', label: tr('নারী ও শিশু হেল্পলাইন', 'Women & child helpline') })}>
            <span className="lr-icon">
              <Phone size={20} aria-hidden="true" />
            </span>
            <span className="grow">
              <span className="lr-title" style={{ display: 'block' }}>
                {tr('জাতীয় হেল্পলাইন ১০৯ (বিনামূল্যে)', 'National helpline 109 (free)')}
              </span>
            </span>
          </button>
        </div>
      </div>
      <Sheet open={divisionOpen} onClose={() => setDivisionOpen(false)} title={tr('নারী সহায়তা ও তদন্ত বিভাগ', 'Women Support & Investigation Division')}>
        <div className="stack">
          <p>
            {tr(
              'নারী, শিশু ও গৃহকর্মীর ওপর সহিংসতার অভিযোগ গ্রহণ, ভুক্তভোগীর সহায়তা ও তদন্ত এই বিভাগ করে। যোগাযোগের জন্য ওপরের ডিউটি অফিসার নম্বর বা ইমেইল ব্যবহার করুন।',
              'This division receives complaints of violence against women, children and domestic workers, supports victims and investigates. Use the duty officer number or e-mail above to reach it.',
            )}
          </p>
          <Link to="/report?kind=women_child" className="btn primary block" onClick={() => setDivisionOpen(false)}>
            {tr('অ্যাপে গোপনে অভিযোগ করুন', 'Report privately in the app')}
          </Link>
          <a className="btn outline block" href={CONTACTS.womenDivisionSite} target="_blank" rel="noopener noreferrer">
            {tr('বিভাগের ওয়েবসাইট (বাইরের লিংক)', 'Division website (external link)')}
          </a>
          <p className="small muted">{CONTACTS.womenDivisionSite.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
        </div>
      </Sheet>
      {contact.sheet}
    </>
  );
}

export function Complaint() {
  const { tr } = useI18n();
  const { state } = useApp();
  const contact = useContactSheet();
  const mine = state.reports.filter((r) => r.mine && r.kind === 'complaint');
  return (
    <>
      <PageHeader title={tr('আপনার অভিযোগ', 'Your Complaint')} />
      <div className="content stack">
        <ContactCard
          icon={<Mail size={26} />}
          title={tr('আপনার অভিযোগ জানাতে ইমেইল করুন', 'E-mail your complaint')}
          sub={CONTACTS.complaintEmail}
          onClick={() => contact.open({ kind: 'mail', value: CONTACTS.complaintEmail, label: tr('অভিযোগের ইমেইল', 'Complaint e-mail') })}
        />
        <div className="card tinted stack">
          <h2>{tr('অ্যাপে অভিযোগ করুন ও অবস্থা দেখুন', 'Complain in the app and follow it')}</h2>
          <p className="small">
            {tr('ধরন বেছে নিন, ছবি ও অবস্থান দিন, সাথে সাথে রেফারেন্স নম্বর পান। প্রতিটি ধাপ নোটিফিকেশনে জানানো হবে।', 'Pick a category, add photos and location, and get a reference number at once. Every step is notified.')}
          </p>
          <Link to="/report?kind=complaint" className="btn primary">
            <FileWarning size={18} aria-hidden="true" />
            {tr('নতুন অভিযোগ', 'New complaint')}
          </Link>
        </div>
        <h2 className="section-title">
          {tr('আমার অভিযোগ', 'My complaints')}
          <Link to="/reports">{tr('সব রিপোর্ট', 'All reports')}</Link>
        </h2>
        {mine.length === 0 ? (
          <Empty icon={<ClipboardList size={24} />} title={tr('এখনো কোনো অভিযোগ নেই', 'No complaints yet')} />
        ) : (
          <div className="list">
            {mine.map((r) => (
              <LinkRow key={r.id} to={`/reports/${r.id}`} icon={<ClipboardList size={20} />} title={r.ref} sub={r.description} />
            ))}
          </div>
        )}
      </div>
      {contact.sheet}
    </>
  );
}

export function OnlineServices() {
  const { tr, tx } = useI18n();
  return (
    <>
      <PageHeader title={tr('অনলাইন সেবা', 'Online Services')} />
      <div className="content stack">
        <p className="small muted">{tr('এই সেবাগুলো অ্যাপের বাইরে অফিসিয়াল ওয়েবসাইট বা অ্যাপে খুলবে।', 'These services open outside this app, on the official website or app.')}</p>
        <div className="grid-auto">
          {ONLINE_SERVICES.map((s) => (
            <a key={s.id} className="list-card" href={s.url} target="_blank" rel="noopener noreferrer" style={{ gridTemplateColumns: '52px 1fr 20px' }}>
              <span className="lc-icon light">
                <Icon name={s.icon} size={24} />
              </span>
              <span>
                <span className="lc-title" style={{ display: 'block', fontSize: '1.02rem' }}>
                  {tx(s.name)}
                </span>
                <span className="small muted" style={{ display: 'block' }}>
                  {tx(s.desc)}
                </span>
                <span className="badge" style={{ marginTop: 6 }}>
                  {s.kind === 'app' ? tr('Google Play অ্যাপ', 'Google Play app') : tr('ওয়েবসাইট', 'Website')}
                </span>
              </span>
              <ExternalLink className="chev" size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export function TrafficHub() {
  const { tr } = useI18n();
  return (
    <>
      <PageHeader title={tr('ডিএমপি ট্রাফিক', 'DMP Traffic')} />
      <div className="content stack">
        <Link to="/traffic/act" className="list-card pink" style={{ gridTemplateColumns: '84px 1fr 24px' }}>
          <span style={{ width: 84, height: 84, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', border: '2px solid #f48fb1' }}>
            <BookOpen size={36} color="#1d4ed8" aria-hidden="true" />
          </span>
          <span className="lc-title">{tr('সড়ক ও মোটরযান আইন ২০১৮', 'Road Transport Act 2018')}</span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </Link>
        <h2 className="section-title" style={{ marginTop: 6 }}>
          {tr('রোডস্মার্ট ট্রাফিক সেবা', 'RoadSmart traffic services')}
        </h2>
        <div className="grid-auto">
          <div className="list">
            <LinkRow to="/alerts" icon={<Map size={20} />} title={tr('যাচাই করা সতর্কতা ও মানচিত্র', 'Verified alerts and map')} sub={tr('দুর্ঘটনা, ডাইভারশন, জলাবদ্ধতা, যানজট', 'Crashes, diversions, waterlogging, congestion')} />
            <LinkRow to="/routes" icon={<TrafficCone size={20} />} title={tr('আমার পথ', 'My routes')} sub={tr('নির্দিষ্ট সময়ে পথের সতর্কতা', 'Alerts for your route at set times')} />
            <LinkRow to="/cases" icon={<CarFront size={20} />} title={tr('মামলা ও জরিমানা', 'Cases & fines')} sub={tr('প্রমাণ দেখুন, পরিশোধ বা আপত্তি', 'See evidence, pay or object')} />
            <LinkRow to="/violations" icon={<Gauge size={20} />} title={tr('কোন লঙ্ঘনে কী প্রমাণ', 'What evidence each violation uses')} />
          </div>
          <div className="list">
            <LinkRow to="/report/joint" icon={<Users size={20} />} title={tr('ছোট দুর্ঘটনা: যৌথ রিপোর্ট', 'Minor crash: joint report')} />
            <LinkRow to="/learn/guide/checkpoint" icon={<ShieldCheck size={20} />} title={tr('চেকিংয়ে থামালে', 'When stopped at a checkpoint')} />
            <LinkRow to="/rickshaw" icon={<ScanLine size={20} />} title={tr('ই-রিক্সা QR স্ক্যান', 'e-Rickshaw QR scan')} />
            <LinkRow to="/learn" icon={<GraduationCap size={20} />} title={tr('শিখুন, কুইজ ও সনদ', 'Learn, quiz and certificate')} />
            <LinkRow to="/assistant" icon={<Sparkles size={20} />} title={tr('সড়ক আইন সহকারী', 'Road law assistant')} />
          </div>
        </div>
      </div>
    </>
  );
}

const ACT_TOPICS = [
  {
    t: { bn: 'লাইসেন্স ও গাড়ির কাগজ', en: 'Licence and vehicle papers' },
    p: {
      bn: 'বৈধ ড্রাইভিং লাইসেন্স ছাড়া গাড়ি চালানো যায় না। গাড়ির নিবন্ধন, ফিটনেস ও ট্যাক্স টোকেন হালনাগাদ রাখতে হয় এবং অফিসার চাইলে দেখাতে হয়।',
      en: 'You may not drive without a valid licence. Registration, fitness and tax token must be current and shown when an officer asks.',
    },
  },
  {
    t: { bn: 'সিগন্যাল, গতি ও লেন', en: 'Signals, speed and lanes' },
    p: {
      bn: 'ট্রাফিক সংকেত ও পুলিশের নির্দেশ মানা বাধ্যতামূলক। নির্ধারিত গতিসীমা মেনে চলুন, উল্টো পথে চলবেন না।',
      en: 'Traffic signals and police directions must be obeyed. Keep to the posted speed limit and never drive the wrong way.',
    },
  },
  {
    t: { bn: 'হেলমেট ও সিটবেল্ট', en: 'Helmets and seat belts' },
    p: { bn: 'মোটরসাইকেলের চালক ও আরোহী দুজনকেই মানসম্মত হেলমেট পরতে হবে।', en: 'Both motorcycle rider and passenger must wear a standard helmet.' },
  },
  {
    t: { bn: 'পার্কিং ও ফুটপাত', en: 'Parking and footpaths' },
    p: { bn: 'নির্ধারিত জায়গার বাইরে পার্কিং এবং ফুটপাত দখল দণ্ডনীয়।', en: 'Parking outside marked places and blocking footpaths are punishable.' },
  },
  {
    t: { bn: 'দুর্ঘটনার পর দায়িত্ব', en: 'Duties after a crash' },
    p: {
      bn: 'দুর্ঘটনা ঘটলে থামতে হবে, আহতকে সাহায্য করতে হবে এবং পুলিশকে জানাতে হবে।',
      en: 'After a crash you must stop, help anyone injured and inform the police.',
    },
  },
];

export function ActPage() {
  const { tr, tx } = useI18n();
  return (
    <>
      <PageHeader title={tr('সড়ক ও মোটরযান আইন ২০১৮', 'Road Transport Act 2018')} />
      <div className="content stack">
        <div className="card tinted stack">
          <h2>{tr('অফিসিয়াল আইনের পূর্ণ পাঠ', 'Full official text')}</h2>
          <p className="small">{tr('বর্তমান অ্যাপের মতোই আইনের PDF খোলে (বাহ্যিক লিংক)।', 'Opens the Act as a PDF, as the current app does (external link).')}</p>
          <a className="btn primary" href={CONTACTS.roadLawPdf} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={18} aria-hidden="true" />
            {tr('আইনের PDF খুলুন', 'Open the Act (PDF)')}
          </a>
        </div>
        <h2 className="section-title">{tr('সহজ ভাষায় মূল বিষয়', 'Key points in plain language')}</h2>
        {ACT_TOPICS.map((x) => (
          <details key={x.t.en} className="card flat">
            <summary className="strong" style={{ cursor: 'pointer', minHeight: 28 }}>
              {tx(x.t)}
            </summary>
            <p style={{ marginTop: 8 }}>{tx(x.p)}</p>
          </details>
        ))}
        <Banner>{tr('এটি সংক্ষিপ্ত সাধারণ ব্যাখ্যা; ধারা নম্বর ও জরিমানার অঙ্কের জন্য আইনের মূল পাঠ দেখুন।', 'This is a short general explanation; check the official text for section numbers and fine amounts.')}</Banner>
        <Link to="/assistant" className="btn outline">
          <Sparkles size={18} aria-hidden="true" />
          {tr('আইন নিয়ে প্রশ্ন করুন', 'Ask about the law')}
        </Link>
      </div>
    </>
  );
}

export function Faq() {
  const { tr, tx } = useI18n();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAQS;
    return FAQS.filter((f) => [f.q.bn, f.q.en, f.a.bn, f.a.en].some((t) => t.toLowerCase().includes(s)));
  }, [q]);
  return (
    <>
      <PageHeader title={tr('সাধারণ জিজ্ঞাসা', 'FAQ')} />
      <div className="content stack">
        <label className="search-box">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">{tr('প্রশ্ন খুঁজুন', 'Search questions')}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('যেমন: জিডি, ক্লিয়ারেন্স, হারানো', 'e.g. GD, clearance, lost')} />
        </label>
        {items.length === 0 ? (
          <Empty
            icon={<Search size={24} />}
            title={tr('মিল পাওয়া যায়নি', 'No match')}
            body={tr('সহকারীকে জিজ্ঞাসা করে দেখুন।', 'Try asking the assistant.')}
            action={
              <Link to={`/assistant?q=${encodeURIComponent(q)}`} className="btn outline small">
                {tr('সহকারীকে জিজ্ঞাসা', 'Ask the assistant')}
              </Link>
            }
          />
        ) : (
          items.map((f) => (
            <details key={f.id} className="card flat">
              <summary className="strong" style={{ cursor: 'pointer' }}>
                {tx(f.q)}
              </summary>
              <p style={{ marginTop: 8, whiteSpace: 'pre-line' }}>{tx(f.a)}</p>
            </details>
          ))
        )}
      </div>
    </>
  );
}

/** One page for every verified number (IM-005, SG-016). */
export function Emergency() {
  const { tr, tx, lang, n } = useI18n();
  const contact = useContactSheet();
  const near = nearestThanas(DEMO_POSITION, 3);
  return (
    <>
      <PageHeader title={tr('জরুরি নম্বর', 'Emergency numbers')} />
      <div className="content stack-lg">
        <Link to="/sos" className="card danger row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="lr-icon" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--sos)', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Siren size={26} aria-hidden="true" />
          </span>
          <span className="grow">
            <span className="strong" style={{ display: 'block', fontSize: '1.1rem' }}>
              {tr('SOS: সাহায্য চাই', 'SOS: I need help')}
            </span>
            <span className="small">{tr('ঘটনার ধরন বেছে অবস্থান শেয়ার করুন', 'Pick what happened and share your location')}</span>
          </span>
        </Link>
        <section className="stack">
          <h2 className="section-title">{tr('যাচাই করা নম্বর', 'Verified numbers')}</h2>
          <div className="list">
            {EMERGENCY_NUMBERS.map((h) => (
              <button key={h.id} type="button" className="list-row" onClick={() => contact.open({ kind: 'tel', value: h.numbers[0], label: tx(h.label) })}>
                <span className="lr-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger)' }}>
                  <Phone size={20} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tx(h.label)}
                  </span>
                  <span className="lr-sub danger-text strong">{formatPhone(h.numbers[0], lang)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="stack">
          <h2 className="section-title">
            {tr('কাছের থানা', 'Nearest thanas')}
            <Link to="/thana">{tr('সব থানা', 'All thanas')}</Link>
          </h2>
          <div className="list">
            {near.map((t) => (
              <button key={t.id} type="button" className="list-row" onClick={() => contact.open({ kind: 'tel', value: t.phone, label: tx(t.name) })}>
                <span className="lr-icon">
                  <Building2 size={20} aria-hidden="true" />
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
          <p className="tiny muted">{tr('দূরত্ব ডেমো অবস্থান (রমনা) থেকে।', 'Distances from the demo position (Ramna).')}</p>
        </section>
        <section className="stack">
          <h2 className="section-title">{tr('কী করবেন', 'What to do')}</h2>
          <div className="list">
            <LinkRow to="/learn/guide/post-accident" icon={<CarFront size={20} />} title={tr('দুর্ঘটনার পর চেকলিস্ট', 'After-crash checklist')} />
            <LinkRow to="/learn/guide/breakdown" icon={<TrafficCone size={20} />} title={tr('রাস্তায় গাড়ি বিকল হলে', 'If your vehicle breaks down')} />
            <LinkRow to="/cyber" icon={<ShieldCheck size={20} />} title={tr('সাইবার অপরাধ', 'Cyber crime')} />
            <LinkRow to="/women-child" icon={<Users size={20} />} title={tr('নারী ও শিশু নির্যাতন', 'Violence against women and children')} />
          </div>
        </section>
      </div>
      {contact.sheet}
    </>
  );
}
