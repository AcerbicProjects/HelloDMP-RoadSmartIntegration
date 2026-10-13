import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Map,
  Megaphone,
  Phone,
  Search as SearchIcon,
  ShieldCheck,
  SignpostBig,
  Sparkles,
  User,
} from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Empty, LinkRow, PageHeader } from '../../components/ui';
import { CITIZEN_NAV } from '../../components/nav';
import { FAQS } from '../../data/faqs';
import { THANAS } from '../../data/thanas';
import { KNOWLEDGE } from '../../data/knowledge';
import { EMERGENCY_NUMBERS, ONLINE_SERVICES } from '../../data/directory';
import { GUIDES, LESSONS, ROAD_SIGNS } from '../../data/learning';
import type { L } from '../../data/types';

/** Every service on one screen (the hamburger menu on the existing home screen). */
export function Menu() {
  const { tr, tx } = useI18n();
  const { state } = useApp();
  return (
    <>
      <PageHeader title={tr('সব সেবা', 'All services')} />
      <div className="content stack-lg">
        <Link to="/search" className="search-box" style={{ textDecoration: 'none', color: 'var(--muted)' }}>
          <SearchIcon size={20} aria-hidden="true" />
          <span>{tr('সেবা, থানা, আইন বা প্রশ্ন খুঁজুন', 'Search services, thanas, law or questions')}</span>
        </Link>
        {CITIZEN_NAV.map((g) => (
          <section key={g.group.en} className="stack">
            <h2 className="section-title" style={{ fontSize: '1rem' }}>
              {tx(g.group)}
            </h2>
            <div className="quick-grid">
              {g.items.map((it) => (
                <Link key={it.to} to={it.to} className="quick">
                  <span className="q-icon">
                    <it.icon size={22} aria-hidden="true" />
                  </span>
                  <span>{tx(it.label)}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section className="stack">
          <h2 className="section-title" style={{ fontSize: '1rem' }}>
            {tr('অ্যাকাউন্ট ও ডেমো', 'Account and demo')}
          </h2>
          <div className="list">
            <LinkRow
              to={state.session.loggedIn ? '/profile' : '/login'}
              icon={<User size={20} />}
              title={state.session.loggedIn ? state.profile.name : tr('সাইন ইন', 'Sign in')}
              sub={state.session.loggedIn ? tr('প্রোফাইল ও যাচাই', 'Profile and verification') : tr('মোবাইল নম্বর ও OTP দিয়ে', 'With mobile number and OTP')}
            />
            <LinkRow to="/privacy" icon={<ShieldCheck size={20} />} title={tr('গোপনীয়তা নীতি', 'Privacy policy')} />
            <LinkRow to="/officer" icon={<ShieldCheck size={20} />} title={tr('অফিসার অ্যাপ (ডেমো)', 'Officer app (demo)')} sub={tr('রিপোর্ট গ্রহণ, AI মামলা যাচাই, QR যাচাই', 'Take reports, verify AI cases, check QR')} />
            <LinkRow to="/admin" icon={<LayoutDashboard size={20} />} title={tr('কন্ট্রোল রুম (ডেমো)', 'Control room (demo)')} sub={tr('ড্যাশবোর্ড, ট্রায়াজ, সতর্কতা প্রকাশ', 'Dashboard, triage, publishing alerts')} />
          </div>
        </section>
      </div>
    </>
  );
}

interface Hit {
  key: string;
  group: 'service' | 'thana' | 'law' | 'faq' | 'alert' | 'learn' | 'number' | 'news';
  title: string;
  sub?: string;
  to: string;
  external?: boolean;
}

const GROUP_LABEL: Record<Hit['group'], L> = {
  service: { bn: 'সেবা', en: 'Services' },
  alert: { bn: 'চলমান সতর্কতা', en: 'Active alerts' },
  number: { bn: 'জরুরি নম্বর', en: 'Emergency numbers' },
  thana: { bn: 'থানা', en: 'Thanas' },
  law: { bn: 'আইন ও নিয়ম', en: 'Law and rules' },
  faq: { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
  learn: { bn: 'শিখুন', en: 'Learn' },
  news: { bn: 'ঘোষণা', en: 'Announcements' },
};
const GROUP_ICON: Record<Hit['group'], typeof Map> = {
  service: Sparkles,
  alert: Map,
  number: Phone,
  thana: Building2,
  law: BookOpen,
  faq: CircleHelp,
  learn: GraduationCap,
  news: Megaphone,
};

/** Global search across services, thanas, law, FAQs, alerts and lessons (SG-004). Runs locally. */
export function Search() {
  const { tr, tx, n } = useI18n();
  const { state } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const dq = useDeferredValue(q);

  const index = useMemo(() => {
    const items: (Hit & { hay: string })[] = [];
    const add = (h: Hit, ...texts: (L | string | undefined)[]) =>
      items.push({ ...h, hay: texts.flatMap((t) => (typeof t === 'string' ? [t] : t ? [t.bn, t.en] : [])).join(' ').toLowerCase() });
    CITIZEN_NAV.forEach((g) => g.items.forEach((it) => add({ key: `nav${it.to}`, group: 'service', title: tx(it.label), sub: tx(g.group), to: it.to }, it.label, g.group)));
    ONLINE_SERVICES.forEach((s) => add({ key: `os${s.id}`, group: 'service', title: tx(s.name), sub: tx(s.desc), to: s.url, external: true }, s.name, s.desc));
    state.alerts
      .filter((a) => a.status !== 'resolved')
      .forEach((a) => add({ key: `al${a.id}`, group: 'alert', title: tx(a.title), sub: tx(a.detail), to: `/alerts/${a.id}` }, a.title, a.detail, a.alternate));
    EMERGENCY_NUMBERS.forEach((h) => add({ key: `em${h.id}`, group: 'number', title: tx(h.label), sub: h.numbers.join(', '), to: '/emergency' }, h.label, h.numbers.join(' ')));
    THANAS.forEach((t) => add({ key: `th${t.id}`, group: 'thana', title: tx(t.name), sub: tx(t.address), to: `/thana?id=${t.id}` }, t.name, t.address));
    KNOWLEDGE.forEach((k) => add({ key: `kn${k.id}`, group: 'law', title: tx(k.question), sub: tx(k.source), to: `/assistant?q=${encodeURIComponent(tx(k.question))}` }, k.question, k.simple, k.keywords.join(' ')));
    FAQS.forEach((f) => add({ key: `fq${f.id}`, group: 'faq', title: tx(f.q), to: `/faq?q=${encodeURIComponent(tx(f.q))}` }, f.q, f.a));
    LESSONS.forEach((l) => add({ key: `ls${l.id}`, group: 'learn', title: tx(l.title), sub: tr('পাঠ', 'Lesson'), to: `/learn/lesson/${l.id}` }, l.title, ...l.points));
    GUIDES.forEach((g) => add({ key: `gd${g.id}`, group: 'learn', title: tx(g.title), sub: tx(g.audience), to: `/learn/guide/${g.id}` }, g.title, g.intro, g.audience));
    ROAD_SIGNS.forEach((r) => add({ key: `rs${r.id}`, group: 'learn', title: tx(r.name), sub: tr('সড়ক চিহ্ন', 'Road sign'), to: '/learn/signs' }, r.name, r.meaning));
    state.announcements.forEach((a) => add({ key: `an${a.id}`, group: 'news', title: tx(a.title), to: '/announcements' }, a.title, a.body));
    return items;
  }, [state.alerts, state.announcements, tx, tr]);

  const results = useMemo(() => {
    const terms = dq.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return index.filter((h) => terms.every((t) => h.hay.includes(t)));
  }, [dq, index]);

  const groups = (Object.keys(GROUP_LABEL) as Hit['group'][]).map((g) => ({ g, hits: results.filter((r) => r.group === g) })).filter((x) => x.hits.length > 0);
  const suggestions = [tr('জিডি', 'GD'), tr('হেলমেট', 'helmet'), tr('জরিমানা', 'fine'), tr('রমনা', 'Ramna'), tr('জলাবদ্ধতা', 'waterlogging'), '999'];

  const setQuery = (v: string) => {
    setQ(v);
    setParams(v ? { q: v } : {}, { replace: true });
  };

  return (
    <>
      <PageHeader title={tr('খুঁজুন', 'Search')} />
      <div className="content stack" style={{ maxWidth: 820 }}>
        <label className="search-box">
          <SearchIcon size={20} aria-hidden="true" />
          <span className="sr-only">{tr('খুঁজুন', 'Search')}</span>
          <input autoFocus type="search" value={q} onChange={(e) => setQuery(e.target.value)} placeholder={tr('সেবা, থানা, আইন, প্রশ্ন…', 'Services, thanas, law, questions…')} />
        </label>
        {!dq.trim() ? (
          <div className="stack">
            <span className="small muted">{tr('যেমন', 'For example')}</span>
            <div className="chips">
              {suggestions.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <Empty
            icon={<SignpostBig size={28} />}
            title={tr('কিছু পাওয়া যায়নি', 'Nothing found')}
            body={tr('অন্য শব্দে খুঁজুন, অথবা সহকারীকে জিজ্ঞাসা করুন।', 'Try other words, or ask the assistant.')}
            action={
              <Link to={`/assistant?q=${encodeURIComponent(dq)}`} className="btn outline small">
                <Sparkles size={16} aria-hidden="true" /> {tr('সহকারীকে জিজ্ঞাসা', 'Ask the assistant')}
              </Link>
            }
          />
        ) : (
          <>
            <p className="small muted" role="status">
              {tr(`${n(results.length)}টি ফলাফল`, `${results.length} results`)}
            </p>
            {groups.map(({ g, hits }) => {
              const Icon = GROUP_ICON[g];
              return (
                <section key={g} className="stack" style={{ gap: 6 }}>
                  <h2 className="small strong muted">{tx(GROUP_LABEL[g])}</h2>
                  <div className="list">
                    {hits.slice(0, 8).map((h) => (
                      <LinkRow key={h.key} to={h.to} icon={<Icon size={18} />} title={h.title} sub={h.sub} right={h.external ? <ExternalLink size={16} className="muted" aria-hidden="true" /> : undefined} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
