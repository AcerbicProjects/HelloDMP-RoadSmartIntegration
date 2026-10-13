// Deterministic demo dataset. Timestamps are generated relative to the moment the demo is seeded
// (first launch or "Reset demo data") so that "10 minutes ago" stays meaningful in every demo.
// All people, vehicles, cases and reports are fictional.
import type { AppState, Area, Officer, Rickshaw, Settings } from './types';

export const SEED_VERSION = 4;

export const AREAS: Area[] = [
  { id: 'farmgate', name: { bn: 'ফার্মগেট', en: 'Farmgate' }, lat: 23.7577, lng: 90.3897 },
  { id: 'karwan', name: { bn: 'কারওয়ান বাজার', en: 'Karwan Bazar' }, lat: 23.7509, lng: 90.3935 },
  { id: 'bijoy', name: { bn: 'বিজয় সরণি', en: 'Bijoy Sarani' }, lat: 23.765, lng: 90.389 },
  { id: 'shahbag', name: { bn: 'শাহবাগ', en: 'Shahbagh' }, lat: 23.7383, lng: 90.3958 },
  { id: 'motijheel', name: { bn: 'মতিঝিল', en: 'Motijheel' }, lat: 23.733, lng: 90.4172 },
  { id: 'mohakhali', name: { bn: 'মহাখালী', en: 'Mohakhali' }, lat: 23.7778, lng: 90.4053 },
  { id: 'gulshan', name: { bn: 'গুলশান', en: 'Gulshan' }, lat: 23.7925, lng: 90.4155 },
  { id: 'badda', name: { bn: 'বাড্ডা', en: 'Badda' }, lat: 23.7806, lng: 90.4262 },
  { id: 'rampura', name: { bn: 'রামপুরা', en: 'Rampura' }, lat: 23.7623, lng: 90.4211 },
  { id: 'malibagh', name: { bn: 'মালিবাগ', en: 'Malibagh' }, lat: 23.7489, lng: 90.4126 },
  { id: 'hatirjheel', name: { bn: 'হাতিরঝিল', en: 'Hatirjheel' }, lat: 23.7559, lng: 90.4053 },
  { id: 'kakrail', name: { bn: 'কাকরাইল', en: 'Kakrail' }, lat: 23.7375, lng: 90.4078 },
  { id: 'mirpur10', name: { bn: 'মিরপুর-১০', en: 'Mirpur-10' }, lat: 23.8069, lng: 90.3687 },
  { id: 'uttara', name: { bn: 'উত্তরা', en: 'Uttara' }, lat: 23.8613, lng: 90.4001 },
  { id: 'jatrabari', name: { bn: 'যাত্রাবাড়ী', en: 'Jatrabari' }, lat: 23.7104, lng: 90.4349 },
  { id: 'dhanmondi', name: { bn: 'ধানমন্ডি', en: 'Dhanmondi' }, lat: 23.7465, lng: 90.3760 },
];

export const OFFICERS: Officer[] = [
  { id: 'O1', name: { bn: 'সার্জেন্ট মো. তানভীর আহমেদ', en: 'Sergeant Md. Tanvir Ahmed' }, rank: { bn: 'সার্জেন্ট', en: 'Sergeant' }, thanaId: 'T42', division: { bn: 'তেজগাঁও ট্রাফিক বিভাগ · ফার্মগেট পয়েন্ট', en: 'Tejgaon Traffic Division · Farmgate point' }, lat: 23.7583, lng: 90.3903, onDuty: true },
  { id: 'O2', name: { bn: 'সার্জেন্ট নুসরাত জাহান', en: 'Sergeant Nusrat Jahan' }, rank: { bn: 'সার্জেন্ট', en: 'Sergeant' }, thanaId: 'T13', division: { bn: 'গুলশান ট্রাফিক বিভাগ', en: 'Gulshan Traffic Division' }, lat: 23.7911, lng: 90.4148, onDuty: true },
  { id: 'O3', name: { bn: 'টিআই মো. শফিকুল ইসলাম', en: 'TI Md. Shafiqul Islam' }, rank: { bn: 'ট্রাফিক ইন্সপেক্টর', en: 'Traffic Inspector' }, thanaId: 'T26', division: { bn: 'মতিঝিল ট্রাফিক বিভাগ', en: 'Motijheel Traffic Division' }, lat: 23.7322, lng: 90.4166, onDuty: true },
  { id: 'O4', name: { bn: 'সার্জেন্ট রাকিব হাসান', en: 'Sergeant Rakib Hasan' }, rank: { bn: 'সার্জেন্ট', en: 'Sergeant' }, thanaId: 'T24', division: { bn: 'মিরপুর ট্রাফিক বিভাগ', en: 'Mirpur Traffic Division' }, lat: 23.8062, lng: 90.368, onDuty: true },
  { id: 'O5', name: { bn: 'সার্জেন্ট ফারহানা আক্তার', en: 'Sergeant Farhana Akter' }, rank: { bn: 'সার্জেন্ট', en: 'Sergeant' }, thanaId: 'T32', division: { bn: 'রামপুরা ট্রাফিক বিভাগ', en: 'Rampura Traffic Division' }, lat: 23.7628, lng: 90.4206, onDuty: false },
  { id: 'O6', name: { bn: 'সার্জেন্ট মাহমুদুল করিম', en: 'Sergeant Mahmudul Karim' }, rank: { bn: 'সার্জেন্ট', en: 'Sergeant' }, thanaId: 'T15', division: { bn: 'ওয়ারী ট্রাফিক বিভাগ', en: 'Wari Traffic Division' }, lat: 23.7112, lng: 90.4339, onDuty: true },
];

