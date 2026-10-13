// Shared domain types for the Hello DMP / DMP RoadSmart prototype.

export type Lang = 'bn' | 'en';
/** A bilingual string. Every user-facing data value carries both languages. */
export interface L {
  bn: string;
  en: string;
}

export type Role = 'citizen' | 'officer' | 'admin';

export interface Thana {
  id: string;
  name: L;
  address: L;
  phone: string;
  email: string;
  lat: number;
  lng: number;
}

export interface Faq {
  id: number;
  q: L;
  a: L;
}

export interface OnlineService {
  id: string;
  name: L;
  desc: L;
  url: string;
  kind: 'web' | 'app';
  icon: string;
}

export interface Hotline {
  id: string;
  label: L;
  numbers: string[];
}

export type AlertType = 'accident' | 'diversion' | 'waterlogging' | 'closure' | 'event' | 'congestion';
export type Severity = 'critical' | 'major' | 'minor';

export interface Area {
  id: string;
  name: L;
  lat: number;
  lng: number;
}

export interface TrafficAlert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: L;
  detail: L;
  alternate?: L;
  areaId: string;
  lat: number;
  lng: number;
  createdAt: string;
  startsAt?: string;
  endsAt?: string;
  status: 'active' | 'resolved' | 'scheduled';
  verifiedBy: string;
}

export interface SavedRoute {
  id: string;
  name: L;
  areaIds: string[];
  notifyFrom: string; // HH:MM
  notifyTo: string;
  active: boolean;
}

export interface Announcement {
  id: string;
  title: L;
  body: L;
  category: 'notice' | 'circular' | 'news';
  publishedAt: string;
}

export interface Vehicle {
  id: string;
  regNo: L;
  kind: L;
  ownership: 'owner' | 'driver';
  drcValid: boolean;
  fitnessUntil: string;
  taxTokenUntil: string;
  insurance: 'pending';
}

export type ViolationCode =
  | 'red_light'
  | 'stop_line'
  | 'wrong_way'
  | 'speeding'
  | 'illegal_parking'
  | 'restricted_entry'
  | 'no_helmet';

export interface SpeedEvidence {
  camA: L;
  camB: L;
  timeA: string;
  timeB: string;
  distanceKm: number;
  limitKmh: number;
}

export type CaseStatus = 'unpaid' | 'objection' | 'paid' | 'cancelled';

export interface TrafficCase {
  id: string;
  vehicleId: string;
  violation: ViolationCode;
  location: L;
  occurredAt: string;
  dueDate: string;
  amount: number;
  source: 'ai_camera' | 'sergeant';
  camera: string;
  officerVerified: boolean;
  status: CaseStatus;
  speed?: SpeedEvidence;
  objection?: {
    reason: string;
    details: string;
    attachments: string[];
    submittedAt: string;
    decision?: 'accepted' | 'rejected';
    decidedAt?: string;
    decisionNote?: L;
  };
  payment?: {
    method: string;
    txnId: string;
    paidAt: string;
    amountPaid: number;
    discount: number;
    receiptNo: string;
  };
  /** Officer review of an AI detection before any notice is sent (proposal p.28). */
  review?: { officerId: string; at: string; outcome: 'confirmed' | 'dismissed'; note?: string };
  /** Who issued a roadside e-challan from the officer app (PR-005). */
  issuedBy?: string;
  nomination?: {
    name: string;
    license: string;
    mobile: string;
    submittedAt: string;
    status: 'pending' | 'confirmed';
  };
}

export type ReportKind = 'incident' | 'complaint' | 'cyber' | 'women_child' | 'rickshaw' | 'joint_accident' | 'fake_sms';
export type ReportStatus = 'queued' | 'received' | 'verified' | 'assigned' | 'en_route' | 'on_scene' | 'resolved' | 'rejected';

export interface TimelineEntry {
  status: ReportStatus;
  at: string;
  note: L;
}

export interface EvidencePhoto {
  name: string;
  source: 'camera' | 'gallery' | 'sample';
  hash: string;
  trust: 'high' | 'needs_review' | 'rejected';
  trustReasons: L[];
  capturedAt: string;
  thumb?: string; // small data URL, omitted in low-bandwidth mode
}

