// Real Web Crypto, used to make the demo's integrity features genuine: photo fingerprints (SHA-256) and
// signed, expiring QR tokens for the wallet, receipts and certificates (HMAC-SHA256).
// The signing key is a fixed demo key; in production the server would sign with a protected key.

const DEMO_KEY = 'dmp-roadsmart-prototype-demo-key';
const enc = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(pad + '==='.slice((pad.length + 3) % 4))));
}

export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const bytes = typeof data === 'string' ? enc.encode(data) : data;
  return toHex(await crypto.subtle.digest('SHA-256', bytes));
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(DEMO_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message))).slice(0, 32);
}

export interface SignedPayload {
  t: 'wallet' | 'receipt' | 'cert' | 'rickshaw' | 'joint';
  exp?: number;
  [k: string]: unknown;
}

/** Produces "RS1.<payload>.<signature>", the string encoded into QR codes. */
export async function signToken(payload: SignedPayload): Promise<string> {
  const body = b64url(JSON.stringify(payload));
  return `RS1.${body}.${await hmac(body)}`;
}

export type VerifyResult =
  | { ok: true; payload: SignedPayload }
  | { ok: false; reason: 'format' | 'signature' | 'expired'; payload?: SignedPayload };

export async function verifyToken(token: string, now = Date.now()): Promise<VerifyResult> {
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'RS1') return { ok: false, reason: 'format' };
  let payload: SignedPayload;
  try {
    payload = JSON.parse(fromB64url(parts[1]));
  } catch {
    return { ok: false, reason: 'format' };
  }
  if ((await hmac(parts[1])) !== parts[2]) return { ok: false, reason: 'signature', payload };
  if (payload.exp && payload.exp < now) return { ok: false, reason: 'expired', payload };
  return { ok: true, payload };
}
