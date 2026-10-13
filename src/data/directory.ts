// Contact channels and online services shown by the existing Hello DMP app.
// Sources: screenshots 75a8ed72 (cyber crime), 59d864c8 (women & child), 0ce66abe (complaint),
// APK resources.arsc strings and OnlineServiceData (decoded from classes.dex).
import type { Hotline, OnlineService } from './types';

export const CONTACTS = {
  complaintEmail: 'complain@dmp.gov.bd',
  cyberHotline: '01320202020',
  cyberEmail: 'cybersupportdbdmp@police.gov.bd',
  cyberFacebook: 'https://www.facebook.com/cybersupportdb',
  womenDutyOfficer: '01320042055',
  womenEmail: 'vsccrime@dmp.gov.bd',
  /** Opened in a web view by the current app's women & child screen (WomenAndChildFragment, classes.dex).
   * Which on-screen card opens it is inferred, not confirmed (see README, "Needs verification"). */
  womenDivisionSite: 'http://dmpwsid.gov.bd/',
  roadLawPdf: 'https://duty.dmp.gov.bd/road-law-bd.pdf',
  dmpAddress: { bn: 'ডিএমপি: ৩৬ ক্যাপ্টেন মনসুর আলী সরণী, রমনা, ঢাকা।', en: 'DMP: 36 Captain Mansur Ali Sarani, Ramna, Dhaka.' },
  /** Official DMP fine-notice SMS senders named in the RoadSmart proposal (full PDF p.10 and p.32). */
  officialSmsSenders: ['01320042207', '01320042227'],
};

// Order and URLs follow OnlineServiceData.getOnlineServices; pairing of names to links is inferred from
// resource order (see README, "Needs verification").
export const ONLINE_SERVICES: OnlineService[] = [
  {
    id: 'blood-bank',
    name: { bn: 'পুলিশ ব্লাড ব্যাংক', en: 'Police Blood Bank' },
    desc: { bn: 'রক্তের প্রয়োজনে ডিএমপি ব্লাড ব্যাংকের তথ্য', en: 'Find blood through the DMP blood bank' },
    url: 'https://dmp.gov.bd/police-blood-bank/',
    kind: 'web',
    icon: 'Droplet',
  },
  {
    id: 'online-gd',
    name: { bn: 'অনলাইন জিডি (GD)', en: 'Online GD' },
    desc: { bn: 'হারানো জিনিস ও অন্যান্য বিষয়ে অনলাইনে সাধারণ ডায়েরি', en: 'File a General Diary online for lost items and more' },
    url: 'https://play.google.com/store/apps/details?id=com.opus_bd.lostandfound',
    kind: 'app',
    icon: 'FileText',
  },
  {
    id: 'pcc',
    name: { bn: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেট', en: 'Police Clearance Certificate' },
    desc: { bn: 'অনলাইনে PCC-এর আবেদন ও অবস্থা', en: 'Apply for and track a PCC online' },
    url: 'https://pcc.police.gov.bd',
    kind: 'web',
    icon: 'BadgeCheck',
  },
  {
    id: 'cims',
    name: { bn: 'সি আই এম এস - ডিএমপি (CIMS)', en: 'CIMS - DMP' },
    desc: { bn: 'নাগরিক তথ্য ব্যবস্থাপনা অ্যাপ', en: 'Citizen information management app' },
    url: 'https://play.google.com/store/apps/details?id=com.cims.dmpapp',
    kind: 'app',
    icon: 'Users',
  },
  {
    id: 'hbms',
    name: { bn: 'হোটেল বোর্ডার ম্যানেজমেন্ট সিস্টেম (HBMS)', en: 'Hotel Boarder Management System (HBMS)' },
    desc: { bn: 'হোটেল অতিথির তথ্য নিবন্ধন', en: 'Hotel guest registration' },
    url: 'https://hbms.dmp.gov.bd/',
    kind: 'web',
    icon: 'Building2',
  },
  {
    id: 'phonebook',
    name: { bn: 'আমার পুলিশ ফোন বুক', en: 'Amar Police Phone Book' },
    desc: { bn: 'পুলিশ ইউনিটগুলোর ফোন নম্বর', en: 'Phone numbers of police units' },
    url: 'https://play.google.com/store/apps/details?id=amar.police.phonebook',
    kind: 'app',
    icon: 'BookUser',
  },
  {
    id: 'smart-citizen',
    name: { bn: 'স্মার্ট সিটিজেন - অনলাইন', en: 'Smart Citizen - Online' },
    desc: { bn: 'ডিএমপি ওয়েবসাইটের নাগরিক সেবা', en: 'Citizen services on the DMP website' },
    url: 'https://dmp.gov.bd/',
    kind: 'web',
    icon: 'Globe',
  },
];

/** Numbers that are confirmed by a screenshot, the app's FAQ text or the proposal. */
export const EMERGENCY_NUMBERS: Hotline[] = [
  { id: '999', label: { bn: 'জাতীয় জরুরি সেবা (পুলিশ, ফায়ার, অ্যাম্বুলেন্স)', en: 'National emergency (police, fire, ambulance)' }, numbers: ['999'] },
  { id: 'dmp-help', label: { bn: 'ডিএমপি হেল্পলাইন', en: 'DMP helpline' }, numbers: ['01817602050'] },
  { id: 'traffic', label: { bn: 'ঢাকা ট্রাফিক পুলিশ হেল্পলাইন', en: 'Dhaka Traffic Police helpline' }, numbers: ['01711000990'] },
  { id: 'cyber', label: { bn: 'পুলিশ সাইবার সাপোর্ট সেল', en: 'Police Cyber Support Cell' }, numbers: ['01320202020'] },
  { id: 'women', label: { bn: 'নারী ও শিশু: ডিউটি অফিসার', en: 'Women & children: duty officer' }, numbers: ['01320042055'] },
  { id: '109', label: { bn: 'নারী ও শিশু হেল্পলাইন (বিনামূল্যে)', en: 'Women & child helpline (free)' }, numbers: ['109'] },
  { id: 'pcc', label: { bn: 'পুলিশ ক্লিয়ারেন্স যোগাযোগ', en: 'Police clearance contact' }, numbers: ['01320037329'] },
];
