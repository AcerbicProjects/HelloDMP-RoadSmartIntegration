import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, Megaphone, MessageSquareHeart, Settings as SettingsIcon, Share2, ShieldCheck, Trash2 } from 'lucide-react';
import { inQuietHours, useApp } from '../../store/AppStore';
import { useI18n } from '../../lib/i18n';
import { Banner, Empty, ErrorBanner, Field, PageHeader, Sheet, Stars, SubmitButton, Switch } from '../../components/ui';
import { simulate } from '../../services/api';
import type { Announcement, FeedbackEntry, L, NotificationCategory } from '../../data/types';

const CATEGORY_LABEL: Record<NotificationCategory, L> = {
  alerts: { bn: 'সতর্কতা', en: 'Alerts' },
  cases: { bn: 'মামলা', en: 'Cases' },
  reports: { bn: 'রিপোর্ট', en: 'Reports' },
  announcements: { bn: 'ঘোষণা', en: 'Announcements' },
  system: { bn: 'অ্যাকাউন্ট', en: 'Account' },
};

/** In-app inbox (proposal p.29: official notices arrive only inside the app, never as SMS links). */
export function Notifications() {
  const { state, update } = useApp();
  const { tr, tx, ago, n } = useI18n();
  const nav = useNavigate();
  const [cat, setCat] = useState<NotificationCategory | 'all'>('all');
  const prefs = state.settings.notif;
  const list = state.notifications.filter((x) => cat === 'all' || x.category === cat);
  const unread = state.notifications.filter((x) => !x.read).length;
  const quiet = prefs.quietHours && inQuietHours(prefs.quietFrom, prefs.quietTo);

  const open = (id: string, link?: string) => {
    update((d) => {
      const x = d.notifications.find((y) => y.id === id);
      if (x) x.read = true;
    });
    if (link) nav(link);
  };
  const markAll = () =>
    update((d) => {
      d.notifications.forEach((x) => (x.read = true));
    });
  const clearRead = () =>
    update((d) => {
      d.notifications = d.notifications.filter((x) => !x.read);
    });

  return (
    <>
      <PageHeader
        title={tr('নোটিফিকেশন', 'Notifications')}
        actions={
          <Link to="/settings#notifications" className="icon-btn" aria-label={tr('নোটিফিকেশন সেটিংস', 'Notification settings')}>
            <SettingsIcon size={22} />
          </Link>
        }
      />
      <div className="content stack" style={{ maxWidth: 760 }}>
        <Banner tone="brand" icon={<ShieldCheck size={18} aria-hidden="true" />}>
          {tr(
            'DMP-এর অফিসিয়াল নোটিশ শুধু অ্যাপের ভেতরে আসে। জরিমানা পরিশোধের লিংকসহ কোনো SMS DMP পাঠায় না।',
            'Official DMP notices arrive only inside the app. DMP never sends SMS with payment links.',
          )}{' '}
          <Link to="/sms-check">{tr('সন্দেহজনক SMS যাচাই', 'Check a suspicious SMS')}</Link>
        </Banner>
        {quiet && (
          <Banner tone="warn" icon={<BellOff size={18} aria-hidden="true" />}>
            {tr(`নীরব সময় চলছে (${n(prefs.quietFrom)}–${n(prefs.quietTo)})। নতুন খবর এখানে জমা থাকবে, শব্দ হবে না।`, `Quiet hours are on (${prefs.quietFrom}–${prefs.quietTo}). New items collect here without a sound.`)}
          </Banner>
        )}

        <div className="chips" role="group" aria-label={tr('ধরন অনুযায়ী ছাঁকুন', 'Filter by type')}>
          {(['all', 'alerts', 'cases', 'reports', 'announcements', 'system'] as const).map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c === 'all' ? tr('সব', 'All') : tx(CATEGORY_LABEL[c])}
            </button>
          ))}
        </div>

        <div className="row between wrap">
          <span className="small muted">{unread > 0 ? tr(`${n(unread)}টি অপঠিত`, `${unread} unread`) : tr('সব পড়া হয়েছে', 'All read')}</span>
          <div className="btn-row">
            <button type="button" className="btn small ghost" onClick={markAll} disabled={unread === 0}>
              <CheckCheck size={16} aria-hidden="true" /> {tr('সব পঠিত', 'Mark all read')}
            </button>
            <button type="button" className="btn small ghost" onClick={clearRead} disabled={state.notifications.every((x) => !x.read)}>
              <Trash2 size={16} aria-hidden="true" /> {tr('পড়াগুলো মুছুন', 'Clear read')}
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <Empty icon={<Bell size={28} />} title={tr('কোনো নোটিফিকেশন নেই', 'No notifications')} body={tr('নতুন সতর্কতা, মামলা বা রিপোর্টের খবর এখানে আসবে।', 'New alerts, cases and report updates will appear here.')} />
        ) : (
          <ul className="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {list.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  className="list-row"
                  style={{ width: '100%', textAlign: 'left', background: x.read ? undefined : 'var(--brand-50)' }}
                  onClick={() => open(x.id, x.link)}
                >
                  <span className="lr-icon" aria-hidden="true" style={{ position: 'relative' }}>
                    <Bell size={18} />
                    {!x.read && <span style={{ position: 'absolute', top: 2, right: 2, width: 9, height: 9, borderRadius: '50%', background: 'var(--sos)' }} />}
                  </span>
                  <span className="grow">
                    <span className="lr-title" style={{ display: 'block', fontWeight: x.read ? 600 : 800 }}>
                      {tx(x.title)}
                      {!x.read && <span className="sr-only"> ({tr('অপঠিত', 'unread')})</span>}
                    </span>
                    <span className="lr-sub" style={{ display: 'block' }}>
                      {tx(x.body)}
                    </span>
                    <span className="tiny muted">
                      {tx(CATEGORY_LABEL[x.category])} · {ago(x.at)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

const ANN_LABEL: Record<Announcement['category'], L> = {
  notice: { bn: 'নোটিশ', en: 'Notice' },
  circular: { bn: 'পরিপত্র', en: 'Circular' },
  news: { bn: 'খবর', en: 'News' },
};

/** Official DMP news, circulars and notices (SG-020), published from the control room (SG-046). */
export function Announcements() {
  const { state, toast } = useApp();
  const { tr, tx, date } = useI18n();
  const [cat, setCat] = useState<Announcement['category'] | 'all'>('all');
  const [openId, setOpenId] = useState<string>();
  const list = [...state.announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).filter((a) => cat === 'all' || a.category === cat);
  const current = state.announcements.find((a) => a.id === openId);

  const share = async (a: Announcement) => {
    const text = `${tx(a.title)}\n\n${tx(a.body)}\n\n— DMP (Hello DMP prototype)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: tx(a.title), text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast(tr('লেখাটি কপি হয়েছে', 'Text copied'));
    } catch {
      // The person closed the share sheet; nothing to report.
    }
  };

  return (
    <>
      <PageHeader title={tr('DMP ঘোষণা', 'DMP announcements')} />
      <div className="content stack" style={{ maxWidth: 760 }}>
        <div className="chips" role="group" aria-label={tr('ধরন অনুযায়ী ছাঁকুন', 'Filter by type')}>
          {(['all', 'notice', 'circular', 'news'] as const).map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c === 'all' ? tr('সব', 'All') : tx(ANN_LABEL[c])}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <Empty icon={<Megaphone size={28} />} title={tr('এই ধরনের কোনো ঘোষণা নেই', 'No announcements of this type')} />
        ) : (
          list.map((a) => (
            <button key={a.id} type="button" className="card stack" style={{ textAlign: 'left', gap: 6, cursor: 'pointer' }} onClick={() => setOpenId(a.id)}>
              <span className="row between">
                <span className={`badge ${a.category === 'notice' ? 'danger' : a.category === 'circular' ? 'brand' : 'info'}`}>{tx(ANN_LABEL[a.category])}</span>
                <span className="tiny muted">{date(a.publishedAt)}</span>
              </span>
              <span className="strong">{tx(a.title)}</span>
              <span className="small muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {tx(a.body)}
              </span>
            </button>
          ))
        )}
      </div>
      <Sheet open={!!current} onClose={() => setOpenId(undefined)} title={current ? tx(ANN_LABEL[current.category]) : ''}>
        {current && (
          <div className="stack">
            <h3>{tx(current.title)}</h3>
            <span className="tiny muted">
              {tr('প্রকাশ', 'Published')} {date(current.publishedAt)} · DMP
            </span>
            <p style={{ whiteSpace: 'pre-line' }}>{tx(current.body)}</p>
            <button type="button" className="btn outline" onClick={() => void share(current)}>
              <Share2 size={18} aria-hidden="true" /> {tr('শেয়ার করুন', 'Share')}
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}

const FEEDBACK_SERVICES: { id: string; label: L }[] = [
  { id: 'report', label: { bn: 'রিপোর্ট করা', en: 'Reporting an issue' } },
  { id: 'alerts', label: { bn: 'সতর্কতা ও পথ', en: 'Alerts and routes' } },
  { id: 'payment', label: { bn: 'মামলা ও পরিশোধ', en: 'Cases and payment' } },
  { id: 'assistant', label: { bn: 'সহকারী', en: 'Assistant' } },
  { id: 'thana', label: { bn: 'থানা ও হেল্পলাইন', en: 'Thanas and helplines' } },
  { id: 'officer', label: { bn: 'অফিসারের সেবা', en: 'Service from an officer' } },
  { id: 'app', label: { bn: 'পুরো অ্যাপ', en: 'The app overall' } },
];

/** Structured post-service feedback with an anonymous option (SG-022). */
export function Feedback() {
  const { state, update, toast } = useApp();
  const { tr, tx, date, n } = useI18n();
  const [service, setService] = useState('app');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');

  const avg = useMemo(() => {
    const f = state.feedback;
    return f.length ? f.reduce((s, x) => s + x.rating, 0) / f.length : 0;
  }, [state.feedback]);

  const submit = async () => {
    if (rating === 0) {
      setError(tr('তারকা দিয়ে রেটিং দিন', 'Choose a star rating'));
      return;
    }
    setError('');
    setBusy(true);
    setFailed(false);
    const entry: FeedbackEntry = {
      id: `F${state.feedback.length + 1}-${Date.now().toString(36)}`,
      service,
      rating,
      comment: comment.trim(),
      anonymous,
      at: new Date().toISOString(),
    };
    try {
      await simulate(() => true, { fail: state.settings.simulateFailure });
      update((d) => {
        d.feedback.unshift(entry);
      });
      toast(tr('ধন্যবাদ! মতামত এই প্রোটোটাইপে সংরক্ষিত হয়েছে।', 'Thank you! Your feedback is saved in this prototype.'));
      setRating(0);
      setComment('');
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const serviceLabel = (id: string) => tx(FEEDBACK_SERVICES.find((s) => s.id === id)?.label);

  return (
    <>
      <PageHeader title={tr('মতামত দিন', 'Give feedback')} />
      <div className="content cols">
        <section className="card stack">
          <div className="row">
            <MessageSquareHeart size={22} color="var(--brand-700)" aria-hidden="true" />
            <h2 style={{ fontSize: '1.1rem' }}>{tr('সেবা কেমন লাগল?', 'How was the service?')}</h2>
          </div>
          <Field label={tr('কোন সেবা', 'Which service')} htmlFor="fb-service">
            <select id="fb-service" className="select" value={service} onChange={(e) => setService(e.target.value)}>
              {FEEDBACK_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {tx(s.label)}
                </option>
              ))}
            </select>
          </Field>
          <div className="field">
            <span className="strong small">{tr('রেটিং', 'Rating')}</span>
            <Stars value={rating} onChange={setRating} label={tr('রেটিং', 'Rating')} />
            {error && (
              <span className="error" role="alert">
                {error}
              </span>
            )}
          </div>
          <Field label={tr('মন্তব্য (ঐচ্ছিক)', 'Comment (optional)')} hint={tr('ব্যক্তিগত তথ্য লিখবেন না', 'Do not include personal details')} htmlFor="fb-comment">
            <textarea id="fb-comment" className="textarea" rows={4} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          <Switch checked={anonymous} onChange={setAnonymous} label={tr('নাম ছাড়া পাঠান', 'Send anonymously')} description={tr('আপনার নাম ও মোবাইল নম্বর মতামতের সঙ্গে যুক্ত হবে না', 'Your name and mobile number are not attached')} />
          {failed && <ErrorBanner onRetry={() => void submit()} />}
          <SubmitButton busy={busy} onClick={() => void submit()}>
            {tr('মতামত পাঠান', 'Send feedback')}
          </SubmitButton>
        </section>

        <section className="stack">
          <div className="card row">
            <div className="grow">
              <div className="small muted">{tr('এই ডিভাইসে দেওয়া মতামত', 'Feedback given on this device')}</div>
              <div className="strong" style={{ fontSize: '1.4rem' }}>
                {n(avg.toFixed(1))} / {n(5)}
              </div>
            </div>
            <Stars value={Math.round(avg)} label={tr('গড় রেটিং', 'Average rating')} />
          </div>
          {state.feedback.length === 0 ? (
            <Empty icon={<MessageSquareHeart size={28} />} title={tr('এখনো কোনো মতামত নেই', 'No feedback yet')} />
          ) : (
            state.feedback.map((f) => (
              <div key={f.id} className="card stack" style={{ gap: 4 }}>
                <div className="row between">
                  <span className="strong small">{serviceLabel(f.service) || f.service}</span>
                  <span className="tiny muted">{date(f.at)}</span>
                </div>
                <Stars value={f.rating} label={tr('রেটিং', 'Rating')} />
                {f.comment && <p className="small">{f.comment}</p>}
                <span className="tiny muted">{f.anonymous ? tr('নাম ছাড়া', 'Anonymous') : tr('নামসহ', 'With name')}</span>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
