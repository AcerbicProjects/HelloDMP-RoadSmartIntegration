import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, BookOpen, Check, CheckCircle2, ChevronRight, CircleX, Download, HandHeart, Lightbulb, QrCode as QrIcon, Share2, Sparkles, Square, TrafficCone, Volume2 } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { useReadAloud } from '../../lib/speech';
import { Banner, Empty, PageHeader, Sheet, Tabs } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { QrCode } from '../../components/QrCode';
import { RoadSign } from '../../components/RoadSign';
import { GUIDES, LESSONS, PASS_MARK, QUIZ, ROAD_SIGNS } from '../../data/learning';
import { signToken } from '../../services/crypto';
import { nextNumber } from '../../services/api';
import type { RoadSign as Sign } from '../../data/types';

export default function Learn() {
  const { state, update, toast } = useApp();
  const { tr, tx, n } = useI18n();
  const done = state.lessonsDone.length;
  const pct = Math.round((done / LESSONS.length) * 100);
  return (
    <>
      <PageHeader title={tr('শিখুন: RoadSmart Citizen', 'Learn: RoadSmart Citizen')} />
      <div className="content cols">
        <div className="stack">
          <div className="card row" style={{ background: 'var(--brand-700)', color: '#fff', borderColor: 'var(--brand-700)' }}>
            <span style={{ width: 48, height: 48, borderRadius: 12, background: '#fff3cc', color: '#8a4b00', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Award size={24} aria-hidden="true" />
            </span>
            <div className="grow">
              <strong>{tr('Foundation সনদ', 'Foundation certificate')}</strong>
              <div className="small">{tr(`${n(LESSONS.length)}টির মধ্যে ${n(done)}টি পাঠ সম্পন্ন`, `${done} of ${LESSONS.length} lessons done`)}</div>
              <div className="bar-track" style={{ marginTop: 6, background: 'rgba(255,255,255,.25)' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={tr('অগ্রগতি', 'Progress')}>
                <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
              </div>
            </div>
          </div>
          <div>
            <span className="tag-heading">{tr('পাঠ', 'Lessons')}</span>
            <div className="tag-rule" />
          </div>
          <div className="list">
            {LESSONS.map((l) => {
              const isDone = state.lessonsDone.includes(l.id);
              return (
                <Link key={l.id} to={`/learn/lesson/${l.id}`} className="list-row">
                  <span className="lr-icon" style={isDone ? { background: 'var(--brand-700)', color: '#fff', borderRadius: '50%' } : undefined}>
                    {isDone ? <Check size={20} aria-hidden="true" /> : <Icon name={l.icon} size={20} />}
                  </span>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block' }}>
                      {tx(l.title)}
                    </span>
                    <span className="lr-sub">
                      {tr(`${n(l.minutes)} মিনিট`, `${l.minutes} min`)}
                      {isDone ? tr(' · সম্পন্ন', ' · done') : ''}
                    </span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
          <Link to="/learn/quiz" className="btn primary">
            <Sparkles size={18} aria-hidden="true" /> {tr('কুইজ দিন', 'Take the quiz')}
            {state.quizBest !== undefined && <span className="badge" style={{ marginLeft: 6 }}>{tr(`সেরা ${n(state.quizBest)}/${n(QUIZ.length)}`, `best ${state.quizBest}/${QUIZ.length}`)}</span>}
          </Link>
          <Link to="/learn/certificate" className="btn outline">
            <QrIcon size={18} aria-hidden="true" /> {tr('আমার সনদ', 'My certificate')}
          </Link>
        </div>
        <div className="stack">
          <Link to="/learn/signs" className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <RoadSign id="school" size={56} title="" />
            <span className="grow">
              <strong style={{ display: 'block' }}>{tr('সড়ক চিহ্নের গ্যালারি', 'Road sign gallery')}</strong>
              <span className="small muted">{tr(`${n(ROAD_SIGNS.length)}টি চিহ্ন · নিজেকে যাচাই করুন`, `${ROAD_SIGNS.length} signs · test yourself`)}</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
          <div>
            <span className="tag-heading">{tr('নির্দেশিকা', 'Guides')}</span>
            <div className="tag-rule" />
          </div>
          <div className="list">
            {GUIDES.map((g) => (
              <Link key={g.id} to={`/learn/guide/${g.id}`} className="list-row">
                <span className="lr-icon">
                  <BookOpen size={20} aria-hidden="true" />
                </span>
                <span className="grow">
                  <span className="lr-title" style={{ display: 'block' }}>
                    {tx(g.title)}
                  </span>
                  <span className="lr-sub">{tx(g.audience)}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="card tinted stack">
            <div className="row">
              <HandHeart size={22} aria-hidden="true" />
              <strong>{tr('নিরাপদ সড়কের অঙ্গীকার', 'Safe-road pledge')}</strong>
            </div>
            <p className="small">{tr('আমি হেলমেট ও সিটবেল্ট ব্যবহার করব, গতিসীমা মানব, জেব্রা ক্রসিংয়ে পথচারীকে আগে যেতে দেব এবং গাড়ি চালানোর সময় ফোন ব্যবহার করব না।', 'I will wear a helmet and seat belt, keep to speed limits, give way to pedestrians on zebra crossings and not use my phone while driving.')}</p>
            {state.pledged ? (
              <span className="badge success" style={{ alignSelf: 'flex-start' }}>
                <Check size={12} aria-hidden="true" /> {tr('আপনি অঙ্গীকার করেছেন', 'You have taken the pledge')}
              </span>
            ) : (
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  update((d) => {
                    d.pledged = true;
                  });
                  toast(tr('অঙ্গীকারের জন্য ধন্যবাদ!', 'Thank you for taking the pledge!'));
                }}
              >
                {tr('আমি অঙ্গীকার করছি', 'I take the pledge')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function LessonPage() {
  const { id } = useParams();
  const { state, update, toast } = useApp();
  const { tr, tx, n } = useI18n();
  const nav = useNavigate();
  const idx = LESSONS.findIndex((l) => l.id === id);
  const l = LESSONS[idx];
  if (!l)
    return (
      <>
        <PageHeader title={tr('পাঠ', 'Lesson')} />
        <div className="content">
          <Empty icon={<BookOpen size={24} />} title={tr('পাঠ পাওয়া যায়নি', 'Lesson not found')} />
        </div>
      </>
    );
  const isDone = state.lessonsDone.includes(l.id);
  const next = LESSONS[idx + 1];
  const complete = () => {
    if (!isDone)
      update((d) => {
        d.lessonsDone.push(l.id);
      });
    toast(tr('পাঠ সম্পন্ন', 'Lesson complete'));
    nav(next ? `/learn/lesson/${next.id}` : '/learn/quiz');
  };
  return (
    <>
      <PageHeader title={tx(l.title)} />
      <div className="content stack" style={{ maxWidth: 680 }}>
        <div className="row small muted">
          <Icon name={l.icon} size={18} /> {tr(`পাঠ ${n(idx + 1)}/${n(LESSONS.length)} · ${n(l.minutes)} মিনিট`, `Lesson ${idx + 1}/${LESSONS.length} · ${l.minutes} min`)}
        </div>
        <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
          {l.points.map((p) => (
            <li key={p.en} style={{ paddingLeft: 4 }}>
              {tx(p)}
            </li>
          ))}
        </ol>
        <div className="card warn row" style={{ alignItems: 'flex-start' }}>
          <Lightbulb size={20} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{tx(l.tip)}</span>
        </div>
        <button type="button" className="btn primary" onClick={complete}>
          {isDone ? tr('পরের পাঠ', 'Next lesson') : tr('সম্পন্ন হিসেবে চিহ্নিত করুন', 'Mark as complete')}
          {!next && ` · ${tr('কুইজ', 'quiz')}`}
        </button>
      </div>
    </>
  );
}

export function QuizPage() {
  const { state, update } = useApp();
  const { tr, tx, n } = useI18n();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = QUIZ[i];
  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= QUIZ.length) {
      setFinished(true);
      update((d) => {
        d.quizBest = Math.max(d.quizBest ?? 0, score);
      });
      return;
    }
    setI(i + 1);
    setPicked(null);
  };
  if (finished) {
    const passed = score >= PASS_MARK;
    const lessonsLeft = LESSONS.length - state.lessonsDone.length;
    return (
      <>
        <PageHeader title={tr('কুইজের ফল', 'Quiz result')} />
        <div className="content stack" style={{ maxWidth: 560, textAlign: 'center' }}>
          {passed ? <CheckCircle2 size={56} color="var(--success)" style={{ margin: '0 auto' }} aria-hidden="true" /> : <CircleX size={56} color="var(--danger)" style={{ margin: '0 auto' }} aria-hidden="true" />}
          <h2 style={{ fontSize: '1.6rem' }}>
            {n(score)}/{n(QUIZ.length)}
          </h2>
          <p>{passed ? tr('অভিনন্দন! আপনি পাস করেছেন।', 'Congratulations, you passed!') : tr(`পাস করতে ${n(PASS_MARK)}টি সঠিক উত্তর দরকার। আবার চেষ্টা করুন।`, `You need ${PASS_MARK} correct answers to pass. Try again.`)}</p>
          {passed && lessonsLeft > 0 && <Banner tone="warn">{tr(`সনদ পেতে আরও ${n(lessonsLeft)}টি পাঠ শেষ করুন।`, `Finish ${lessonsLeft} more lessons to get the certificate.`)}</Banner>}
          <div className="btn-row">
            <button
              type="button"
              className="btn outline"
              onClick={() => {
                setI(0);
                setPicked(null);
                setScore(0);
                setFinished(false);
              }}
            >
              {tr('আবার দিন', 'Retake')}
            </button>
            {passed ? (
              <Link to="/learn/certificate" className="btn primary">
                {tr('সনদ দেখুন', 'See certificate')}
              </Link>
            ) : (
              <Link to="/learn" className="btn primary">
                {tr('পাঠে ফিরুন', 'Back to lessons')}
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader title={tr('কুইজ', 'Quiz')} />
      <div className="content stack" style={{ maxWidth: 640 }}>
        <div className="small muted">{tr(`প্রশ্ন ${n(i + 1)} / ${n(QUIZ.length)}`, `Question ${i + 1} of ${QUIZ.length}`)}</div>
        <div className="bar-track" role="progressbar" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={QUIZ.length} aria-label={tr('অগ্রগতি', 'Progress')}>
          <div className="bar-fill" style={{ width: `${((i + 1) / QUIZ.length) * 100}%` }} />
        </div>
        <div className="card row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff3cc', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <TrafficCone size={20} color="#b45309" aria-hidden="true" />
          </span>
          <strong style={{ fontSize: '1.08rem' }}>{tx(q.q)}</strong>
        </div>
        <div className="stack" style={{ gap: 8 }} role="radiogroup" aria-label={tx(q.q)}>
          {q.options.map((o, k) => {
            const state2 = picked === null ? '' : k === q.correct ? 'success' : k === picked ? 'danger' : '';
            return (
              <button key={o.en} type="button" role="radio" aria-checked={picked === k} className={`card ${state2}`} style={{ textAlign: 'left', cursor: picked === null ? 'pointer' : 'default', padding: 14 }} onClick={() => pick(k)}>
                <span className="row">
                  {picked !== null && k === q.correct ? <CheckCircle2 size={18} color="var(--success)" aria-hidden="true" /> : picked === k ? <CircleX size={18} color="var(--danger)" aria-hidden="true" /> : <span style={{ width: 18, height: 18, borderRadius: 9, border: '2px solid #b8c2c9' }} />}
                  {tx(o)}
                </span>
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className={`banner ${picked === q.correct ? 'success' : 'danger'}`} role="status">
            <div>
              <strong>{picked === q.correct ? tr('সঠিক!', 'Correct!') : tr('সঠিক হয়নি।', 'Not quite.')}</strong> {tx(q.why)}
            </div>
          </div>
        )}
        <div className="sticky-actions">
          <button type="button" className="btn primary block" disabled={picked === null} onClick={next}>
            {i + 1 >= QUIZ.length ? tr('ফল দেখুন', 'See result') : tr('পরের প্রশ্ন', 'Next question')}
          </button>
        </div>
      </div>
    </>
  );
}

export function CertificatePage() {
  const { state, update, toast } = useApp();
  const { tr, date, n } = useI18n();
  const [token, setToken] = useState('');
  const lessonsDone = state.lessonsDone.length >= LESSONS.length;
  const passed = (state.quizBest ?? 0) >= PASS_MARK;
  const cert = state.certificate;
  const eligible = lessonsDone && passed && state.session.loggedIn;

  useEffect(() => {
    if (!cert && eligible) {
      const id = nextNumber([], `RSC-${new Date().getFullYear()}-`);
      update((d) => {
        d.certificate = { id, holder: d.profile.name, level: { bn: 'Foundation সনদ', en: 'Foundation certificate' }, score: d.quizBest ?? 0, issuedAt: new Date().toISOString() };
        d.notifications.unshift({ id: `NT${Date.now()}`, category: 'system', title: { bn: 'RoadSmart Citizen সনদ', en: 'RoadSmart Citizen certificate' }, body: { bn: 'অভিনন্দন! আপনার সনদ তৈরি হয়েছে', en: 'Congratulations! Your certificate is ready' }, at: new Date().toISOString(), read: false, link: '/learn/certificate' });
      });
    }
  }, [cert, eligible, update]);

  useEffect(() => {
    if (cert) void signToken({ t: 'cert', id: cert.id, name: cert.holder, lvl: cert.level.en, at: cert.issuedAt }).then(setToken);
  }, [cert]);

  if (!cert)
    return (
      <>
        <PageHeader title={tr('আমার সনদ', 'My certificate')} />
        <div className="content stack" style={{ maxWidth: 560 }}>
          <Empty icon={<Award size={24} />} title={tr('এখনো সনদ হয়নি', 'No certificate yet')} body={tr('সব পাঠ শেষ করে কুইজে পাস করলে QR-যাচাইযোগ্য সনদ পাবেন।', 'Finish all lessons and pass the quiz to get a QR-verifiable certificate.')} />
          <div className="list">
            <div className="list-row" style={{ cursor: 'default' }}>
              {lessonsDone ? <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" /> : <CircleX size={20} color="var(--muted)" aria-hidden="true" />}
              <span className="grow">{tr(`সব পাঠ (${n(state.lessonsDone.length)}/${n(LESSONS.length)})`, `All lessons (${state.lessonsDone.length}/${LESSONS.length})`)}</span>
              {!lessonsDone && <Link to="/learn">{tr('পাঠ', 'Lessons')}</Link>}
            </div>
            <div className="list-row" style={{ cursor: 'default' }}>
              {passed ? <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" /> : <CircleX size={20} color="var(--muted)" aria-hidden="true" />}
              <span className="grow">{tr(`কুইজে পাস (${n(PASS_MARK)}/${n(QUIZ.length)})`, `Pass the quiz (${PASS_MARK}/${QUIZ.length})`)}</span>
              {!passed && <Link to="/learn/quiz">{tr('কুইজ', 'Quiz')}</Link>}
            </div>
            <div className="list-row" style={{ cursor: 'default' }}>
              {state.session.loggedIn ? <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" /> : <CircleX size={20} color="var(--muted)" aria-hidden="true" />}
              <span className="grow">{tr('লগইন (সনদে নাম যাবে)', 'Signed in (your name goes on it)')}</span>
              {!state.session.loggedIn && <Link to="/login">{tr('লগইন', 'Sign in')}</Link>}
            </div>
          </div>
        </div>
      </>
    );

  const share = async () => {
    const text = `${cert.holder} · DMP RoadSmart Citizen · ${cert.level.en} · ${cert.id}`;
    try {
      if (navigator.share) await navigator.share({ title: 'RoadSmart Citizen', text });
      else {
        await navigator.clipboard.writeText(text);
        toast(tr('সনদের তথ্য কপি হয়েছে', 'Certificate details copied'));
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') toast(tr('শেয়ার করা যায়নি', 'Could not share'), 'error');
    }
  };

  return (
    <>
      <PageHeader title={tr('আমার সনদ', 'My certificate')} />
      <div className="content stack print-area" style={{ maxWidth: 520 }}>
        <div className="certificate stack" style={{ gap: 8 }}>
          <img src="./dmp-badge.svg" alt="" width={56} height={56} style={{ margin: '0 auto' }} />
          <div className="small">{tr('ঢাকা মেট্রোপলিটন পুলিশ', 'Dhaka Metropolitan Police')}</div>
          <div className="strong" style={{ fontSize: '1.3rem', color: 'var(--brand-700)' }}>
            DMP RoadSmart Citizen
          </div>
          <div className="strong" style={{ color: 'var(--sos)' }}>
            {cert.level.en}
          </div>
          <div className="small">{tr('প্রদান করা হলো', 'Awarded to')}</div>
          <div className="strong" style={{ fontSize: '1.25rem' }}>
            {cert.holder}
          </div>
          <div style={{ width: 160, margin: '6px auto' }}>{token ? <QrCode value={token} label={tr('সনদ যাচাইয়ের QR', 'Certificate verification QR')} /> : <div className="skeleton" style={{ height: 160 }} />}</div>
          <div className="tiny">
            {tr('সনদ নং', 'Certificate no.')} {cert.id} · {date(cert.issuedAt)}
          </div>
          <div className="tiny muted">{tr('QR স্ক্যান করে যে কেউ যাচাই করতে পারবেন', 'Anyone can verify it by scanning the QR')}</div>
        </div>
        <Banner tone="warn">{tr('এই সনদ সড়ক নিরাপত্তা শিক্ষার স্বীকৃতি; এটি BRTA ড্রাইভিং লাইসেন্সের বিকল্প নয়। প্রোটোটাইপ সনদ।', 'This certificate recognises road-safety learning; it is not a substitute for a BRTA driving licence. Prototype certificate.')}</Banner>
        <div className="btn-row no-print">
          <button type="button" className="btn outline" onClick={share}>
            <Share2 size={18} aria-hidden="true" /> {tr('শেয়ার', 'Share')}
          </button>
          <button type="button" className="btn outline" onClick={() => window.print()}>
            <Download size={18} aria-hidden="true" /> PDF
          </button>
        </div>
      </div>
    </>
  );
}

export function SignsPage() {
  const { tr, tx } = useI18n();
  const [kind, setKind] = useState<'all' | Sign['kind']>('all');
  const [open, setOpen] = useState<Sign | null>(null);
  const [mode, setMode] = useState<'gallery' | 'practice'>('gallery');
  const list = ROAD_SIGNS.filter((s) => kind === 'all' || s.kind === kind);
  return (
    <>
      <PageHeader title={tr('সড়ক চিহ্নের গ্যালারি', 'Road sign gallery')} />
      <div className="content stack">
        <Tabs
          label={tr('ধরন', 'Mode')}
          value={mode}
          onChange={setMode}
          tabs={[
            { id: 'gallery', label: tr('গ্যালারি', 'Gallery') },
            { id: 'practice', label: tr('নিজেকে যাচাই', 'Test yourself') },
          ]}
        />
        {mode === 'gallery' ? (
          <>
            <div className="chips" role="group" aria-label={tr('চিহ্নের ধরন', 'Sign type')}>
              {(['all', 'regulatory', 'warning', 'information'] as const).map((k) => (
                <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {k === 'all' ? tr('সব', 'All') : k === 'regulatory' ? tr('নিয়ন্ত্রণমূলক', 'Regulatory') : k === 'warning' ? tr('সতর্কতামূলক', 'Warning') : tr('তথ্যমূলক', 'Information')}
                </button>
              ))}
            </div>
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {list.map((s) => (
                <button key={s.id} type="button" className="card" style={{ cursor: 'pointer', display: 'grid', placeItems: 'center', gap: 8, textAlign: 'center' }} onClick={() => setOpen(s)}>
                  <RoadSign id={s.id} title={tx(s.name)} />
                  <span className="small strong">{tx(s.name)}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <SignPractice />
        )}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? tx(open.name) : ''}>
        {open && (
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
            <RoadSign id={open.id} size={140} title={tx(open.name)} />
            <p>{tx(open.meaning)}</p>
          </div>
        )}
      </Sheet>
    </>
  );
}

function SignPractice() {
  const { tr, tx, n } = useI18n();
  const order = useMemo(() => [...ROAD_SIGNS].sort((a, b) => a.id.localeCompare(b.id)), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const s = order[i % order.length];
  const options = useMemo(() => {
    const others = order.filter((x) => x.id !== s.id);
    const a = others[(i * 3 + 1) % others.length];
    const b = others[(i * 5 + 4) % others.length];
    const opts = [s, a, b.id === a.id ? others[(i + 7) % others.length] : b];
    return i % 3 === 0 ? opts : i % 3 === 1 ? [opts[1], opts[0], opts[2]] : [opts[1], opts[2], opts[0]];
  }, [i, s, order]);
  return (
    <div className="stack" style={{ maxWidth: 480 }}>
      <div className="small muted">{tr(`সঠিক ${n(score)} / ${n(i)}`, `Correct ${score} / ${i}`)}</div>
      <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
        <RoadSign id={s.id} size={130} title={tr('কোন চিহ্ন?', 'Which sign?')} />
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`card ${picked ? (o.id === s.id ? 'success' : o.id === picked ? 'danger' : '') : ''}`}
            style={{ textAlign: 'left', cursor: 'pointer', padding: 12 }}
            onClick={() => {
              if (picked) return;
              setPicked(o.id);
              if (o.id === s.id) setScore(score + 1);
            }}
          >
            {tx(o.name)}
          </button>
        ))}
      </div>
      {picked && <p className="small">{tx(s.meaning)}</p>}
      <button
        type="button"
        className="btn primary"
        disabled={!picked}
        onClick={() => {
          setI(i + 1);
          setPicked(null);
        }}
      >
        {tr('পরের চিহ্ন', 'Next sign')}
      </button>
    </div>
  );
}

export function GuidePage() {
  const { id } = useParams();
  const { tr, tx, lang } = useI18n();
  const g = GUIDES.find((x) => x.id === id);
  const [checked, setChecked] = useState<string[]>([]);
  const voice = useReadAloud(lang);
  if (!g)
    return (
      <>
        <PageHeader title={tr('নির্দেশিকা', 'Guide')} />
        <div className="content">
          <Empty icon={<BookOpen size={24} />} title={tr('নির্দেশিকা পাওয়া যায়নি', 'Guide not found')} />
        </div>
      </>
    );
  const checklist = g.id === 'post-accident' || g.id === 'breakdown';
  return (
    <>
      <PageHeader title={tx(g.title)} />
      <div className="content stack" style={{ maxWidth: 680 }}>
        <div className="row between wrap">
          <span className="badge brand">{tx(g.audience)}</span>
          {voice.available && (
            <button
              type="button"
              className="btn small ghost"
              aria-pressed={voice.speaking}
              onClick={() => voice.toggle([tx(g.intro), ...g.sections.flatMap((s) => [tx(s.heading), ...s.points.map((p) => tx(p))])].join('. '))}
            >
              {voice.speaking ? <Square size={14} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
              {voice.speaking ? tr('থামান', 'Stop') : tr('জোরে পড়ুন', 'Read aloud')}
            </button>
          )}
        </div>
        <div className={g.id === 'checkpoint' ? 'card warn' : ''}>
          <p>{tx(g.intro)}</p>
        </div>
        {g.sections.map((s) => (
          <section key={s.heading.en} className="stack" style={{ gap: 8 }}>
            <div>
              <span className="tag-heading">{tx(s.heading)}</span>
              <div className="tag-rule" />
            </div>
            {checklist ? (
              <div className="list">
                {s.points.map((p) => (
                  <label key={p.en} className="list-row check" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked.includes(p.en)} onChange={(e) => setChecked(e.target.checked ? [...checked, p.en] : checked.filter((x) => x !== p.en))} />
                    <span style={{ textDecoration: checked.includes(p.en) ? 'line-through' : undefined }}>{tx(p)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <ul className="stack" style={{ margin: 0, paddingLeft: 20, gap: 6 }}>
                {s.points.map((p) => (
                  <li key={p.en}>{tx(p)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {(g.id === 'post-accident' || g.id === 'breakdown' || g.id === 'checkpoint') && (
          <div className="btn-row">
            <Link to="/sos" className="btn danger">
              SOS
            </Link>
            {g.id === 'post-accident' && (
              <Link to="/report/joint" className="btn outline">
                {tr('যৌথ রিপোর্ট', 'Joint report')}
              </Link>
            )}
            {g.id === 'checkpoint' && (
              <Link to="/wallet" className="btn outline">
                {tr('QR ওয়ালেট', 'QR wallet')}
              </Link>
            )}
          </div>
        )}
        {g.id === 'checkpoint' && <p className="tiny muted">{tr('নমুনা লেখা · চূড়ান্ত লেখা DMP আইন শাখা যাচাই করবে', 'Sample text · the final wording will be checked by the DMP legal branch')}</p>}
      </div>
    </>
  );
}
