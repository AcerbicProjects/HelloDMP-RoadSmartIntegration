import type { CitizenReport, EvidencePhoto, L } from '../data/types';
import { distanceKm } from './geo';
import { sha256Hex } from './crypto';

/** Same category within 300 m in the last two hours counts as a likely duplicate (SG-014 / SG-049). */
export function findDuplicate(reports: CitizenReport[], category: string, lat: number, lng: number, now = Date.now()) {
  return reports.find(
    (r) =>
      r.category === category &&
      r.status !== 'rejected' &&
      !r.duplicateOf &&
      now - new Date(r.createdAt).getTime() < 2 * 3600_000 &&
      distanceKm({ lat, lng }, r) < 0.3,
  );
}

/** Three-level trust assessment from the proposal (full PDF p.37). */
export async function assessPhoto(file: File, source: 'camera' | 'gallery', previousHashes: string[]): Promise<EvidencePhoto> {
  const hash = await sha256Hex(await file.arrayBuffer());
  const ageMin = (Date.now() - file.lastModified) / 60000;
  const reasons: L[] = [];
  let trust: EvidencePhoto['trust'] = 'high';
  if (previousHashes.includes(hash)) {
    trust = 'rejected';
    reasons.push({ bn: 'একই ছবি আগে অন্য রিপোর্টে জমা হয়েছে (ডিজিটাল ছাপ মিলেছে)', en: 'The same photo was already used in another report (fingerprint match)' });
  } else if (source === 'gallery') {
    trust = 'needs_review';
    reasons.push({ bn: 'গ্যালারি থেকে আপলোড: অফিসার যাচাই প্রয়োজন', en: 'Uploaded from gallery: officer review needed' });
    if (ageMin > 60) reasons.push({ bn: `ছবিটি প্রায় ${Math.round(ageMin / 60)} ঘণ্টা আগের`, en: `Photo is about ${Math.round(ageMin / 60)} h old` });
    reasons.push({ bn: 'ব্রাউজার ছবির অবস্থানের তথ্য মুছে দিতে পারে', en: 'Browsers may strip the photo\'s location data' });
  } else {
    reasons.push({ bn: 'অ্যাপের ক্যামেরায় তোলা; সময় ও GPS যুক্ত', en: 'Captured in the app with time and GPS' });
  }
  reasons.push({ bn: 'ডিজিটাল ছাপ (SHA-256) সংরক্ষিত', en: 'Digital fingerprint (SHA-256) stored' });
  return { name: file.name || 'photo.jpg', source, hash, trust, trustReasons: reasons, capturedAt: new Date(file.lastModified || Date.now()).toISOString() };
}

/** Makes a small JPEG thumbnail so localStorage stays small. */
export function makeThumb(file: File, max = 220): Promise<string | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}