export interface CitizenReport {
  id: string;
  ref: string;
  kind: ReportKind;
  /** True when the signed-in demo citizen filed it; other reports exist for the officer and admin views. */
  mine: boolean;
  category: string;
  description: string;
  vehicleNo?: string;
  lat: number;
  lng: number;
  locationLabel: L;
  thanaId: string;
  createdAt: string;
  anonymous: boolean;
  hideIdentity: boolean;
  reporterName?: string;
  reporterMobile?: string;
  reporterEmail?: string;
  photos: EvidencePhoto[];
  status: ReportStatus;
  timeline: TimelineEntry[];
  assignedOfficerId?: string;
  duplicateOf?: string;
  rating?: number;
  ratingComment?: string;
  meta?: Record<string, string>;
}

export interface Officer {
  id: string;
  name: L;
  rank: L;
  thanaId: string;
  division: L;
  lat: number;
  lng: number;
  onDuty: boolean;
}

export interface Rickshaw {
  regNo: string;
  category: L;
  zone: { name: L; color: string };
  route: L;
  validUntil: string;
  status: 'valid' | 'expired';
  driver: { name: L; license: string; licenseValid: boolean };
}

export type NotificationCategory = 'alerts' | 'cases' | 'reports' | 'announcements' | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: L;
  body: L;
  at: string;
  read: boolean;
  link?: string;
}

export interface Lesson {
  id: string;
  title: L;
  minutes: number;
  icon: string;
  points: L[];
  tip: L;
}

export interface QuizQuestion {
  id: string;
  q: L;
  options: L[];
  correct: number;
  why: L;
}

export interface RoadSign {
  id: string;
  kind: 'regulatory' | 'warning' | 'information';
  name: L;
  meaning: L;
}

export interface Guide {
  id: string;
  title: L;
  audience: L;
  intro: L;
  sections: { heading: L; points: L[] }[];
}

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  question: L;
  simple: L;
  original: L;
  source: L;
  actions?: { label: L; to: string }[];
}

export interface Certificate {
  id: string;
  holder: string;
  level: L;
  score: number;
  issuedAt: string;
}

export interface FeedbackEntry {
  id: string;
  service: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  at: string;
}

export interface Profile {
  name: string;
  mobile: string;
  tier: 1 | 2 | 3;
  nidLinked: boolean;
  license?: { number: string; class: L; validUntil: string; points: number; maxPoints: number; verifiedAt: string };
  vehicleIds: string[];
}

export interface NotificationPrefs {
  alerts: boolean;
  cases: boolean;
  reports: boolean;
  announcements: boolean;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
  minSeverity: Severity;
}

export interface Consent {
  accepted: boolean;
  location: boolean;
  camera: boolean;
  notifications: boolean;
  analytics: boolean;
  at?: string;
}

export interface Settings {
  lang: Lang;
  textScale: 1 | 1.15 | 1.3;
  highContrast: boolean;
  lowBandwidth: boolean;
  simulateFailure: boolean;
  onboarded: boolean;
  role: Role;
  notif: NotificationPrefs;
  consent: Consent;
  locationRationaleSeen: boolean;
}

export interface FakeSmsReport {
  id: string;
  sender: string;
  text: string;
  verdict: 'fake' | 'official' | 'suspicious';
  at: string;
}

export interface AppState {
  version: number;
  seededAt: string;
  settings: Settings;
  session: { loggedIn: boolean; officerId: string; officerSignedIn?: boolean };
  profile: Profile;
  vehicles: Vehicle[];
  cases: TrafficCase[];
  reports: CitizenReport[];
  alerts: TrafficAlert[];
  routes: SavedRoute[];
  announcements: Announcement[];
  notifications: AppNotification[];
  certificate?: Certificate;
  lessonsDone: string[];
  quizBest?: number;
  pledged: boolean;
  feedback: FeedbackEntry[];
  fakeSms: FakeSmsReport[];
  reportDraft?: Partial<CitizenReport> & { step?: number };
  sosEvents: SosEvent[];
  officers: Officer[];
  /** Every officer scan of the citizen's wallet QR, shown back to the citizen (proposal p.31). */
  scanLog: ScanLogEntry[];
}

export interface SosEvent {
  id: string;
  type: string;
  at: string;
  lat: number;
  lng: number;
  thanaId: string;
  status: 'active' | 'closed';
  /** True while the citizen keeps live location sharing on. */
  sharing: boolean;
  assignedOfficerId?: string;
}

export interface ScanLogEntry {
  id: string;
  at: string;
  officerId: string;
  kind: 'wallet' | 'receipt' | 'cert' | 'rickshaw' | 'joint';
  result: 'valid' | 'expired' | 'invalid';
  subject: string;
}
