// Derived indicators for the alert map. Everything is computed from the same state the rest of the app uses,
// with a formula that is shown to the user (SG-009 congestion layer, SG-052 area safety score).
import type { AppState, Area } from '../data/types';
import { AREAS } from '../data/seed';
import { distanceKm } from './geo';

const ALERT_WEIGHT = { critical: 25, major: 15, minor: 6 } as const;

export interface AreaScore {
  area: Area;
  score: number;
  alerts: number;
  reports: number;
  level: 'good' | 'moderate' | 'caution';
}

export function areaScores(state: AppState, now = Date.now()): AreaScore[] {
  return AREAS.map((area) => {
    const near = (p: { lat: number; lng: number }) => distanceKm(area, p) < 1.2;
    const alerts = state.alerts.filter((a) => a.status === 'active' && near(a));
    const reports = state.reports.filter((r) => r.status !== 'rejected' && !r.duplicateOf && near(r) && now - new Date(r.createdAt).getTime() < 7 * 86_400_000);
    const penalty = alerts.reduce((s, a) => s + ALERT_WEIGHT[a.severity], 0) + reports.length * 4 + reports.filter((r) => r.category === 'accident').length * 6;
    const score = Math.max(0, Math.min(100, 100 - penalty));
    return { area, score, alerts: alerts.length, reports: reports.length, level: (score >= 80 ? 'good' : score >= 60 ? 'moderate' : 'caution') as AreaScore['level'] };
  }).sort((a, b) => a.score - b.score);
}

/** Congestion intensity 0–3 per area from active alerts that slow traffic. */
export function congestion(state: AppState) {
  return AREAS.map((area) => {
    const slowing = state.alerts.filter((a) => a.status === 'active' && ['congestion', 'accident', 'diversion', 'closure', 'waterlogging'].includes(a.type) && distanceKm(area, a) < 1.5);
    const level = Math.min(3, slowing.reduce((s, a) => s + (a.severity === 'critical' ? 2 : 1), 0));
    return { area, level };
  }).filter((x) => x.level > 0);
}

export const CONGESTION_COLORS = ['#16a34a', '#f59e0b', '#ea580c', '#dc2626'];
