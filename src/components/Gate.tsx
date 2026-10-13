import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IdCard, LockKeyhole, Smartphone } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useI18n } from '../lib/i18n';

/** Verification levels from the proposal (p.27): 1 mobile OTP, 2 NID, 3 BRTA licence and vehicle papers. */
export function RequireTier({ tier, children, what }: { tier: 1 | 2 | 3; children: ReactNode; what: string }) {
  const { state } = useApp();
  const { tr } = useI18n();
  const { session, profile } = state;
  if (session.loggedIn && profile.tier >= tier) return <>{children}</>;
  const needLogin = !session.loggedIn;
  const Icon = needLogin ? Smartphone : tier === 2 ? IdCard : LockKeyhole;
  return (
    <div className="content" style={{ maxWidth: 560 }}>
      <div className="card tinted stack" style={{ textAlign: 'center', marginTop: 12 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', color: 'var(--brand-700)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <Icon size={30} aria-hidden="true" />
        </span>
        <h2>
          {needLogin
            ? tr(`${what} দেখতে লগইন করুন`, `Sign in to see ${what}`)
            : tier === 2
              ? tr(`${what} দেখতে NID যাচাই (স্তর ২) দরকার`, `${what} needs NID verification (level 2)`)
              : tr(`${what} দেখতে লাইসেন্স ও গাড়ির কাগজ যুক্ত (স্তর ৩) দরকার`, `${what} needs your licence and vehicle papers linked (level 3)`)}
        </h2>
        <p className="small muted">
          {tier === 1
            ? tr('মোবাইল নম্বর ও OTP দিয়ে লগইন করুন।', 'Sign in with your mobile number and an OTP.')
            : tier === 2
              ? tr('নিজের গাড়ির মামলা, পরিশোধ ও আপত্তির জন্য NID যাচাই লাগে।', 'Your own vehicle’s cases, payment and objections need NID verification.')
              : tr('ডিজিটাল লাইসেন্স ও গাড়ির কাগজ BRTA থেকে যাচাই করে যুক্ত হয়।', 'The digital licence and vehicle papers are checked with BRTA and linked.')}
        </p>
        <Link to={needLogin ? '/login' : '/profile/verify'} className="btn primary">
          {needLogin ? tr('লগইন করুন', 'Sign in') : tr('এখন যাচাই করুন', 'Verify now')}
        </Link>
      </div>
    </div>
  );
}
