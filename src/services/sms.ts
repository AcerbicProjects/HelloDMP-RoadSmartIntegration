// Rule-based SMS checker from the proposal (full PDF p.32): sender number, links, threatening deadlines,
// requests for PIN/OTP. Runs entirely on the device.
import { CONTACTS } from '../data/directory';
import type { L } from '../data/types';

export interface SmsCheck {
  verdict: 'fake' | 'official' | 'suspicious';
  findings: { ok: boolean; text: L }[];
}

const toAscii = (s: string) => s.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

export function checkSms(senderRaw: string, bodyRaw: string): SmsCheck {
  const sender = toAscii(senderRaw).replace(/[^0-9]/g, '').replace(/^880/, '0');
  const body = toAscii(bodyRaw);
  const findings: SmsCheck['findings'] = [];
  const officialSender = CONTACTS.officialSmsSenders.includes(sender);
  findings.push(
    officialSender
      ? { ok: true, text: { bn: 'প্রেরক DMP-এর অফিসিয়াল নম্বর', en: 'Sender is an official DMP number' } }
      : { ok: false, text: { bn: 'প্রেরক DMP-এর অফিসিয়াল নম্বর নয়', en: 'Sender is not an official DMP number' } },
  );
  const hasLink = /(https?:\/\/|www\.|\[\.\]|\.(com|xyz|net|top|info|site|online|link)\b|bit\.ly)/i.test(body);
  findings.push(
    hasLink
      ? { ok: false, text: { bn: 'লিংক আছে: DMP কখনো লিংক পাঠায় না', en: 'Contains a link: DMP never sends links' } }
      : { ok: true, text: { bn: 'কোনো লিংক নেই', en: 'No link' } },
  );
  const threat = /(দ্বিগুণ|২৪|24|48|৪৮|ঘণ্টার মধ্যে|ঘন্টার মধ্যে|স্থগিত|double|suspend|within \d+ hours|final notice|চূড়ান্ত)/i.test(body);
  if (threat) findings.push({ ok: false, text: { bn: '"জরিমানা দ্বিগুণ" বা সময়সীমার ভয় দেখানো হয়েছে', en: 'Uses a threatening deadline such as "fine doubles"' } });
  const asksSecret = /(pin|otp|পিন|ওটিপি|পাসওয়ার্ড|password|কার্ড নম্বর|card number)/i.test(body);
  if (asksSecret) findings.push({ ok: false, text: { bn: 'PIN, OTP বা কার্ডের তথ্য চাওয়া হয়েছে', en: 'Asks for a PIN, OTP or card details' } });
  const bad = findings.filter((f) => !f.ok).length;
  const verdict: SmsCheck['verdict'] = officialSender && bad === 0 ? 'official' : hasLink || asksSecret || (!officialSender && threat) ? 'fake' : 'suspicious';
  return { verdict, findings };
}

export const SAMPLE_FAKE_SMS = {
  sender: '018XX-XXXXXX',
  body: 'জরিমানা পরিশোধ-সংক্রান্ত চূড়ান্ত বিজ্ঞপ্তি: আপনার গাড়ির বিরুদ্ধে মামলা হয়েছে। ২৪ ঘণ্টার মধ্যে পরিশোধ না করলে জরিমানা দ্বিগুণ হবে: brta-fine[.]xyz',
};
