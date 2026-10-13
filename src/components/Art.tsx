// Hand-drawn SVG stand-ins for the existing app's illustrations (screenshot 21637a0e).
// They echo the originals' subjects and colours without copying the DMP emblem or third-party artwork.

export function OfficerFigure({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 190" aria-hidden="true">
      <ellipse cx="60" cy="184" rx="34" ry="5" fill="rgba(0,0,0,.12)" />
      {/* legs */}
      <path d="M40 120h40l-3 62H66l-6-46-6 46H43z" fill="#c9a77a" />
      <path d="M40 120h40v8H40z" fill="#3b2f25" />
      {/* torso */}
      <path d="M30 70c0-10 12-16 30-16s30 6 30 16v52H30z" fill="#a89b62" />
      <path d="M60 56v66" stroke="#7d7244" strokeWidth="2" />
      <rect x="38" y="80" width="16" height="14" rx="2" fill="none" stroke="#5e5531" strokeWidth="2" />
      <rect x="66" y="80" width="16" height="14" rx="2" fill="none" stroke="#5e5531" strokeWidth="2" />
      {/* arms */}
      <path d="M30 72c-8 6-10 30-8 48h10l4-40z" fill="#a89b62" />
      <path d="M90 72c8 6 10 30 8 48H88l-4-40z" fill="#a89b62" />
      <circle cx="27" cy="123" r="5" fill="#f2c9a0" />
      <circle cx="93" cy="123" r="5" fill="#f2c9a0" />
      {/* head */}
      <rect x="53" y="44" width="14" height="12" fill="#f2c9a0" />
      <ellipse cx="60" cy="34" rx="15" ry="17" fill="#f6d2ad" />
      {/* cap */}
      <path d="M40 22c0-10 9-16 20-16s20 6 20 16z" fill="#6f6a4a" />
      <rect x="42" y="20" width="36" height="6" rx="2" fill="#2f2b1d" />
      <circle cx="60" cy="14" r="3" fill="#fac900" />
    </svg>
  );
}