export const RICKSHAWS: Rickshaw[] = [
  { regNo: 'ER-DN2-00145', category: { bn: 'টাইপ-বি · অনুমোদিত যাত্রী ৪ জন', en: 'Type B · 4 passengers allowed' }, zone: { name: { bn: 'উত্তর-২', en: 'North-2' }, color: '#2563eb' }, route: { bn: 'জোনের ভেতরের সড়ক; প্রধান সড়কে নিষেধ', en: 'Roads inside the zone; main roads prohibited' }, validUntil: '2027-03-31', status: 'valid', driver: { name: { bn: 'মো. আব্দুল কাদের', en: 'Md. Abdul Kader' }, license: 'ERD-2026-07781', licenseValid: true } },
  { regNo: 'ER-DS1-00872', category: { bn: 'টাইপ-এ · অনুমোদিত যাত্রী ৬ জন', en: 'Type A · 6 passengers allowed' }, zone: { name: { bn: 'দক্ষিণ-১', en: 'South-1' }, color: '#16a34a' }, route: { bn: 'যাত্রাবাড়ী–সায়েদাবাদ জোনের ভেতরের সড়ক', en: 'Inner roads of the Jatrabari–Sayedabad zone' }, validUntil: '2026-09-30', status: 'expired', driver: { name: { bn: 'মো. সেলিম মিয়া', en: 'Md. Selim Mia' }, license: 'ERD-2025-03342', licenseValid: false } },
  { regNo: 'ER-DN3-01210', category: { bn: 'টাইপ-বি · অনুমোদিত যাত্রী ৪ জন', en: 'Type B · 4 passengers allowed' }, zone: { name: { bn: 'উত্তর-৩', en: 'North-3' }, color: '#9333ea' }, route: { bn: 'মিরপুর ১১–১২ জোনের ভেতরের সড়ক', en: 'Inner roads of the Mirpur 11–12 zone' }, validUntil: '2027-01-15', status: 'valid', driver: { name: { bn: 'জাহাঙ্গীর আলম', en: 'Jahangir Alam' }, license: 'ERD-2026-01954', licenseValid: true } },
];

export const DEFAULT_SETTINGS: Settings = {
  lang: 'bn',
  textScale: 1,
  highContrast: false,
  lowBandwidth: false,
  simulateFailure: false,
  onboarded: false,
  role: 'citizen',
  notif: { alerts: true, cases: true, reports: true, announcements: true, quietHours: false, quietFrom: '23:00', quietTo: '07:00', minSeverity: 'minor' },
  consent: { accepted: false, location: false, camera: false, notifications: false, analytics: false },
  locationRationaleSeen: false,
};

/** Fixed RNG-free helpers so every seed is identical apart from the anchor time. */
function at(now: number, minutesAgo: number) {
  return new Date(now - minutesAgo * 60_000).toISOString();
}
function day(now: number, daysFromNow: number) {
  return new Date(now + daysFromNow * 86_400_000).toISOString();
}

