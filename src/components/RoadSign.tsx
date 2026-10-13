// Simplified SVG road signs for the sign gallery (SG-026). Shapes follow the usual conventions:
// red circles prohibit, red triangles warn, blue panels inform.

const RED = '#c62828';
const BLUE = '#1d4ed8';

function Ring({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="44" fill="#fff" stroke={RED} strokeWidth="10" />
      {children}
    </>
  );
}
function Triangle({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <path d="M50 8 94 88H6z" fill="#fff" stroke={RED} strokeWidth="8" strokeLinejoin="round" />
      {children}
    </>
  );
}
function Panel({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <rect x="8" y="8" width="84" height="84" rx="10" fill={BLUE} />
      {children}
    </>
  );
}

export function RoadSign({ id, size = 84, title }: { id: string; size?: number; title: string }) {
  let body: React.ReactNode;
  switch (id) {
    case 'stop':
      body = (
        <>
          <path d="M31 6h38l25 25v38L69 94H31L6 69V31z" fill={RED} stroke="#fff" strokeWidth="3" />
          <text x="50" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff" fontFamily="Noto Sans, sans-serif">
            STOP
          </text>
        </>
      );
      break;
    case 'no-entry':
      body = (
        <>
          <circle cx="50" cy="50" r="44" fill={RED} />
          <rect x="18" y="42" width="64" height="16" fill="#fff" />
        </>
      );
      break;
    case 'speed-40':
      body = (
        <Ring>
          <text x="50" y="63" textAnchor="middle" fontSize="38" fontWeight="800" fill="#111" fontFamily="Noto Sans, sans-serif">
            40
          </text>
        </Ring>
      );
      break;
    case 'no-horn':
      body = (
        <Ring>
          <path d="M28 44h10l18-12v36L38 56H28z" fill="#111" />
          <path d="M62 40c4 5 4 15 0 20" stroke="#111" strokeWidth="4" fill="none" />
          <path d="M20 80 80 20" stroke={RED} strokeWidth="9" />
        </Ring>
      );
      break;
    case 'no-parking':
      body = (
        <>
          <circle cx="50" cy="50" r="44" fill={BLUE} stroke={RED} strokeWidth="10" />
          <path d="M22 22 78 78" stroke={RED} strokeWidth="10" />
        </>
      );
      break;
    case 'no-u-turn':
      body = (
        <Ring>
          <path d="M60 70V42a12 12 0 0 0-24 0v8" stroke="#111" strokeWidth="7" fill="none" />
          <path d="M26 48h20L36 62z" fill="#111" />
          <path d="M20 80 80 20" stroke={RED} strokeWidth="9" />
        </Ring>
      );
      break;
    case 'give-way':
      body = <path d="M6 12h88L50 90z" fill="#fff" stroke={RED} strokeWidth="9" strokeLinejoin="round" />;
      break;
    case 'pedestrian':
      body = (
        <Triangle>
          <circle cx="50" cy="40" r="5" fill="#111" />
          <path d="M50 46 46 62l-6 14M48 56l8 6 4 14M47 50l-7 6M52 50l8 4" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
        </Triangle>
      );
      break;
    case 'school':
      body = (
        <Triangle>
          <circle cx="40" cy="44" r="5" fill="#111" />
          <circle cx="60" cy="48" r="4" fill="#111" />
          <path d="M40 50v14l-5 12M40 62l5 14M60 53v11l-4 10M60 62l4 12M44 56l12 0" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
        </Triangle>
      );
      break;
    case 'bend':
      body = (
        <Triangle>
          <path d="M44 78V60c0-8 12-10 12-18V34" stroke="#111" strokeWidth="7" fill="none" />
          <path d="M48 36h16L56 24z" fill="#111" />
        </Triangle>
      );
      break;
    case 'road-works':
      body = (
        <Triangle>
          <circle cx="46" cy="40" r="5" fill="#111" />
          <path d="M46 46l-4 16 -8 12M44 56l10 4 6 12M48 50l14-6" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M58 76h14l-7-10z" fill="#111" />
        </Triangle>
      );
      break;
    case 'hospital':
      body = (
        <Panel>
          <rect x="22" y="22" width="56" height="56" rx="6" fill="#fff" />
          <text x="50" y="64" textAnchor="middle" fontSize="40" fontWeight="800" fill={BLUE} fontFamily="Noto Sans, sans-serif">
            H
          </text>
        </Panel>
      );
      break;
    case 'parking':
      body = (
        <Panel>
          <text x="50" y="68" textAnchor="middle" fontSize="54" fontWeight="800" fill="#fff" fontFamily="Noto Sans, sans-serif">
            P
          </text>
        </Panel>
      );
      break;
    case 'one-way':
      body = (
        <Panel>
          <path d="M18 50h50" stroke="#fff" strokeWidth="12" />
          <path d="M62 32 86 50 62 68z" fill="#fff" />
        </Panel>
      );
      break;
    default:
      body = <Ring />;
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={title}>
      {body}
    </svg>
  );
}