/** Tinted facade with arches and a clock, like the home header photo. */
export function HeroArt() {
  return (
    <svg className="hero-art decor" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f6f68" />
          <stop offset="1" stopColor="#0d5f59" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" />
      <g fill="#2d827a" opacity=".85">
        <rect x="0" y="60" width="400" height="160" />
      </g>
      <g fill="#3d948b">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${12 + i * 44} 220v-70a18 18 0 0 1 36 0v70z`} />
        ))}
      </g>
      <g fill="#58aaa0" opacity=".7">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={18 + i * 44} y="82" width="24" height="26" rx="3" />
        ))}
      </g>
      <rect x="0" y="56" width="400" height="8" fill="#1d5f58" />
      <circle cx="96" cy="128" r="22" fill="#cfe7e2" opacity=".55" />
      <path d="M96 112v16l10 8" stroke="#1d5f58" strokeWidth="3" fill="none" />
      <g fill="#2f7d50" opacity=".8">
        <circle cx="360" cy="70" r="26" />
        <circle cx="330" cy="88" r="18" />
      </g>
    </svg>
  );
}

export function OnlineServiceArt() {
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true">
      <rect x="16" y="64" width="64" height="5" rx="2" fill="#9aa5ad" />
      <rect x="44" y="40" width="28" height="20" rx="2" fill="#2b2f36" />
      <rect x="55" y="60" width="6" height="5" fill="#2b2f36" />
      <path d="M22 64c0-14 6-22 14-22s14 8 14 22z" fill="#f4b223" />
      <circle cx="36" cy="32" r="9" fill="#f6d2ad" />
      <path d="M26 30c0-8 5-12 10-12s10 4 10 12c-3-4-6-5-10-5s-7 1-10 5z" fill="#3a2a22" />
      <path d="M26 33a10 10 0 0 1 20 0" fill="none" stroke="#2b2f36" strokeWidth="2" />
      <rect x="62" y="18" width="20" height="14" rx="3" fill="#fde7b0" />
      <rect x="66" y="22" width="8" height="2" fill="#f4b223" />
      <rect x="66" y="26" width="12" height="2" fill="#f4b223" />
      <circle cx="16" cy="26" r="6" fill="#e9e3ff" />
      <circle cx="20" cy="74" r="4" fill="#d9c9ff" />
      <rect x="78" y="52" width="3" height="12" fill="#5aa65a" />
    </svg>
  );
}

export function CyberArt() {
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="#8c92cf" />
      <path d="M22 86c0-26 10-48 26-48s26 22 26 48z" fill="#2a2a2e" />
      <path d="M30 40c0-14 8-22 18-22s18 8 18 22v8H30z" fill="#2a2a2e" />
      <ellipse cx="48" cy="44" rx="11" ry="12" fill="#e2b38e" />
      <rect x="37" y="38" width="22" height="6" rx="3" fill="#111" />
      <rect x="24" y="62" width="48" height="26" rx="3" fill="#e9ecef" />
      <circle cx="48" cy="74" r="4" fill="#2a2a2e" />
      <path d="M44 80l8-4M44 76l8 4" stroke="#2a2a2e" strokeWidth="1.5" />
    </svg>
  );
}

export function WomenChildArt() {
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true">
      <path d="M8 90c0-20 8-30 18-30s18 10 18 30z" fill="#e86a5a" />
      <circle cx="26" cy="44" r="12" fill="#f6d2ad" />
      <path d="M13 46c0-14 6-20 13-20s13 6 13 20c-3-6-7-9-13-9s-10 3-13 9z" fill="#1f1f22" />
      <path d="M52 90c0-20 8-30 18-30s18 10 18 30z" fill="#6cbf7f" />
      <circle cx="70" cy="44" r="12" fill="#f6d2ad" />
      <path d="M57 52c0-18 5-26 13-26s13 8 13 26c-2-10-6-14-13-14s-11 4-13 14z" fill="#1f1f22" />
      <path d="M36 92c0-14 5-20 12-20s12 6 12 20z" fill="#ef86b5" />
      <circle cx="48" cy="64" r="9" fill="#f6d2ad" />
      <path d="M39 63c0-8 4-11 9-11s9 3 9 11c-2-4-5-5-9-5s-7 1-9 5z" fill="#1f1f22" />
    </svg>
  );
}

export function TrafficLightArt() {
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true">
      <rect x="44" y="76" width="8" height="14" fill="#2b2f36" />
      <rect x="32" y="8" width="32" height="70" rx="8" fill="#2b2f36" />
      <path d="M32 18h-8l8 8zM32 40h-8l8 8zM32 62h-8l8 8zM64 18h8l-8 8zM64 40h8l-8 8zM64 62h8l-8 8z" fill="#2b2f36" />
      <circle cx="48" cy="22" r="8" fill="#e53935" />
      <circle cx="48" cy="43" r="8" fill="#fbc02d" />
      <circle cx="48" cy="64" r="8" fill="#43a047" />
    </svg>
  );
}

/** Generic shield emblem (not the DMP logo). */
export function ShieldArt({ ribbon }: { ribbon?: boolean }) {
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true">
      {ribbon && <path d="M6 62l14-4 6 14-14 6zM90 62l-14-4-6 14 14 6z" fill="#c62828" />}
      {ribbon && <path d="M20 66c18 10 38 10 56 0l-4 12c-16 8-32 8-48 0z" fill="#d32f2f" />}
      <circle cx="48" cy="44" r={ribbon ? 32 : 40} fill="#056750" />
      <path d="M48 20l20 7v14c0 13-8 22-20 27-12-5-20-14-20-27V27z" fill="#fac900" />
      <path d="m48 30 3.2 6.6 7.3.9-5.4 5 1.4 7.2L48 46.2l-6.5 3.5 1.4-7.2-5.4-5 7.3-.9z" fill="#c62828" />
    </svg>
  );
}

/** Round icon art for the RoadSmart tiles, so new modules sit naturally next to the existing six. */
export function IconArt({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ width: 64, height: 64, borderRadius: '50%', background: color, color: '#fff', display: 'grid', placeItems: 'center' }} aria-hidden="true">
      {children}
    </span>
  );
}
