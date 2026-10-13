// Labels and reference lists used across screens.
import type { AlertType, L, ReportStatus, Severity, ViolationCode } from './types';

export const VIOLATIONS: Record<ViolationCode, { name: L; evidence: L; icon: string }> = {
  red_light: { name: { bn: 'লাল বাতি অমান্য', en: 'Red light violation' }, evidence: { bn: 'লাল বাতি জ্বলা অবস্থায় মোড় পার হওয়ার ছবি ও ভিডিও, সিগন্যালের অবস্থাসহ।', en: 'Photo and video of crossing on red, with the signal state.' }, icon: 'TrafficCone' },
  stop_line: { name: { bn: 'স্টপ লাইন অতিক্রম', en: 'Stop line crossing' }, evidence: { bn: 'লাল বাতিতে স্টপ লাইনের ওপর বা সামনে থামা গাড়ির ছবি।', en: 'Photo of a vehicle stopped on or past the stop line on red.' }, icon: 'Flag' },
  wrong_way: { name: { bn: 'উল্টো পথে চলা', en: 'Driving the wrong way' }, evidence: { bn: 'চলাচলের বিপরীত দিকে চলার ভিডিও ও সময়।', en: 'Video and time of driving against the flow.' }, icon: 'Undo2' },
  speeding: { name: { bn: 'অতিরিক্ত গতি', en: 'Speeding' }, evidence: { bn: 'দুই ক্যামেরার মাঝে গড় গতি, অথবা এক স্থানে তাৎক্ষণিক গতি।', en: 'Average speed between two cameras, or spot speed at one place.' }, icon: 'Gauge' },
  illegal_parking: { name: { bn: 'অবৈধ পার্কিং', en: 'Illegal parking' }, evidence: { bn: 'নির্দিষ্ট সময়ের ব্যবধানে একই স্থানে গাড়ির দুটি ছবি।', en: 'Two photos of the vehicle at the same spot, some minutes apart.' }, icon: 'SquareParking' },
  restricted_entry: { name: { bn: 'প্রবেশ নিষেধাজ্ঞা লঙ্ঘন', en: 'Restricted entry' }, evidence: { bn: 'নিষিদ্ধ সময়ে বা নিষিদ্ধ সড়কে প্রবেশের ছবি, সময় ও স্থান।', en: 'Photo, time and place of entering a restricted road or time window.' }, icon: 'Ban' },
  no_helmet: { name: { bn: 'হেলমেট ছাড়া মোটরসাইকেল', en: 'Motorcycle without helmet' }, evidence: { bn: 'চালক বা আরোহীর মাথার স্পষ্ট ছবি ও নম্বর প্লেট।', en: 'Clear photo of the rider or passenger and the number plate.' }, icon: 'HardHat' },
};

export const REPORT_CATEGORIES: { id: string; label: L; icon: string }[] = [
  { id: 'illegal_parking', label: { bn: 'অবৈধ পার্কিং', en: 'Illegal parking' }, icon: 'SquareParking' },
  { id: 'wrong_way', label: { bn: 'উল্টো পথে চলা', en: 'Wrong-way driving' }, icon: 'Undo2' },
  { id: 'signal_broken', label: { bn: 'সিগন্যাল অমান্য / নষ্ট', en: 'Signal broken or ignored' }, icon: 'TrafficCone' },
  { id: 'footpath', label: { bn: 'ফুটপাত দখল', en: 'Footpath encroachment' }, icon: 'Footprints' },
  { id: 'accident', label: { bn: 'দুর্ঘটনা', en: 'Accident' }, icon: 'Car' },
  { id: 'waterlogging', label: { bn: 'জলাবদ্ধতা / রাস্তা বন্ধ', en: 'Waterlogging or road blocked' }, icon: 'Droplets' },
  { id: 'reckless', label: { bn: 'বেপরোয়া চালনা', en: 'Reckless driving' }, icon: 'Zap' },
  { id: 'hazard', label: { bn: 'সড়কে বিপদ', en: 'Road hazard' }, icon: 'TriangleAlert' },
];

