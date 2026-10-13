import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import type { L } from '../data/types';
import { DemoRibbon, LangToggle, OfflineBanner, Toasts } from './AppShell';

export interface StaffNavItem {
  to: string;
  label: L;
  icon: LucideIcon;
  badge?: number;
}

/** Layout for the officer app and the control room. Officers get a phone-style bottom bar;
 * the control room gets a scrolling tab strip on small screens. Both use a dark side menu on desktop. */
export function StaffShell({ variant, title, subtitle, nav, children }: { variant: 'officer' | 'admin'; title: L; subtitle?: string; nav: StaffNavItem[]; children: ReactNode }) {
  const { tx, tr, n } = useI18n();
  const loc = useLocation();
  const root = variant === 'officer' ? '/officer' : '/admin';
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {tr('মূল অংশে যান', 'Skip to content')}
      </a>
      <nav className="side-nav staff no-print" aria-label={tx(title)}>
        <Link to={root} className="brand">
          <img src="./dmp-badge.svg" alt="" width={36} height={36} />
          <span>
            <strong>{tx(title)}</strong>
            {subtitle && (
              <span className="tiny muted" style={{ display: 'block' }}>
                {subtitle}
              </span>
            )}
          </span>
        </Link>
        {nav.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === root}>
            <it.icon size={19} aria-hidden="true" />
            <span className="grow">{tx(it.label)}</span>
            {!!it.badge && <span className="badge danger">{n(it.badge)}</span>}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <LangToggle />
        </div>
      </nav>
      <div className="main-col" style={variant === 'admin' ? { paddingBottom: 0 } : undefined}>
        <DemoRibbon />
        <div className="staff-bar no-print">
          <img src="./dmp-badge.svg" alt="" />
          <div className="grow">
            <div className="strong">{tx(title)}</div>
            {subtitle && <div className="tiny" style={{ opacity: 0.85 }}>{subtitle}</div>}
          </div>
          <LangToggle />
        </div>
        {variant === 'admin' && (
          <nav className="staff-tabs no-print" aria-label={tx(title)}>
            {nav.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.to === root}>
                <it.icon size={16} aria-hidden="true" />
                {tx(it.label)}
                {!!it.badge && <span className="badge danger">{n(it.badge)}</span>}
              </NavLink>
            ))}
          </nav>
        )}
        <OfflineBanner />
        <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
      </div>
      {variant === 'officer' && (
        <nav className="bottom-nav no-print" aria-label={tx(title)}>
          {nav.slice(0, 5).map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === root} style={{ position: 'relative' }}>
              <it.icon size={22} aria-hidden="true" />
              <span>{tx(it.label)}</span>
              {!!it.badge && (
                <span className="badge danger" style={{ position: 'absolute', top: 2, right: '18%', padding: '0 6px', fontSize: '0.7rem' }}>
                  {n(it.badge)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      )}
      <Toasts />
    </div>
  );
}
