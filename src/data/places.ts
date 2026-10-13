// Supporting place data for alerts and routes.
import type { L } from './types';

/** MRT Line-6 stations with approximate positions, used to suggest metro alternatives on saved routes (SG-053).
 * Station names are public; coordinates are approximate and for demonstration only. */
export const MRT6_STATIONS: { id: string; name: L; lat: number; lng: number }[] = [
  { id: 'uttara-n', name: { bn: 'উত্তরা উত্তর', en: 'Uttara North' }, lat: 23.8697, lng: 90.3672 },
  { id: 'uttara-c', name: { bn: 'উত্তরা সেন্টার', en: 'Uttara Center' }, lat: 23.8597, lng: 90.3654 },
  { id: 'uttara-s', name: { bn: 'উত্তরা দক্ষিণ', en: 'Uttara South' }, lat: 23.8456, lng: 90.3634 },
  { id: 'pallabi', name: { bn: 'পল্লবী', en: 'Pallabi' }, lat: 23.8265, lng: 90.3647 },
  { id: 'mirpur11', name: { bn: 'মিরপুর-১১', en: 'Mirpur-11' }, lat: 23.8193, lng: 90.3652 },
  { id: 'mirpur10', name: { bn: 'মিরপুর-১০', en: 'Mirpur-10' }, lat: 23.8075, lng: 90.3681 },
  { id: 'kazipara', name: { bn: 'কাজীপাড়া', en: 'Kazipara' }, lat: 23.7978, lng: 90.3718 },
  { id: 'shewrapara', name: { bn: 'শেওড়াপাড়া', en: 'Shewrapara' }, lat: 23.7905, lng: 90.3755 },
  { id: 'agargaon', name: { bn: 'আগারগাঁও', en: 'Agargaon' }, lat: 23.7783, lng: 90.3803 },
  { id: 'bijoy', name: { bn: 'বিজয় সরণি', en: 'Bijoy Sarani' }, lat: 23.7655, lng: 90.3858 },
  { id: 'farmgate', name: { bn: 'ফার্মগেট', en: 'Farmgate' }, lat: 23.7571, lng: 90.3897 },
  { id: 'karwan', name: { bn: 'কারওয়ান বাজার', en: 'Karwan Bazar' }, lat: 23.7508, lng: 90.3925 },
  { id: 'shahbag', name: { bn: 'শাহবাগ', en: 'Shahbagh' }, lat: 23.7389, lng: 90.3958 },
  { id: 'du', name: { bn: 'ঢাকা বিশ্ববিদ্যালয়', en: 'Dhaka University' }, lat: 23.7334, lng: 90.3984 },
  { id: 'secretariat', name: { bn: 'বাংলাদেশ সচিবালয়', en: 'Bangladesh Secretariat' }, lat: 23.7302, lng: 90.4079 },
  { id: 'motijheel', name: { bn: 'মতিঝিল', en: 'Motijheel' }, lat: 23.7297, lng: 90.4187 },
];

/** Demo school zones with drop-off and pick-up windows (SG-051). Fictional names, generic areas. */
export const SCHOOL_ZONES: { id: string; name: L; lat: number; lng: number; windows: [string, string][] }[] = [
  { id: 'SZ1', name: { bn: 'ধানমন্ডি রোড ৭ স্কুল এলাকা', en: 'Dhanmondi Road 7 school zone' }, lat: 23.7448, lng: 90.3772, windows: [['07:00', '09:00'], ['12:00', '14:00']] },
  { id: 'SZ2', name: { bn: 'বেইলি রোড স্কুল এলাকা', en: 'Bailey Road school zone' }, lat: 23.7426, lng: 90.4048, windows: [['07:00', '09:00'], ['12:30', '14:00']] },
  { id: 'SZ3', name: { bn: 'মিরপুর-২ স্কুল এলাকা', en: 'Mirpur-2 school zone' }, lat: 23.8041, lng: 90.3598, windows: [['07:30', '09:00'], ['13:00', '14:30']] },
  { id: 'SZ4', name: { bn: 'উত্তরা সেক্টর ৪ স্কুল এলাকা', en: 'Uttara Sector 4 school zone' }, lat: 23.8645, lng: 90.3995, windows: [['07:00', '08:30'], ['12:00', '13:30']] },
];

export function windowActive(windows: [string, string][], now = new Date()) {
  const m = now.getHours() * 60 + now.getMinutes();
  return windows.some(([a, b]) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return m >= ah * 60 + am && m < bh * 60 + bm;
  });
}
