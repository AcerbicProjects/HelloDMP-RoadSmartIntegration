// Knowledge base for the RoadSmart AI law assistant demo (proposal full PDF p.33, workbook PR-009).
// The prototype answers by keyword retrieval over these entries; a production version would use
// retrieval-augmented generation over the Road Transport Act 2018 and DMP directives.
// Section numbers are deliberately left for DMP legal review, as in the proposal mock-ups.
import type { KnowledgeEntry } from './types';
import { FAQS } from './faqs';

const ACT = { bn: 'সড়ক পরিবহন আইন, ২০১৮ (ধারা নম্বর DMP আইন শাখার যাচাই সাপেক্ষে)', en: 'Road Transport Act 2018 (section number pending DMP legal review)' };
const DIRECTIVE = { bn: 'DMP ট্রাফিক বিভাগের নির্দেশনা (প্রোটোটাইপ নমুনা)', en: 'DMP Traffic Division guidance (prototype sample)' };

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'wrong-ai-case',
    keywords: ['ভুল', 'ai', 'ক্যামেরা', 'মামলা', 'আপত্তি', 'wrong', 'camera', 'case', 'objection', 'mistake', 'plate'],
    question: { bn: 'AI ক্যামেরার মামলা ভুল মনে হলে কী করব?', en: 'What if I think an AI camera case is wrong?' },
    simple: { bn: 'মামলাটি খুলে "আপত্তি জানান" চাপুন। কারণ বেছে নিয়ে ছবি বা কাগজ যুক্ত করুন। একজন অফিসার ভিডিও প্রমাণ আবার দেখবেন। আপত্তি চলাকালীন পরিশোধের সময়সীমা স্থগিত থাকবে (প্রস্তাবিত)।', en: 'Open the case and tap "Object". Choose a reason and attach a photo or document. An officer will review the video evidence again. The payment deadline is paused while the objection is open (proposed).' },
    original: { bn: 'আইন অনুযায়ী অভিযুক্ত ব্যক্তি মামলার বিষয়ে আপত্তি উত্থাপন ও শুনানির সুযোগ পাবেন। AI-শনাক্ত প্রতিটি মামলা নোটিশের আগে অফিসার যাচাই করেন।', en: 'Under the law the accused may raise an objection and be heard. Every AI-detected case is checked by an officer before a notice is sent.' },
    source: ACT,
    actions: [{ label: { bn: 'আমার মামলা দেখুন', en: 'View my cases' }, to: '/cases' }],
  },
  {
    id: 'fake-sms',
    keywords: ['sms', 'এসএমএস', 'আসল', 'ভুয়া', 'লিংক', 'fake', 'link', 'real', 'message', 'বার্তা'],
    question: { bn: 'যে SMS এসেছে সেটা আসল কি না বুঝব কীভাবে?', en: 'How do I know if a fine SMS is real?' },
    simple: { bn: 'DMP-এর SMS শুধু 01320-042207 ও 01320-042227 নম্বর থেকে আসে এবং তাতে কখনো লিংক থাকে না। লিংক বা "২৪ ঘণ্টায় দ্বিগুণ" জাতীয় ভয় দেখালে সেটি ভুয়া। অ্যাপের "SMS যাচাই"-এ পেস্ট করে দেখুন।', en: 'DMP messages come only from 01320-042207 and 01320-042227 and never contain a link. A link, or a threat like "doubles in 24 hours", means it is fake. Paste it into "Check SMS" in the app.' },
    original: { bn: 'DMP কখনো PIN বা OTP চায় না। অফিসিয়াল নোটিশ শুধু অ্যাপের ভেতরে দেখা যায়।', en: 'DMP never asks for a PIN or OTP. Official notices are shown only inside the app.' },
    source: DIRECTIVE,
    actions: [{ label: { bn: 'SMS যাচাই করুন', en: 'Check an SMS' }, to: '/sms-check' }],
  },
  {
    id: 'sergeant-rights',
    keywords: ['সার্জেন্ট', 'থামালে', 'অধিকার', 'চেকিং', 'sergeant', 'stopped', 'rights', 'checkpoint', 'police'],
    question: { bn: 'ট্রাফিক সার্জেন্ট থামালে আমার কী অধিকার?', en: 'What are my rights if a traffic sergeant stops me?' },
    simple: { bn: 'আপনি জানতে চাইতে পারেন কোন আইন ভঙ্গের জন্য থামানো হয়েছে, মামলা হলে POS রসিদ পাবেন কি না, এবং অফিসারের নাম ও পদবি। জরিমানা নগদে দেবেন না।', en: 'You may ask which rule you were stopped for, whether you will get a POS receipt if there is a case, and the officer\'s name and rank. Never pay a fine in cash.' },
    original: { bn: 'জরিমানা আদায় শুধু অনুমোদিত POS বা অফিসিয়াল ডিজিটাল মাধ্যমে হয়।', en: 'Fines are collected only through authorised POS devices or official digital channels.' },
    source: DIRECTIVE,
    actions: [{ label: { bn: 'চেকিংয়ে থামালে গাইড', en: 'Checkpoint guide' }, to: '/learn/guide/checkpoint' }],
  },
  {
    id: 'minor-accident',
    keywords: ['দুর্ঘটনা', 'ছোট', 'যৌথ', 'accident', 'crash', 'minor', 'joint', 'collision'],
    question: { bn: 'ছোট দুর্ঘটনার পর কী করব?', en: 'What do I do after a minor accident?' },
    simple: { bn: 'আগে নিরাপদ জায়গায় সরে যান। কেউ আহত হলে ৯৯৯-এ কল করুন। কেউ আহত না হলে দুই চালক অ্যাপে QR স্ক্যান করে একটি যৌথ রিপোর্ট দিতে পারেন; এটি DMP-JICA-র DARC ডেটাবেসে খসড়া হিসেবে যাবে।', en: 'First move to safety. Call 999 if anyone is hurt. If nobody is hurt, both drivers can scan a QR code and file one joint report; it goes to the DMP-JICA DARC database as a draft.' },
    original: { bn: 'দুর্ঘটনায় আহতকে সহায়তা ও পুলিশকে অবহিত করা চালকের দায়িত্ব।', en: 'Drivers involved in a crash must help the injured and inform the police.' },
    source: ACT,
    actions: [{ label: { bn: 'যৌথ দুর্ঘটনা রিপোর্ট', en: 'Joint accident report' }, to: '/report/joint' }, { label: { bn: 'চেকলিস্ট', en: 'Checklist' }, to: '/learn/guide/post-accident' }],
  },
  {
    id: 'helmet',
    keywords: ['হেলমেট', 'মোটরসাইকেল', 'আরোহী', 'helmet', 'motorcycle', 'bike', 'passenger'],
    question: { bn: 'মোটরসাইকেলে হেলমেটের নিয়ম কী?', en: 'What is the helmet rule on a motorcycle?' },
    simple: { bn: 'চালক ও আরোহী দুজনকেই মানসম্মত হেলমেট পরতে হবে। হেলমেট ছাড়া চালানো AI ক্যামেরাও শনাক্ত করে।', en: 'Both rider and passenger must wear a standard helmet. AI cameras also detect riding without one.' },
    original: { bn: 'মোটরসাইকেল চালক ও আরোহীর জন্য নির্ধারিত মানের হেলমেট পরিধান বাধ্যতামূলক।', en: 'Wearing a helmet of the prescribed standard is mandatory for riders and passengers.' },
    source: ACT,
    actions: [{ label: { bn: 'হেলমেট পাঠ', en: 'Helmet lesson' }, to: '/learn/lesson/helmet' }],
  },
  {
    id: 'documents',
    keywords: ['কাগজ', 'লাইসেন্স', 'নিবন্ধন', 'ফিটনেস', 'ট্যাক্স', 'documents', 'licence', 'license', 'registration', 'papers', 'qr', 'wallet'],
    question: { bn: 'গাড়ি চালাতে কোন কাগজ সঙ্গে রাখতে হয়?', en: 'Which documents must I carry when driving?' },
    simple: { bn: 'ড্রাইভিং লাইসেন্স, গাড়ির নিবন্ধন (DRC), ফিটনেস ও ট্যাক্স টোকেন। RoadSmart-এর QR ওয়ালেটে এগুলো BRTA থেকে যাচাই হয়ে এক QR-এ থাকে।', en: 'Driving licence, vehicle registration (DRC), fitness certificate and tax token. The RoadSmart QR wallet keeps them in one QR code, verified with BRTA.' },
    original: { bn: 'চালককে বৈধ ড্রাইভিং লাইসেন্স এবং যানবাহনের বৈধ কাগজপত্র বহন ও চাহিদামতো প্রদর্শন করতে হবে।', en: 'A driver must carry and show on request a valid licence and valid vehicle documents.' },
    source: ACT,
    actions: [{ label: { bn: 'QR ওয়ালেট', en: 'QR wallet' }, to: '/wallet' }],
  },
  {
    id: 'pay',
    keywords: ['পরিশোধ', 'জরিমানা', 'বিকাশ', 'নগদ', 'pay', 'fine', 'bkash', 'nagad', 'payment', 'rocket'],
    question: { bn: 'জরিমানা কীভাবে পরিশোধ করব?', en: 'How do I pay a fine?' },
    simple: { bn: 'অ্যাপে মামলাটি খুলে "পরিশোধ করুন" চাপুন। বিকাশ, নগদ, রকেট, কার্ড বা ekPay দিয়ে শুধু নিবন্ধিত DMP merchant-এ পরিশোধ হয়। পরিশোধের পর QR রসিদ পাবেন।', en: 'Open the case and tap "Pay". bKash, Nagad, Rocket, card or ekPay go only to the registered DMP merchant. You get a QR receipt afterwards.' },
    original: { bn: 'আগে জরিমানা দিতে DMP সদর দপ্তর বা ট্রাফিক বিভাগে যেতে হতো।', en: 'Previously fines had to be paid in person at DMP headquarters or a traffic division.' },
    source: DIRECTIVE,
    actions: [{ label: { bn: 'আমার মামলা', en: 'My cases' }, to: '/cases' }],
  },
  {
    id: 'speed',
    keywords: ['গতি', 'অতিরিক্ত', 'গড়', 'speed', 'speeding', 'average', 'limit', 'fast'],
    question: { bn: 'গড় গতির মামলা কীভাবে হিসাব হয়?', en: 'How is an average-speed case calculated?' },
    simple: { bn: 'দুটি ক্যামেরার মাঝের দূরত্বকে পার হতে লাগা সময় দিয়ে ভাগ করা হয়। দুই ক্যামেরার ছবিতে একই নম্বর প্লেট মিলিয়ে দেখা হয়।', en: 'The distance between two cameras is divided by the time taken. The same number plate is matched in both camera images.' },
    original: { bn: 'নির্ধারিত গতিসীমার অধিক গতিতে মোটরযান চালানো দণ্ডনীয় অপরাধ।', en: 'Driving above the set speed limit is an offence.' },
    source: ACT,
    actions: [{ label: { bn: 'লঙ্ঘনের ধরন', en: 'Violation types' }, to: '/violations' }],
  },
  {
    id: 'driver-nominate',
    keywords: ['প্রকৃত', 'চালক', 'মালিক', 'মনোনয়ন', 'driver', 'owner', 'nominate', 'actual'],
    question: { bn: 'আমি গাড়ির মালিক, কিন্তু অন্য কেউ চালাচ্ছিলেন। কী করব?', en: 'I own the car but someone else was driving. What do I do?' },
    simple: { bn: 'মামলায় "আমি চালাইনি?" চাপুন এবং প্রকৃত চালকের নাম, লাইসেন্স ও মোবাইল দিন। চালক অ্যাপে নিশ্চিত করলে জরিমানা ও দোষসূচক পয়েন্ট তাঁর নামে যাবে।', en: 'Tap "Not me driving?" on the case and enter the actual driver\'s name, licence and mobile. Once the driver confirms in the app, the fine and points move to them.' },
    original: { bn: 'চালক ৭ দিনের মধ্যে নিশ্চিত না করলে মামলা মালিকের নামে থাকবে (প্রস্তাবিত)।', en: 'If the driver does not confirm within 7 days, the case stays with the owner (proposed).' },
    source: DIRECTIVE,
  },
  {
    id: 'rickshaw',
    keywords: ['রিক্সা', 'ই-রিক্সা', 'অটো', 'rickshaw', 'e-rickshaw', 'easy bike', 'zone'],
    question: { bn: 'ই-রিক্সা বৈধ কি না কীভাবে বুঝব?', en: 'How can I tell if an e-rickshaw is legal?' },
    simple: { bn: 'রিক্সার নম্বর প্লেট বা চালকের পরিচয়পত্রের QR স্ক্যান করুন। নিবন্ধন, জোন, রুট পারমিট ও চালকের ছবি মিলিয়ে দেখুন। অতিরিক্ত যাত্রী বা জোনের বাইরে চললে অভিযোগ করুন।', en: 'Scan the QR on the plate or the driver\'s ID. Check the registration, zone, route permit and driver photo. Complain if it is overloaded or outside its zone.' },
    original: { bn: 'সংশোধনাধীন ই-রিক্সা বিধিমালায় QR নম্বর প্লেট ও চালকের QR পরিচয়পত্রের প্রস্তাব রয়েছে।', en: 'The draft e-rickshaw rules propose QR number plates and QR driver IDs.' },
    source: { bn: 'সংশোধনাধীন ই-রিক্সা বিধিমালা', en: 'Draft e-rickshaw rules' },
    actions: [{ label: { bn: 'ই-রিক্সা স্ক্যান', en: 'Scan e-rickshaw' }, to: '/rickshaw' }],
  },
  {
    id: 'red-light',
    keywords: ['লাল', 'বাতি', 'সিগন্যাল', 'স্টপ', 'red', 'light', 'signal', 'stop line'],
    question: { bn: 'লাল বাতি অমান্য করলে কী হয়?', en: 'What happens if I run a red light?' },
    simple: { bn: 'AI ক্যামেরা ছবি ও ভিডিও রেকর্ড করে। অফিসার যাচাইয়ের পর মামলা অ্যাপে আসে, প্রমাণসহ। জরিমানা ও দোষসূচক পয়েন্ট যোগ হয়।', en: 'AI cameras record photos and video. After an officer checks it, the case appears in the app with the evidence. A fine and penalty points apply.' },
    original: { bn: 'ট্রাফিক সংকেত অমান্য করা আইনে দণ্ডনীয় অপরাধ।', en: 'Disobeying traffic signals is an offence under the Act.' },
    source: ACT,
  },
  {
    id: 'emergency',
    keywords: ['জরুরি', '৯৯৯', 'সাহায্য', 'emergency', '999', 'help', 'sos', 'ambulance'],
    question: { bn: 'জরুরি সাহায্য দরকার হলে কী করব?', en: 'What do I do in an emergency?' },
    simple: { bn: 'সরাসরি ৯৯৯-এ কল করুন। অ্যাপের লাল SOS বোতাম চাপলে আপনার অবস্থান নিকটস্থ ইউনিটে যায়।', en: 'Call 999 directly. The red SOS button sends your location to the nearest unit.' },
    original: { bn: 'RoadSmart নতুন কোনো ৯৯৯ নয়; জরুরি অবস্থায় ৯৯৯-এ escalation হয়।', en: 'RoadSmart is not another 999; emergencies are escalated to 999.' },
    source: DIRECTIVE,
    actions: [{ label: { bn: 'জরুরি সাহায্য', en: 'Emergency help' }, to: '/sos' }],
  },
];

/** Everyday spellings people type that the FAQ wording does not contain. */
const FAQ_ALIASES: Record<number, string[]> = {
  1: ['জিডি', 'gd', 'diary', 'ডায়েরি'],
  2: ['ক্লিয়ারেন্স', 'clearance', 'pcc'],
  4: ['ফোন', 'phone', 'mobile'],
  16: ['এনআইডি', 'nid', 'আইডি'],
  18: ['পাসপোর্ট', 'passport'],
};

/** FAQ entries from the existing app are part of the assistant's knowledge too. */
export const FAQ_KNOWLEDGE: KnowledgeEntry[] = FAQS.map((f) => ({
  id: `faq-${f.id}`,
  keywords: [...f.q.bn.replace(/[()?]/g, ' ').split(/\s+/), ...f.q.en.toLowerCase().split(/\W+/), ...(FAQ_ALIASES[f.id] ?? [])].filter((w) => w.length > 1),
  question: f.q,
  simple: f.a,
  original: f.a,
  source: { bn: 'Hello DMP প্রশ্নোত্তর (FAQ)', en: 'Hello DMP FAQ' },
}));
