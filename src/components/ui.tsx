import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, ChevronRight, CircleAlert, Info, Loader2, RefreshCw, X } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { REPORT_STATUS, SEVERITY } from '../data/catalog';
import type { ReportStatus, Severity } from '../data/types';

/* ---------- Page header (back arrow + centred title, matching the existing app) ---------- */
export function PageHeader({ title, back, actions }: { title: string; back?: string | false; actions?: ReactNode }) {
  const nav = useNavigate();
  const { tr } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = `${title} · Hello DMP`;
    const onScroll = () => ref.current?.classList.toggle('scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [title]);
  return (
    <header ref={ref} className={`page-header${actions ? ' with-actions' : ''}`}>
      {back === false ? (
        <span />
      ) : (
        <button
          type="button"
          className="icon-btn"
          aria-label={tr('পেছনে যান', 'Go back')}
          onClick={() => (typeof back === 'string' ? nav(back) : window.history.length > 1 ? nav(-1) : nav('/'))}
        >
          <ArrowLeft size={24} />
        </button>
      )}
      <h1>{title}</h1>
      {actions ? <div className="actions">{actions}</div> : <span />}
    </header>
  );
}

/* ---------- Form controls ---------- */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && (
        <span className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="row between" style={{ padding: '10px 0' }}>
      <label htmlFor={id} className="grow" style={{ cursor: 'pointer' }}>
        <div className="strong">{label}</div>
        {description && <div className="small muted">{description}</div>}
      </label>
      <span className="switch">
        <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span />
      </span>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; danger?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={t.danger ? 'danger-tab' : undefined}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Bottom sheet / dialog ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tr } = useI18n();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () => el?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusables()?.[1]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const list = focusables();
        if (!list || list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="grabber" />
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.15rem' }}>{title}</h2>
          <button type="button" className="icon-btn" aria-label={tr('বন্ধ করুন', 'Close')} onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Feedback states ---------- */
export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="e-icon">{icon}</div>
      <div className="strong" style={{ color: 'var(--text)' }}>
        {title}
      </div>
      {body && <p className="small">{body}</p>}
      {action}
    </div>
  );
}

export function Banner({ tone = 'info', children, icon }: { tone?: 'info' | 'warn' | 'danger' | 'success' | 'brand'; children: ReactNode; icon?: ReactNode }) {
  const Ic = tone === 'danger' ? CircleAlert : tone === 'warn' ? AlertCircle : tone === 'success' ? Check : Info;
  return (
    <div className={`banner ${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      {icon ?? <Ic size={18} aria-hidden="true" />}
      <div className="grow">{children}</div>
    </div>
  );
}

/** Shown when a simulated call fails; the retry button repeats the same action. */
export function ErrorBanner({ onRetry, text }: { onRetry?: () => void; text?: string }) {
  const { tr } = useI18n();
  return (
    <Banner tone="danger">
      <div className="row between wrap">
        <span>{text ?? tr('সংযোগ ব্যর্থ হয়েছে (ডেমো: নেটওয়ার্ক ব্যর্থতা চালু)। কিছুই জমা হয়নি।', 'Connection failed (demo: network failure is on). Nothing was submitted.')}</span>
        {onRetry && (
          <button type="button" className="btn small outline-danger" onClick={onRetry}>
            <RefreshCw size={16} aria-hidden="true" />
            {tr('আবার চেষ্টা', 'Retry')}
          </button>
        )}
      </div>
    </Banner>
  );
}

export function SubmitButton({ busy, children, className = 'primary block', disabled, onClick, type = 'button' }: { busy: boolean; children: ReactNode; className?: string; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  const { tr } = useI18n();
  return (
    <button type={type} className={`btn ${className}`} disabled={busy || disabled} onClick={onClick} aria-busy={busy}>
      {busy ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
      {busy ? tr('অপেক্ষা করুন…', 'Please wait…') : children}
    </button>
  );
}

export function Stepper({ total, current, label }: { total: number; current: number; label: string }) {
  return (
    <div>
      <div className="stepper" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={label}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < current ? 'done' : ''} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Status badges ---------- */
export function StatusBadge({ status }: { status: ReportStatus }) {
  const { tx } = useI18n();
  const tone = status === 'resolved' ? 'success' : status === 'rejected' ? 'danger' : status === 'queued' ? 'warn' : status === 'received' ? 'info' : 'brand';
  return <span className={`badge ${tone}`}>{tx(REPORT_STATUS[status])}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { tx } = useI18n();
  const tone = severity === 'critical' ? 'danger' : severity === 'major' ? 'warn' : 'info';
  return <span className={`badge ${tone}`}>{tx(SEVERITY[severity].label)}</span>;
}

/* ---------- Rows ---------- */
export function LinkRow({ to, icon, title, sub, right }: { to: string; icon?: ReactNode; title: string; sub?: string; right?: ReactNode }) {
  const external = /^(https?:|tel:|mailto:)/.test(to);
  const inner = (
    <>
      {icon && <span className="lr-icon">{icon}</span>}
      <span className="grow">
        <span className="lr-title" style={{ display: 'block' }}>
          {title}
        </span>
        {sub && (
          <span className="lr-sub" style={{ display: 'block' }}>
            {sub}
          </span>
        )}
      </span>
      {right ?? <ChevronRight size={18} className="muted" aria-hidden="true" />}
    </>
  );
  return external ? (
    <a className="list-row" href={to} target={to.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link className="list-row" to={to}>
      {inner}
    </Link>
  );
}

export function Stars({ value, onChange, label }: { value: number; onChange?: (v: number) => void; label: string }) {
  const { n } = useI18n();
  return (
    <div className="row" role={onChange ? 'radiogroup' : 'img'} aria-label={onChange ? label : `${label}: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((s) =>
        onChange ? (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={n(s)}
            className="icon-btn"
            style={{ width: 40, height: 40, color: s <= value ? '#d99a00' : '#c3ccd3' }}
            onClick={() => onChange(s)}
          >
            <StarIcon filled={s <= value} />
          </button>
        ) : (
          <span key={s} style={{ color: s <= value ? '#d99a00' : '#c3ccd3' }}>
            <StarIcon filled={s <= value} size={18} />
          </span>
        ),
      )}
    </div>
  );
}

function StarIcon({ filled, size = 26 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small "Demo" tag used wherever the prototype stands in for a real integration. */
export function DemoTag({ text }: { text?: string }) {
  const { tr } = useI18n();
  return <span className="badge dark">{text ?? tr('ডেমো', 'Demo')}</span>;
}