export function createSeed(now = Date.now(), keep?: Partial<Settings>): AppState {
  const settings: Settings = { ...DEFAULT_SETTINGS, ...keep };
  return {
    version: SEED_VERSION,
    seededAt: new Date(now).toISOString(),
    settings,
    session: { loggedIn: false, officerId: 'O1' },
    profile: {
      name: 'Rafiul Islam',
      mobile: '01711234567',
      tier: 1,
      nidLinked: false,
      vehicleIds: ['V1', 'V2'],
    },
    vehicles: [
      { id: 'V1', regNo: { bn: 'ঢাকা মেট্রো-গ ১২-৩৪৫৬', en: 'Dhaka Metro-Ga 12-3456' }, kind: { bn: 'প্রাইভেট কার', en: 'Private car' }, ownership: 'owner', drcValid: true, fitnessUntil: '2027-06-30', taxTokenUntil: '2027-06-30', insurance: 'pending' },
      { id: 'V2', regNo: { bn: 'ঢাকা মেট্রো-ল ২১-৭৭৮৮', en: 'Dhaka Metro-La 21-7788' }, kind: { bn: 'মোটরসাইকেল', en: 'Motorcycle' }, ownership: 'owner', drcValid: true, fitnessUntil: '2028-01-31', taxTokenUntil: '2026-12-31', insurance: 'pending' },
    ],
    cases: [
      { id: 'DMP-AI-2026-0712-0458', vehicleId: 'V1', violation: 'red_light', location: { bn: 'ফার্মগেট মোড়', en: 'Farmgate junction' }, occurredAt: at(now, 3 * 1440 + 200), dueDate: day(now, 27), amount: 5000, source: 'ai_camera', camera: 'CAM-FG-03', officerVerified: true, status: 'unpaid' },
      { id: 'DMP-AI-2026-0721-1133', vehicleId: 'V1', violation: 'speeding', location: { bn: 'বিজয় সরণি → ফার্মগেট', en: 'Bijoy Sarani → Farmgate' }, occurredAt: at(now, 9 * 1440 + 40), dueDate: day(now, 20), amount: 3000, source: 'ai_camera', camera: 'CAM-BS-01 / CAM-FG-02', officerVerified: true, status: 'unpaid', speed: { camA: { bn: 'বিজয় সরণি', en: 'Bijoy Sarani' }, camB: { bn: 'ফার্মগেট', en: 'Farmgate' }, timeA: '08:12:04', timeB: '08:13:10', distanceKm: 1.8, limitKmh: 60 } },
      { id: 'DMP-AI-2026-0703-0291', vehicleId: 'V1', violation: 'stop_line', location: { bn: 'কারওয়ান বাজার', en: 'Karwan Bazar' }, occurredAt: at(now, 12 * 1440), dueDate: day(now, 15), amount: 2000, source: 'ai_camera', camera: 'CAM-KB-02', officerVerified: true, status: 'objection', objection: { reason: 'plate_misread', details: 'ছবিতে প্লেটের শেষ অঙ্ক ৮, আমার গাড়ির শেষ অঙ্ক ৬।', attachments: ['drc-copy.jpg'], submittedAt: at(now, 2 * 1440) } },
      { id: 'DMP-POS-2026-0628-7710', vehicleId: 'V1', violation: 'illegal_parking', location: { bn: 'গুলশান-২', en: 'Gulshan-2' }, occurredAt: at(now, 30 * 1440), dueDate: day(now, -2), amount: 1000, source: 'sergeant', camera: 'POS-GL-114', officerVerified: true, status: 'paid', payment: { method: 'bkash', txnId: 'BK8F3K29QX', paidAt: at(now, 28 * 1440), amountPaid: 1000, discount: 0, receiptNo: 'RS-2026-884127' } },
      { id: 'DMP-AI-2026-0915-2207', vehicleId: 'V2', violation: 'no_helmet', location: { bn: 'মিরপুর-১০ গোলচত্বর', en: 'Mirpur-10 roundabout' }, occurredAt: at(now, 1 * 1440 + 300), dueDate: day(now, 29), amount: 1000, source: 'ai_camera', camera: 'CAM-MP-10', officerVerified: true, status: 'unpaid' },
      { id: 'DMP-AI-2026-0807-0912', vehicleId: 'V2', violation: 'wrong_way', location: { bn: 'হাতিরঝিল লিংক রোড', en: 'Hatirjheel link road' }, occurredAt: at(now, 45 * 1440), dueDate: day(now, -15), amount: 2000, source: 'ai_camera', camera: 'CAM-HJ-05', officerVerified: true, status: 'cancelled', objection: { reason: 'elsewhere', details: 'সে সময় গাড়িটি সার্ভিস সেন্টারে ছিল; রসিদ সংযুক্ত।', attachments: ['service-receipt.pdf'], submittedAt: at(now, 43 * 1440), decision: 'accepted', decidedAt: at(now, 40 * 1440), decisionNote: { bn: 'ভিডিওতে ভিন্ন গাড়ি শনাক্ত হয়েছে; মামলা বাতিল।', en: 'Video shows a different vehicle; case cancelled.' } } },
      // A pending AI detection that an officer must verify before a notice is sent (officer view).
      { id: 'DMP-AI-2026-1013-0101', vehicleId: 'V1', violation: 'restricted_entry', location: { bn: 'মিন্টো রোড', en: 'Minto Road' }, occurredAt: at(now, 95), dueDate: day(now, 30), amount: 2000, source: 'ai_camera', camera: 'CAM-MR-01', officerVerified: false, status: 'unpaid' },
    ],
    reports: [
      { id: 'R241', ref: 'RPT-2026-000241', kind: 'incident', mine: true, category: 'illegal_parking', description: 'পান্থপথ সিগন্যালের মোড়ে বাস দাঁড়িয়ে যাত্রী তুলছে, এক লেন বন্ধ।', vehicleNo: 'ঢাকা মেট্রো-ব ১১-২২৩৩', lat: 23.7518, lng: 90.3866, locationLabel: { bn: 'পান্থপথ সিগন্যাল', en: 'Panthapath signal' }, thanaId: 'T17', createdAt: at(now, 70), anonymous: false, hideIdentity: true, photos: [{ name: 'IMG_2041.jpg', source: 'camera', hash: '9f2c1ab47e0d55c3a1d8e6b2f04a7c19e83b5d6a2c4f1e0b9d7a6c5e4f3b2a10', trust: 'high', trustReasons: [{ bn: 'অ্যাপের ক্যামেরায় তোলা', en: 'Captured with the in-app camera' }], capturedAt: at(now, 71) }], status: 'assigned', assignedOfficerId: 'O1', timeline: [ { status: 'received', at: at(now, 70), note: { bn: 'ছবি ও GPS সহ রিপোর্ট জমা হয়েছে', en: 'Report received with photo and GPS' } }, { status: 'verified', at: at(now, 66), note: { bn: 'ট্রাফিক কন্ট্রোল রুম যাচাই করেছে: বৈধ রিপোর্ট', en: 'Traffic control room verified it' } }, { status: 'assigned', at: at(now, 61), note: { bn: 'সার্জেন্ট মো. তানভীর আহমেদ নিযুক্ত · আনুমানিক ১০ মিনিট', en: 'Sergeant Md. Tanvir Ahmed assigned · about 10 min' } } ] },
      { id: 'R238', ref: 'RPT-2026-000238', kind: 'incident', mine: true, category: 'signal_broken', description: 'বাংলামোটর মোড়ের সিগন্যাল বাতি দুই দিন ধরে বন্ধ।', lat: 23.7466, lng: 90.3935, locationLabel: { bn: 'বাংলামোটর', en: 'Banglamotor' }, thanaId: 'T36', createdAt: at(now, 3 * 1440), anonymous: false, hideIdentity: false, photos: [], status: 'resolved', assignedOfficerId: 'O1', rating: 4, ratingComment: 'দ্রুত ঠিক হয়েছে, ধন্যবাদ।', timeline: [ { status: 'received', at: at(now, 3 * 1440), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } }, { status: 'verified', at: at(now, 3 * 1440 - 20), note: { bn: 'যাচাই সম্পন্ন', en: 'Verified' } }, { status: 'assigned', at: at(now, 3 * 1440 - 35), note: { bn: 'সিগন্যাল রক্ষণাবেক্ষণ দলে পাঠানো হয়েছে', en: 'Sent to the signal maintenance team' } }, { status: 'resolved', at: at(now, 2 * 1440), note: { bn: 'সিগন্যাল মেরামত হয়েছে', en: 'Signal repaired' } } ] },
      { id: 'R236', ref: 'RPT-2026-000236', kind: 'complaint', mine: true, category: 'officer_conduct', description: 'রাতে চেকপোস্টে রসিদ ছাড়া টাকা চাওয়া হয়েছে বলে অভিযোগ।', lat: 23.7937, lng: 90.4066, locationLabel: { bn: 'বনানী চেকপোস্ট', en: 'Banani checkpoint' }, thanaId: 'T03', createdAt: at(now, 6 * 1440), anonymous: false, hideIdentity: true, photos: [], status: 'verified', timeline: [ { status: 'received', at: at(now, 6 * 1440), note: { bn: 'অভিযোগ জমা হয়েছে', en: 'Complaint received' } }, { status: 'verified', at: at(now, 5 * 1440), note: { bn: 'অভ্যন্তরীণ তদন্তে পাঠানো হয়েছে; আপনার পরিচয় গোপন রাখা হয়েছে', en: 'Sent for internal inquiry; your identity is protected' } } ] },
      { id: 'R242', ref: 'RPT-2026-000242', kind: 'incident', mine: false, category: 'wrong_way', description: 'মোটরসাইকেল উল্টো পথে চলছে নিয়মিত।', lat: 23.7311, lng: 90.4179, locationLabel: { bn: 'মতিঝিল', en: 'Motijheel' }, thanaId: 'T26', createdAt: at(now, 26), anonymous: true, hideIdentity: true, photos: [{ name: 'IMG_8812.jpg', source: 'gallery', hash: '1b7d9e2a4c6f8e0a2b4d6f8a0c2e4f6a8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a', trust: 'needs_review', trustReasons: [{ bn: 'গ্যালারি থেকে আপলোড; অবস্থানের তথ্য নেই', en: 'Uploaded from gallery; no location data' }], capturedAt: at(now, 40) }], status: 'received', timeline: [ { status: 'received', at: at(now, 26), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } } ] },
      { id: 'R243', ref: 'RPT-2026-000243', kind: 'incident', mine: false, category: 'footpath', description: 'ফুটপাতে দোকান বসিয়ে পথচারী চলাচল বন্ধ।', lat: 23.7329, lng: 90.385, locationLabel: { bn: 'নিউ মার্কেট', en: 'New Market' }, thanaId: 'T28', createdAt: at(now, 18), anonymous: false, hideIdentity: false, reporterName: 'Sadia Rahman', photos: [], status: 'received', timeline: [ { status: 'received', at: at(now, 18), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } } ] },
      { id: 'R244', ref: 'RPT-2026-000244', kind: 'incident', mine: false, category: 'accident', description: 'মহাখালী ফ্লাইওভারে দুটি গাড়ির সংঘর্ষ, বাম লেন বন্ধ।', lat: 23.7781, lng: 90.4049, locationLabel: { bn: 'মহাখালী ফ্লাইওভার', en: 'Mohakhali flyover' }, thanaId: 'T41', createdAt: at(now, 9), anonymous: false, hideIdentity: false, reporterName: 'Imran Hossain', photos: [], status: 'en_route', assignedOfficerId: 'O2', timeline: [ { status: 'received', at: at(now, 9), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } }, { status: 'verified', at: at(now, 8), note: { bn: 'কন্ট্রোল রুম যাচাই করেছে', en: 'Verified by control room' } }, { status: 'assigned', at: at(now, 7), note: { bn: 'নিকটস্থ ইউনিট নিযুক্ত', en: 'Nearest unit assigned' } }, { status: 'en_route', at: at(now, 6), note: { bn: 'অফিসার পথে', en: 'Officer on the way' } } ] },
      { id: 'R245', ref: 'RPT-2026-000245', kind: 'incident', mine: false, category: 'accident', description: 'মহাখালী ফ্লাইওভারে দুর্ঘটনা, যানজট বাড়ছে।', lat: 23.7785, lng: 90.4051, locationLabel: { bn: 'মহাখালী ফ্লাইওভার', en: 'Mohakhali flyover' }, thanaId: 'T41', createdAt: at(now, 7), anonymous: true, hideIdentity: true, photos: [], status: 'received', duplicateOf: 'R244', timeline: [ { status: 'received', at: at(now, 7), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } } ] },
      { id: 'R239', ref: 'RPT-2026-000239', kind: 'rickshaw', mine: false, category: 'outside_zone', description: 'ই-রিক্সা প্রধান সড়কে, জোনের বাইরে।', vehicleNo: 'ER-DS1-00872', lat: 23.7123, lng: 90.4321, locationLabel: { bn: 'যাত্রাবাড়ী', en: 'Jatrabari' }, thanaId: 'T15', createdAt: at(now, 2 * 1440), anonymous: false, hideIdentity: true, photos: [], status: 'resolved', assignedOfficerId: 'O6', rating: 5, timeline: [ { status: 'received', at: at(now, 2 * 1440), note: { bn: 'অভিযোগ জমা হয়েছে', en: 'Complaint received' } }, { status: 'assigned', at: at(now, 2 * 1440 - 30), note: { bn: 'অফিসার নিযুক্ত', en: 'Officer assigned' } }, { status: 'resolved', at: at(now, 2 * 1440 - 95), note: { bn: 'রিক্সা জোনে ফেরত পাঠানো হয়েছে; মেয়াদোত্তীর্ণ নিবন্ধনে মামলা', en: 'Rickshaw returned to zone; case filed for expired registration' } } ] },
      { id: 'R240', ref: 'RPT-2026-000240', kind: 'incident', mine: false, category: 'waterlogging', description: 'কাকরাইল মোড়ে হাঁটুপানি।', lat: 23.7372, lng: 90.4081, locationLabel: { bn: 'কাকরাইল', en: 'Kakrail' }, thanaId: 'T31', createdAt: at(now, 35), anonymous: false, hideIdentity: false, reporterName: 'Tahmid Chowdhury', photos: [], status: 'resolved', assignedOfficerId: 'O3', timeline: [ { status: 'received', at: at(now, 35), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } }, { status: 'verified', at: at(now, 31), note: { bn: 'যাচাই সম্পন্ন; সতর্কতা প্রকাশ করা হয়েছে', en: 'Verified; alert published' } }, { status: 'resolved', at: at(now, 29), note: { bn: 'সতর্কতা হিসেবে প্রকাশিত; সিটি কর্পোরেশনে পাঠানো হয়েছে', en: 'Published as an alert; forwarded to the city corporation' } } ] },
      { id: 'R237', ref: 'RPT-2026-000237', kind: 'incident', mine: false, category: 'reckless', description: 'বাস দুটি প্রতিযোগিতা করে চলছে।', lat: 23.8069, lng: 90.3687, locationLabel: { bn: 'মিরপুর-১০', en: 'Mirpur-10' }, thanaId: 'T24', createdAt: at(now, 4 * 1440), anonymous: true, hideIdentity: true, photos: [], status: 'rejected', timeline: [ { status: 'received', at: at(now, 4 * 1440), note: { bn: 'রিপোর্ট জমা হয়েছে', en: 'Report received' } }, { status: 'rejected', at: at(now, 4 * 1440 - 60), note: { bn: 'প্রমাণ অপর্যাপ্ত; গাড়ির নম্বর নেই', en: 'Not enough evidence; no vehicle number' } } ] },
    ],
    alerts: [
      { id: 'A1', type: 'accident', severity: 'critical', title: { bn: 'মহাখালী ফ্লাইওভারে দুর্ঘটনা', en: 'Accident on Mohakhali flyover' }, detail: { bn: 'বাম লেন বন্ধ · উদ্ধার কাজ চলছে', en: 'Left lane closed · rescue work under way' }, alternate: { bn: 'বিকল্প: মহাখালী–গুলশান-১ লিংক রোড', en: 'Alternative: Mohakhali–Gulshan-1 link road' }, areaId: 'mohakhali', lat: 23.7781, lng: 90.4049, createdAt: at(now, 4), status: 'active', verifiedBy: 'DMP Traffic' },
      { id: 'A2', type: 'diversion', severity: 'major', title: { bn: 'রামপুরা ব্রিজে ডাইভারশন', en: 'Diversion at Rampura bridge' }, detail: { bn: 'মেরামত কাজ · দুই লেন বন্ধ', en: 'Repair work · two lanes closed' }, alternate: { bn: 'বিকল্প: হাতিরঝিল লিংক রোড', en: 'Alternative: Hatirjheel link road' }, areaId: 'rampura', lat: 23.7623, lng: 90.4211, createdAt: at(now, 10), endsAt: day(now, 3), status: 'active', verifiedBy: 'DMP Traffic' },
      { id: 'A3', type: 'waterlogging', severity: 'major', title: { bn: 'কাকরাইলে জলাবদ্ধতা', en: 'Waterlogging at Kakrail' }, detail: { bn: 'হাঁটুপানি · ছোট গাড়ি এড়িয়ে চলুন', en: 'Knee-deep water · small vehicles avoid' }, alternate: { bn: 'বিকল্প পথ: মৎস্য ভবন হয়ে', en: 'Alternative: via Matsya Bhaban' }, areaId: 'kakrail', lat: 23.7375, lng: 90.4078, createdAt: at(now, 25), status: 'active', verifiedBy: 'DMP Traffic' },
      { id: 'A4', type: 'event', severity: 'minor', title: { bn: 'বিজয় সরণি: বিশেষ চলাচল', en: 'Bijoy Sarani: special movement' }, detail: { bn: 'বিকেল ৪:০০–৪:৩০ · আগাম নোটিশ', en: '4:00–4:30 pm · advance notice' }, areaId: 'bijoy', lat: 23.765, lng: 90.389, createdAt: at(now, 120), startsAt: day(now, 0.1), endsAt: day(now, 0.12), status: 'scheduled', verifiedBy: 'DMP Traffic' },
      { id: 'A5', type: 'congestion', severity: 'minor', title: { bn: 'ফার্মগেটে ধীর গতি', en: 'Slow traffic at Farmgate' }, detail: { bn: 'অফিস সময়ের চাপ · গড় অপেক্ষা ১২ মিনিট', en: 'Office-hour peak · average wait 12 min' }, areaId: 'farmgate', lat: 23.7577, lng: 90.3897, createdAt: at(now, 15), status: 'active', verifiedBy: 'DMP Traffic' },
      { id: 'A6', type: 'closure', severity: 'major', title: { bn: 'শাহবাগ–টিএসসি সড়ক বন্ধ', en: 'Shahbagh–TSC road closed' }, detail: { bn: 'সোহরাওয়ার্দী উদ্যানে অনুষ্ঠান · বিকেল ৩টা–সন্ধ্যা ৬টা', en: 'Programme at Suhrawardy Udyan · 3–6 pm' }, alternate: { bn: 'বিকল্প: কাঁটাবন–নীলক্ষেত', en: 'Alternative: Katabon–Nilkhet' }, areaId: 'shahbag', lat: 23.7383, lng: 90.3958, createdAt: at(now, 180), startsAt: day(now, 0.05), endsAt: day(now, 0.18), status: 'scheduled', verifiedBy: 'DMP Traffic' },
      { id: 'A7', type: 'event', severity: 'minor', title: { bn: 'আগামীকাল মিরপুর স্টেডিয়ামে খেলা', en: 'Match at Mirpur stadium tomorrow' }, detail: { bn: 'মিরপুর-২ এলাকায় বিকেল ৫টা–রাত ১১টা যান নিয়ন্ত্রণ', en: 'Traffic control around Mirpur-2, 5–11 pm' }, alternate: { bn: 'বিকল্প: রোকেয়া সরণি হয়ে', en: 'Alternative: via Rokeya Sarani' }, areaId: 'mirpur10', lat: 23.8069, lng: 90.3687, createdAt: at(now, 300), startsAt: day(now, 1), endsAt: day(now, 1.25), status: 'scheduled', verifiedBy: 'DMP Traffic' },
      { id: 'A8', type: 'waterlogging', severity: 'minor', title: { bn: 'মিরপুর-১০ গোলচত্বরে পানি', en: 'Water at Mirpur-10 roundabout' }, detail: { bn: 'গোড়ালি-সমান পানি · ধীরে চলুন', en: 'Ankle-deep water · drive slowly' }, areaId: 'mirpur10', lat: 23.8069, lng: 90.3687, createdAt: at(now, 55), status: 'active', verifiedBy: 'DMP Traffic' },
      { id: 'A9', type: 'accident', severity: 'major', title: { bn: 'যাত্রাবাড়ী ফ্লাইওভারে বিকল বাস', en: 'Broken-down bus on Jatrabari flyover' }, detail: { bn: 'সরিয়ে নেওয়া হয়েছে · যান চলাচল স্বাভাবিক', en: 'Removed · traffic back to normal' }, areaId: 'jatrabari', lat: 23.7104, lng: 90.4349, createdAt: at(now, 240), status: 'resolved', verifiedBy: 'DMP Traffic' },
      { id: 'A10', type: 'closure', severity: 'minor', title: { bn: 'উত্তরায় রাতের রক্ষণাবেক্ষণ', en: 'Night maintenance in Uttara' }, detail: { bn: 'বিমানবন্দর সড়কের এক লেন রাত ১২টা–ভোর ৫টা বন্ধ', en: 'One lane of Airport Road closed 12–5 am' }, areaId: 'uttara', lat: 23.8613, lng: 90.4001, createdAt: at(now, 400), startsAt: day(now, 0.4), endsAt: day(now, 0.6), status: 'scheduled', verifiedBy: 'DMP Traffic' },
    ],
    routes: [
      { id: 'RT1', name: { bn: 'আমার পথ: বাড্ডা → মতিঝিল', en: 'My route: Badda → Motijheel' }, areaIds: ['badda', 'rampura', 'malibagh', 'hatirjheel', 'motijheel'], notifyFrom: '08:00', notifyTo: '10:00', active: true },
      { id: 'RT2', name: { bn: 'মিরপুর-১০ → ফার্মগেট', en: 'Mirpur-10 → Farmgate' }, areaIds: ['mirpur10', 'bijoy', 'farmgate'], notifyFrom: '17:00', notifyTo: '19:00', active: false },
    ],
    announcements: [
      { id: 'N1', category: 'notice', title: { bn: 'DMP কখনো লিংকসহ জরিমানার SMS পাঠায় না', en: 'DMP never sends fine SMS with links' }, body: { bn: 'সম্প্রতি "জরিমানা পরিশোধ-সংক্রান্ত চূড়ান্ত বিজ্ঞপ্তি" শিরোনামে ভুয়া SMS ছড়াচ্ছে। লিংকে ক্লিক করবেন না; PIN বা OTP কাউকে দেবেন না। মামলা দেখতে অ্যাপ ব্যবহার করুন।', en: 'Fake SMS titled "Final notice on fine payment" are circulating. Do not click links and never share a PIN or OTP. Use the app to see your cases.' }, publishedAt: at(now, 1440) },
      { id: 'N2', category: 'circular', title: { bn: '১৯টি মোড়ে AI ক্যামেরা চালু', en: 'AI cameras active at 19 junctions' }, body: { bn: 'স্বয়ংক্রিয় লঙ্ঘন শনাক্তকরণ ব্যবস্থায় প্রতিটি মামলা অফিসার যাচাইয়ের পর নোটিশ হিসেবে পাঠানো হয়। প্রমাণ অ্যাপে দেখা যাবে।', en: 'Under automatic violation detection, every case is checked by an officer before a notice is sent. Evidence can be viewed in the app.' }, publishedAt: at(now, 5 * 1440) },
      { id: 'N3', category: 'news', title: { bn: 'স্কুল সড়ক নিরাপত্তা সপ্তাহ', en: 'School road safety week' }, body: { bn: 'SafeRoad School কর্মসূচির আওতায় এ সপ্তাহে ১২টি স্কুলে ছাত্র ট্রাফিক নিরাপত্তা ক্লাবের কার্যক্রম চলবে।', en: 'Under SafeRoad School, Student Traffic Safety Clubs will run activities in 12 schools this week.' }, publishedAt: at(now, 3 * 1440) },
      { id: 'N4', category: 'notice', title: { bn: 'বর্ষায় জলাবদ্ধতার সতর্কতা অ্যাপে', en: 'Monsoon waterlogging alerts in the app' }, body: { bn: 'যাচাই করা জলাবদ্ধতার তথ্য ও বিকল্প পথ এখন "সতর্কতা" অংশে দেখা যাবে।', en: 'Verified waterlogging updates and alternative routes now appear under Alerts.' }, publishedAt: at(now, 8 * 1440) },
    ],
    notifications: [
      { id: 'NT1', category: 'cases', title: { bn: 'নতুন মামলা', en: 'New case' }, body: { bn: 'ঢাকা মেট্রো-গ ১২-৩৪৫৬ · লাল বাতি অমান্য, ফার্মগেট', en: 'Dhaka Metro-Ga 12-3456 · red light, Farmgate' }, at: at(now, 3 * 1440 + 100), read: false, link: '/cases/DMP-AI-2026-0712-0458' },
      { id: 'NT2', category: 'reports', title: { bn: 'রিপোর্ট #২৪১: অফিসার নিযুক্ত', en: 'Report #241: officer assigned' }, body: { bn: 'অবৈধ পার্কিং · পান্থপথ সিগন্যাল', en: 'Illegal parking · Panthapath signal' }, at: at(now, 61), read: false, link: '/reports/R241' },
      { id: 'NT3', category: 'alerts', title: { bn: 'আপনার পথে ডাইভারশন', en: 'Diversion on your route' }, body: { bn: 'রামপুরা ব্রিজ · বিকল্প পথ দেখুন', en: 'Rampura bridge · see alternative route' }, at: at(now, 10), read: false, link: '/alerts/A2' },
      { id: 'NT4', category: 'cases', title: { bn: 'পরিশোধ সম্পন্ন · রসিদ', en: 'Payment complete · receipt' }, body: { bn: 'অবৈধ পার্কিং · গুলশান-২', en: 'Illegal parking · Gulshan-2' }, at: at(now, 28 * 1440), read: true, link: '/cases/DMP-POS-2026-0628-7710' },
      { id: 'NT5', category: 'system', title: { bn: 'লাইসেন্স নবায়নের সময় হয়েছে', en: 'Time to renew your licence' }, body: { bn: 'মেয়াদ শেষ হতে ৩০ দিন বাকি', en: '30 days until expiry' }, at: at(now, 2 * 1440), read: true, link: '/wallet' },
    ],
    lessonsDone: ['signals', 'zebra'],
    pledged: false,
    feedback: [
      { id: 'F1', service: 'report', rating: 4, comment: 'রিপোর্টের অবস্থা দেখতে পারা ভালো লেগেছে।', anonymous: true, at: at(now, 5 * 1440) },
      { id: 'F2', service: 'payment', rating: 5, comment: '', anonymous: false, at: at(now, 20 * 1440) },
    ],
    fakeSms: [],
    sosEvents: [],
    officers: OFFICERS,
    scanLog: [
      { id: 'SL1', at: at(now, 6 * 1440 + 30), officerId: 'O3', kind: 'wallet', result: 'valid', subject: 'V1' },
    ],
  };
}

/** Simulated monthly active users for the analytics dashboard (illustrative, not real usage). */
export const SIMULATED_MAU = [
  { month: { bn: 'মে', en: 'May' }, value: 1200 },
  { month: { bn: 'জুন', en: 'Jun' }, value: 1350 },
  { month: { bn: 'জুলাই', en: 'Jul' }, value: 4100 },
  { month: { bn: 'আগস্ট', en: 'Aug' }, value: 9800 },
  { month: { bn: 'সেপ্টে', en: 'Sep' }, value: 16400 },
  { month: { bn: 'অক্টো', en: 'Oct' }, value: 21900 },
];