export const COMPLAINT_CATEGORIES: { id: string; label: L }[] = [
  { id: 'officer_conduct', label: { bn: 'পুলিশ সদস্যের আচরণ', en: 'Police conduct' } },
  { id: 'service_delay', label: { bn: 'সেবা পেতে দেরি', en: 'Service delay' } },
  { id: 'noise', label: { bn: 'শব্দদূষণ / উৎপাত', en: 'Noise or nuisance' } },
  { id: 'theft', label: { bn: 'চুরি / ছিনতাই', en: 'Theft or snatching' } },
  { id: 'other', label: { bn: 'অন্যান্য', en: 'Other' } },
];

export const RICKSHAW_ISSUES: { id: string; label: L }[] = [
  { id: 'overloaded', label: { bn: 'অতিরিক্ত যাত্রী', en: 'Overloaded' } },
  { id: 'outside_zone', label: { bn: 'জোনের বাইরে / প্রধান সড়কে', en: 'Outside zone or on main road' } },
  { id: 'reckless', label: { bn: 'বেপরোয়া চালনা', en: 'Reckless driving' } },
  { id: 'fare', label: { bn: 'অতিরিক্ত ভাড়া বা দুর্ব্যবহার', en: 'Overcharging or rudeness' } },
  { id: 'driver_mismatch', label: { bn: 'চালক ছবির সঙ্গে মিলছে না', en: 'Driver does not match photo' } },
  { id: 'no_plate', label: { bn: 'QR বা নম্বর প্লেট নেই', en: 'No QR or number plate' } },
];

export const OBJECTION_REASONS: { id: string; label: L }[] = [
  { id: 'plate_misread', label: { bn: 'নম্বর প্লেট ভুল পড়া হয়েছে / গাড়িটি আমার নয়', en: 'Plate misread or not my vehicle' } },
  { id: 'elsewhere', label: { bn: 'সে সময় গাড়ি অন্য জায়গায় ছিল', en: 'The vehicle was elsewhere at the time' } },
  { id: 'emergency', label: { bn: 'জরুরি অবস্থা (রোগী বা অ্যাম্বুলেন্স)', en: 'Emergency (patient or ambulance)' } },
  { id: 'signal_fault', label: { bn: 'সিগন্যাল বা ক্যামেরার ত্রুটি', en: 'Signal or camera fault' } },
  { id: 'other', label: { bn: 'অন্যান্য', en: 'Other' } },
];

export const ALERT_TYPES: Record<AlertType, { label: L; icon: string }> = {
  accident: { label: { bn: 'দুর্ঘটনা', en: 'Accident' }, icon: 'TriangleAlert' },
  diversion: { label: { bn: 'ডাইভারশন', en: 'Diversion' }, icon: 'Split' },
  waterlogging: { label: { bn: 'জলাবদ্ধতা', en: 'Waterlogging' }, icon: 'Droplets' },
  closure: { label: { bn: 'রাস্তা বন্ধ', en: 'Road closed' }, icon: 'Construction' },
  event: { label: { bn: 'অনুষ্ঠান / আগাম নোটিশ', en: 'Event advisory' }, icon: 'CalendarClock' },
  congestion: { label: { bn: 'যানজট', en: 'Congestion' }, icon: 'Car' },
};

export const SEVERITY: Record<Severity, { label: L; rank: number }> = {
  critical: { label: { bn: 'গুরুতর', en: 'Critical' }, rank: 3 },
  major: { label: { bn: 'বড়', en: 'Major' }, rank: 2 },
  minor: { label: { bn: 'ছোট', en: 'Minor' }, rank: 1 },
};

