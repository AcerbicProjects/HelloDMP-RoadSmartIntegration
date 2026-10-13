import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Mic, MicOff, Search, Send, Sparkles, Square, Volume2 } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, PageHeader, Tabs } from '../../components/ui';
import { askAssistant, knowledgeById, SUGGESTED_QUESTIONS } from '../../services/assistant';
import type { KnowledgeEntry } from '../../data/types';

interface Msg {
  id: number;
  from: 'user' | 'bot';
  text?: string;
  entry?: KnowledgeEntry;
  related?: KnowledgeEntry[];
  miss?: boolean;
}

// Minimal typing for the Web Speech API, which TypeScript's DOM lib does not include.
interface SpeechRec {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
function getRecognition(): (new () => SpeechRec) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function Answer({ m, onAsk }: { m: Msg; onAsk: (q: string) => void }) {
  const { tr, tx, lang } = useI18n();
  const [mode, setMode] = useState<'simple' | 'original'>('simple');
  const [speaking, setSpeaking] = useState(false);
  const e = m.entry!;
  const text = mode === 'simple' ? tx(e.simple) : tx(e.original);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speak = () => {
    if (!canSpeak) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return (
    <div className="msg bot stack" style={{ gap: 10, whiteSpace: 'normal', maxWidth: '100%' }}>
      <div className="row between wrap">
        <span className="row strong small" style={{ gap: 6, color: 'var(--sos)' }}>
          <Sparkles size={16} aria-hidden="true" /> {tr('রোডস্মার্ট সহকারী', 'RoadSmart assistant')}
        </span>
        <div style={{ minWidth: 180 }}>
          <Tabs
            label={tr('উত্তরের ধরন', 'Answer style')}
            value={mode}
            onChange={setMode}
            tabs={[
              { id: 'simple', label: tr('সহজ ভাষা', 'Plain') },
              { id: 'original', label: tr('মূল পাঠ', 'Original') },
            ]}
          />
        </div>
      </div>
      <div className="strong">{tx(e.question)}</div>
      <p style={{ whiteSpace: 'pre-line' }}>{text}</p>
      <span className="badge brand" style={{ alignSelf: 'flex-start', whiteSpace: 'normal' }}>
        <BookOpen size={12} aria-hidden="true" /> {tx(e.source)}
      </span>
      <div className="btn-row">
        {e.actions?.map((a) => (
          <Link key={a.to} to={a.to} className="btn small outline">
            {tx(a.label)}
          </Link>
        ))}
        {canSpeak && (
          <button type="button" className="btn small ghost" onClick={speak} aria-pressed={speaking}>
            {speaking ? <Square size={14} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            {speaking ? tr('থামান', 'Stop') : tr('জোরে পড়ুন', 'Read aloud')}
          </button>
        )}
      </div>
      {m.related && m.related.length > 0 && (
        <div className="stack" style={{ gap: 6 }}>
          <span className="tiny muted">{tr('আরও দেখতে পারেন', 'You may also ask')}</span>
          {m.related.map((r) => (
            <button key={r.id} type="button" className="chip" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => onAsk(tx(r.question))}>
              <Search size={14} aria-hidden="true" /> {tx(r.question)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Answers come from a small verified knowledge base by keyword retrieval. It stands in for the proposal's
 * RAG assistant (p.33) and never generates free text, so it cannot invent law. */
export default function Assistant() {
  const { tr, tx } = useI18n();
  const { state } = useApp();
  const [params] = useSearchParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState('');
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const Rec = getRecognition();

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const res = askAssistant(t);
    setMsgs((m) => [...m, { id: ++idRef.current, from: 'user', text: t }, { id: ++idRef.current, from: 'bot', entry: res.entry, related: res.related, miss: !res.entry }]);
    setQ('');
  };

  // Questions can arrive in the address (from search or other screens), including while this screen is open.
  const qParam = params.get('q');
  const lastParam = useRef<string | null>(null);
  useEffect(() => {
    if (qParam && qParam !== lastParam.current) ask(qParam);
    lastParam.current = qParam;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs]);

  const toggleMic = () => {
    if (!Rec) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const r = new Rec();
    r.lang = state.settings.lang === 'bn' ? 'bn-BD' : 'en-US';
    r.interimResults = false;
    r.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript ?? '';
      setQ(said);
      if (said) ask(said);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    setListening(true);
    r.start();
  };

  return (
    <>
      <PageHeader
        title={tr('রোডস্মার্ট সহকারী', 'RoadSmart assistant')}
        actions={
          <Link to="/sos" className="btn small danger" style={{ minHeight: 36 }}>
            SOS
          </Link>
        }
      />
      <div className="content stack" style={{ maxWidth: 760 }}>
        <div className="card tinted row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', color: 'var(--sos)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <div>
            <div className="strong">{tr('আপনার প্রশ্ন বলুন, আমি সহজ ভাষায় বুঝিয়ে দেব।', 'Ask your question and I will explain it simply.')}</div>
            <div className="small muted">{tr('সড়ক পরিবহন আইন, ২০১৮ ও DMP নির্দেশনা থেকে, সূত্রসহ', 'From the Road Transport Act 2018 and DMP guidance, with sources')}</div>
          </div>
        </div>

        {msgs.length === 0 && (
          <section className="stack" style={{ gap: 8 }}>
            <span className="small strong">{tr('জিজ্ঞাসা করে দেখুন', 'Try asking')}</span>
            {SUGGESTED_QUESTIONS.map((id) => {
              const e = knowledgeById(id);
              if (!e) return null;
              return (
                <button key={id} type="button" className="list-row" style={{ border: '1px solid var(--line)', borderRadius: 14 }} onClick={() => ask(tx(e.question))}>
                  <Search size={16} className="muted" aria-hidden="true" />
                  <span className="grow">“{tx(e.question)}”</span>
                </button>
              );
            })}
          </section>
        )}

        <div className="chat" aria-live="polite">
          {msgs.map((m) =>
            m.from === 'user' ? (
              <div key={m.id} className="msg user">
                {m.text}
              </div>
            ) : m.entry ? (
              <Answer key={m.id} m={m} onAsk={ask} />
            ) : (
              <div key={m.id} className="msg bot stack" style={{ gap: 8, whiteSpace: 'normal' }}>
                <span>{tr('এই প্রশ্নের যাচাই করা উত্তর আমার কাছে নেই। আমি অনুমান করে আইন বলি না।', 'I do not have a verified answer to this question. I do not guess about the law.')}</span>
                <div className="btn-row">
                  <Link to="/faq" className="btn small outline">
                    {tr('সাধারণ জিজ্ঞাসা', 'FAQ')}
                  </Link>
                  <Link to="/emergency" className="btn small outline">
                    {tr('হেল্পলাইন', 'Helplines')}
                  </Link>
                  <Link to="/traffic/act" className="btn small outline">
                    {tr('আইনের পাঠ', 'The Act')}
                  </Link>
                </div>
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>

        <Banner>{tr('উত্তর সাধারণ নির্দেশনা, আইনজীবীর বিকল্প নয়। প্রোটোটাইপ: ছোট একটি যাচাই করা তথ্যভান্ডারে কীওয়ার্ড দিয়ে খোঁজে; কোনো লাইভ AI মডেল যুক্ত নয়।', 'Answers are general guidance, not a substitute for a lawyer. Prototype: keyword search over a small verified knowledge base; no live AI model is connected.')}</Banner>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
        >
          <label htmlFor="ask" className="sr-only">
            {tr('প্রশ্ন', 'Question')}
          </label>
          <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('সড়ক আইন নিয়ে যেকোনো প্রশ্ন…', 'Any question about road law…')} autoComplete="off" />
          <button
            type="button"
            style={{ background: listening ? 'var(--sos)' : 'var(--surface-2)', color: listening ? '#fff' : 'var(--text-2)' }}
            onClick={toggleMic}
            disabled={!Rec}
            aria-label={Rec ? (listening ? tr('শোনা বন্ধ', 'Stop listening') : tr('বলে প্রশ্ন করুন', 'Ask by voice')) : tr('এই ব্রাউজারে ভয়েস ইনপুট নেই', 'Voice input is not available in this browser')}
            title={Rec ? undefined : tr('এই ব্রাউজারে ভয়েস ইনপুট নেই', 'Voice input is not available in this browser')}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button type="submit" aria-label={tr('পাঠান', 'Send')}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
