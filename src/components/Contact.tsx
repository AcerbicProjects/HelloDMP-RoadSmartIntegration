import { useState, type ReactNode } from 'react';
import { ChevronRight, Copy, ExternalLink, Mail, Phone } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useApp } from '../store/AppStore';
import { formatPhone, telHref } from '../lib/format';
import { Banner, Sheet } from './ui';

/** Real phone numbers and e-mail addresses are never dialled or opened silently from the prototype:
 * the sheet says what will happen and offers a copy option instead. */
export function useContactSheet() {
  const [target, setTarget] = useState<{ kind: 'tel' | 'mail'; value: string; label: string } | null>(null);
  const sheet = <ContactSheet target={target} onClose={() => setTarget(null)} />;
  return { open: setTarget, sheet };
}

function ContactSheet({ target, onClose }: { target: { kind: 'tel' | 'mail'; value: string; label: string } | null; onClose: () => void }) {
  const { tr, lang } = useI18n();
  const { toast } = useApp();
  if (!target) return null;
  const href = target.kind === 'tel' ? telHref(target.value) : `mailto:${target.value}`;
  const shown = target.kind === 'tel' ? formatPhone(target.value, lang) : target.value;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(target.value);
      toast(tr('কপি হয়েছে', 'Copied'));
    } catch {
      toast(tr('কপি করা যায়নি; নিজে লিখে নিন', 'Could not copy; please note it down'), 'error');
    }
  };
  return (
    <Sheet open onClose={onClose} title={target.label}>
      <div className="stack">
        <div className="card tinted" style={{ textAlign: 'center' }}>
          <div className="small muted">{target.kind === 'tel' ? tr('নম্বর', 'Number') : tr('ইমেইল', 'E-mail')}</div>
          <div className="strong" style={{ fontSize: '1.4rem', color: target.kind === 'tel' ? 'var(--danger)' : 'var(--brand-700)', wordBreak: 'break-all' }}>
            {shown}
          </div>
        </div>
        <Banner tone="warn">
          {target.kind === 'tel'
            ? tr('এটি একটি আসল সরকারি নম্বর। এই প্রোটোটাইপ নিজে কোনো কল করে না; শুধু সত্যিকারের প্রয়োজনে আপনার ফোন থেকে কল করুন।', 'This is a real public number. The prototype does not place calls itself; only call from your phone if you genuinely need help.')
            : tr('এটি একটি আসল সরকারি ঠিকানা। এই বোতাম আপনার নিজের ইমেইল অ্যাপ খুলবে; প্রোটোটাইপ নিজে কিছু পাঠায় না।', 'This is a real public address. The button opens your own e-mail app; the prototype sends nothing itself.')}
        </Banner>
        <div className="btn-row">
          <button type="button" className="btn outline" onClick={copy}>
            <Copy size={18} aria-hidden="true" />
            {tr('কপি করুন', 'Copy')}
          </button>
          <a className={`btn ${target.kind === 'tel' ? 'danger' : 'primary'}`} href={href} onClick={onClose}>
            {target.kind === 'tel' ? <Phone size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
            {target.kind === 'tel' ? tr('ফোনে কল করুন', 'Call from phone') : tr('ইমেইল অ্যাপ খুলুন', 'Open e-mail app')}
          </a>
        </div>
      </div>
    </Sheet>
  );
}

/** The mint contact card from the existing app's Cyber Crime, Women & Child and Complaint screens. */
export function ContactCard({
  icon,
  iconClass = '',
  title,
  sub,
  subClass = '',
  onClick,
  href,
}: {
  icon: ReactNode;
  iconClass?: string;
  title: string;
  sub?: string;
  subClass?: string;
  onClick?: () => void;
  href?: string;
}) {
  const body = (
    <>
      <span className={`lc-icon ${iconClass}`}>{icon}</span>
      <span>
        <span className="lc-title" style={{ display: 'block' }}>
          {title}
        </span>
        {sub && <span className={`lc-sub ${subClass}`}>{sub}</span>}
      </span>
      {href ? <ExternalLink className="chev" size={20} aria-hidden="true" /> : <ChevronRight className="chev" size={24} aria-hidden="true" />}
    </>
  );
  return href ? (
    <a className="list-card" href={href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <button type="button" className="list-card" onClick={onClick}>
      {body}
    </button>
  );
}
