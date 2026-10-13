import type { L, Lang } from '../data/types';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBnDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function localDigits(s: string | number, lang: Lang): string {
  const str = String(s);
  return lang === 'bn' ? toBnDigits(str) : str;
}

export function pick(l: L | undefined, lang: Lang): string {
  if (!l) return '';
  return l[lang] || l.bn;
}

export function formatNumber(n: number, lang: Lang): string {
  return localDigits(n.toLocaleString('en-IN'), lang);
}

export function formatTaka(n: number, lang: Lang): string {
  return `৳${formatNumber(n, lang)}`;
}

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return lang === 'bn'
    ? `${toBnDigits(String(d.getDate()))} ${BN_MONTHS[d.getMonth()]} ${toBnDigits(String(d.getFullYear()))}`
    : `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  if (lang === 'bn') {
    const part = h < 12 ? (h < 5 ? 'রাত' : 'সকাল') : h < 17 ? 'বিকেল' : h < 19 ? 'সন্ধ্যা' : 'রাত';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${part} ${toBnDigits(`${h12}:${m}`)}`;
  }
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

export function formatDateTime(iso: string, lang: Lang): string {
  return `${formatDate(iso, lang)}, ${formatTime(iso, lang)}`;
}

export function relativeTime(iso: string, lang: Lang, now = Date.now()): string {
  const diff = Math.round((now - new Date(iso).getTime()) / 60000);
  const future = diff < 0;
  const m = Math.abs(diff);
  const n = (v: number) => localDigits(v, lang);
  let core: string;
  if (m < 1) return lang === 'bn' ? 'এইমাত্র' : 'just now';
  if (m < 60) core = lang === 'bn' ? `${n(m)} মিনিট` : `${m} min`;
  else if (m < 1440) core = lang === 'bn' ? `${n(Math.round(m / 60))} ঘণ্টা` : `${Math.round(m / 60)} h`;
  else core = lang === 'bn' ? `${n(Math.round(m / 1440))} দিন` : `${Math.round(m / 1440)} d`;
  if (future) return lang === 'bn' ? `${core} পরে` : `in ${core}`;
  return lang === 'bn' ? `${core} আগে` : `${core} ago`;
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
}

/** Formats an 11-digit Bangladeshi number as 01XXX-XXXXXX for display. */
export function formatPhone(raw: string, lang: Lang): string {
  const digits = raw.replace(/[^0-9+]/g, '');
  const pretty = /^01\d{9}$/.test(digits) ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  return localDigits(pretty, lang);
}

export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^0-9+]/g, '')}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
