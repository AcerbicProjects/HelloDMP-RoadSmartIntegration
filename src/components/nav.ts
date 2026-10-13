import {
  Bell,
  BookOpen,
  Building2,
  CarFront,
  CircleHelp,
  ClipboardList,
  FileWarning,
  GraduationCap,
  Globe,
  House,
  LayoutGrid,
  Map,
  Megaphone,
  MessageSquareText,
  MessageSquareWarning,
  QrCode,
  ScanLine,
  Settings,
  ShieldAlert,
  Siren,
  Sparkles,
  TrafficCone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { L } from '../data/types';

export interface NavItem {
  to: string;
  label: L;
  icon: LucideIcon;
}

export const CITIZEN_NAV: { group: L; items: NavItem[] }[] = [
  {
    group: { bn: 'হ্যালো ডিএমপি', en: 'Hello DMP' },
    items: [
      { to: '/', label: { bn: 'হোম', en: 'Home' }, icon: House },
      { to: '/online-services', label: { bn: 'অনলাইন সেবা', en: 'Online services' }, icon: Globe },
      { to: '/cyber', label: { bn: 'সাইবার ক্রাইম', en: 'Cyber crime' }, icon: ShieldAlert },
      { to: '/women-child', label: { bn: 'নারী, শিশু ও গৃহকর্মী', en: 'Women, children & domestic workers' }, icon: Users },
      { to: '/traffic', label: { bn: 'ডিএমপি ট্রাফিক', en: 'DMP Traffic' }, icon: TrafficCone },
      { to: '/complaint', label: { bn: 'আপনার অভিযোগ', en: 'Your complaint' }, icon: MessageSquareWarning },
      { to: '/thana', label: { bn: 'নিকটস্থ থানা', en: 'Nearest thana' }, icon: Building2 },
    ],
  },
  {
    group: { bn: 'রোডস্মার্ট', en: 'RoadSmart' },
    items: [
      { to: '/alerts', label: { bn: 'সতর্কতা', en: 'Alerts' }, icon: Map },
      { to: '/report', label: { bn: 'রিপোর্ট করুন', en: 'Report' }, icon: FileWarning },
      { to: '/reports', label: { bn: 'আমার রিপোর্ট', en: 'My reports' }, icon: ClipboardList },
      { to: '/cases', label: { bn: 'মামলা ও জরিমানা', en: 'Cases & fines' }, icon: CarFront },
      { to: '/wallet', label: { bn: 'QR ওয়ালেট', en: 'QR wallet' }, icon: QrCode },
      { to: '/assistant', label: { bn: 'সহকারী', en: 'Assistant' }, icon: Sparkles },
      { to: '/sms-check', label: { bn: 'SMS যাচাই', en: 'SMS check' }, icon: MessageSquareText },
      { to: '/rickshaw', label: { bn: 'ই-রিক্সা স্ক্যান', en: 'e-Rickshaw scan' }, icon: ScanLine },
      { to: '/learn', label: { bn: 'শিখুন', en: 'Learn' }, icon: GraduationCap },
    ],
  },
  {
    group: { bn: 'সাহায্য ও অ্যাকাউন্ট', en: 'Help & account' },
    items: [
      { to: '/emergency', label: { bn: 'জরুরি নম্বর', en: 'Emergency numbers' }, icon: Siren },
      { to: '/notifications', label: { bn: 'নোটিফিকেশন', en: 'Notifications' }, icon: Bell },
      { to: '/announcements', label: { bn: 'ঘোষণা', en: 'Announcements' }, icon: Megaphone },
      { to: '/faq', label: { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' }, icon: CircleHelp },
      { to: '/feedback', label: { bn: 'মতামত', en: 'Feedback' }, icon: BookOpen },
      { to: '/settings', label: { bn: 'সেটিংস', en: 'Settings' }, icon: Settings },
    ],
  },
];

export const BOTTOM_NAV: NavItem[] = [
  { to: '/', label: { bn: 'হোম', en: 'Home' }, icon: House },
  { to: '/alerts', label: { bn: 'সতর্কতা', en: 'Alerts' }, icon: Map },
  { to: '/report', label: { bn: 'রিপোর্ট', en: 'Report' }, icon: FileWarning },
  { to: '/assistant', label: { bn: 'সহকারী', en: 'Assistant' }, icon: Sparkles },
  { to: '/cases', label: { bn: 'মামলা', en: 'Cases' }, icon: CarFront },
];

export const ALL_SERVICES_ICON = LayoutGrid;