export const REPORT_STATUS: Record<ReportStatus, L> = {
  queued: { bn: 'পাঠানোর অপেক্ষায়', en: 'Waiting to send' },
  received: { bn: 'জমা হয়েছে', en: 'Received' },
  verified: { bn: 'যাচাই হয়েছে', en: 'Verified' },
  assigned: { bn: 'অফিসার নিযুক্ত', en: 'Officer assigned' },
  en_route: { bn: 'অফিসার পথে', en: 'Officer on the way' },
  on_scene: { bn: 'ঘটনাস্থলে', en: 'On scene' },
  resolved: { bn: 'নিষ্পত্তি', en: 'Resolved' },
  rejected: { bn: 'গ্রহণযোগ্য নয়', en: 'Not accepted' },
};

export const PAYMENT_METHODS: { id: string; name: L; note: L; color: string }[] = [
  { id: 'bkash', name: { bn: 'বিকাশ', en: 'bKash' }, note: { bn: 'বিকাশ অ্যাপে অনুমোদন', en: 'Approve in the bKash app' }, color: '#e2136e' },
  { id: 'nagad', name: { bn: 'নগদ', en: 'Nagad' }, note: { bn: 'নগদ অ্যাপে অনুমোদন', en: 'Approve in the Nagad app' }, color: '#f6921e' },
  { id: 'rocket', name: { bn: 'রকেট', en: 'Rocket' }, note: { bn: 'DBBL Rocket', en: 'DBBL Rocket' }, color: '#8c3494' },
  { id: 'card', name: { bn: 'ব্যাংক কার্ড', en: 'Bank card' }, note: { bn: 'ভিসা · মাস্টারকার্ড · অ্যামেক্স', en: 'Visa · Mastercard · Amex' }, color: '#1d4ed8' },
  { id: 'ekpay', name: { bn: 'ইন্টারনেট ব্যাংকিং / ekPay', en: 'Internet banking / ekPay' }, note: { bn: 'যেকোনো ব্যাংক', en: 'Any bank' }, color: '#0f766e' },
];

/** Early-payment discount from the proposal (full PDF p.24, p.28). The proposal leaves the values as
 * placeholders; the prototype uses 20% within 7 days of the notice as demo parameters. */
export const EARLY_PAY = { days: 7, percent: 20 };

export const SOS_TYPES: { id: string; label: L; icon: string }[] = [
  { id: 'accident', label: { bn: 'দুর্ঘটনা', en: 'Accident' }, icon: 'Car' },
  { id: 'help', label: { bn: 'সাহায্য দরকার', en: 'Need help' }, icon: 'HandHelping' },
  { id: 'breakdown', label: { bn: 'গাড়ি বিকল', en: 'Breakdown' }, icon: 'Wrench' },
  { id: 'track', label: { bn: 'আমাকে ট্র্যাক করুন', en: 'Track me' }, icon: 'LocateFixed' },
];

/** Sample fine amounts used by the demo's cases and roadside e-challans. They are illustrative only and are
 * not the legal schedule under the Road Transport Act, 2018. */
export const SAMPLE_FINES: Record<ViolationCode, number> = {
  red_light: 5000,
  stop_line: 2000,
  wrong_way: 2000,
  speeding: 3000,
  illegal_parking: 1000,
  restricted_entry: 2000,
  no_helmet: 1000,
};

/** Where each kind of citizen report is routed for action (SG-047). Unit names are generic descriptions. */
export const ROUTING: Record<string, L> = {
  incident: { bn: 'এলাকার ট্রাফিক বিভাগ', en: 'Area traffic division' },
  rickshaw: { bn: 'এলাকার ট্রাফিক বিভাগ (ই-রিক্সা)', en: 'Area traffic division (e-rickshaw)' },
  joint_accident: { bn: 'এলাকার ট্রাফিক বিভাগ (দুর্ঘটনা)', en: 'Area traffic division (accidents)' },
  complaint: { bn: 'থানা ও অভিযোগ সেল', en: 'Thana and complaints cell' },
  cyber: { bn: 'সাইবার ক্রাইম ইউনিট', en: 'Cyber crime unit' },
  women_child: { bn: 'নারী ও শিশু সহায়তা ডেস্ক', en: 'Women and children support desk' },
  fake_sms: { bn: 'সাইবার ক্রাইম ইউনিট', en: 'Cyber crime unit' },
};
