import { THANAS } from '../data/thanas';
import type { Thana } from '../data/types';

/** Default demo position near Ramna Park, where the existing app's screenshot shows the user pin. */
export const DEMO_POSITION = { lat: 23.7383, lng: 90.4006 };

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestThanas(pos: { lat: number; lng: number }, count = THANAS.length): (Thana & { km: number })[] {
  return THANAS.map((t) => ({ ...t, km: distanceKm(pos, t) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

export interface PositionResult {
  lat: number;
  lng: number;
  source: 'device' | 'demo';
}

/** Uses the browser's location when allowed; otherwise falls back to the fixed demo position. */
export function getPosition(useDevice: boolean): Promise<PositionResult> {
  if (!useDevice || !('geolocation' in navigator)) return Promise.resolve({ ...DEMO_POSITION, source: 'demo' });
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        // Outside Dhaka the map would be empty, so keep the demo position for a coherent demonstration.
        if (distanceKm(pos, DEMO_POSITION) > 40) resolve({ ...DEMO_POSITION, source: 'demo' });
        else resolve({ ...pos, source: 'device' });
      },
      () => resolve({ ...DEMO_POSITION, source: 'demo' }),
      { timeout: 6000, maximumAge: 60_000 },
    );
  });
}
