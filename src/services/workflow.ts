// Report workflow shared by the citizen, officer and admin views, so a step taken in one view
// shows up in the others (proposal p.34 and p.40: received → verified → assigned → on the way → on scene → resolved).
import type { AppState, CitizenReport, L, Officer, ReportStatus } from '../data/types';
import { REPORT_STATUS } from '../data/catalog';
import { distanceKm } from './geo';

export const FLOW: ReportStatus[] = ['received', 'verified', 'assigned', 'en_route', 'on_scene', 'resolved'];

export function nearestOfficers(officers: Officer[], at: { lat: number; lng: number }) {
  return officers
    .filter((o) => o.onDuty)
    .map((o) => ({ ...o, km: distanceKm(o, at) }))
    .sort((a, b) => a.km - b.km);
}

/** Moves a report to a new status, records it on the timeline and tells the citizen if it is theirs. */
export function setReportStatus(
  draft: AppState,
  id: string,
  status: ReportStatus,
  note: L,
  notify: (d: AppState, n: { category: 'reports'; title: L; body: L; link?: string }) => void,
  officerId?: string,
) {
  const r = draft.reports.find((x) => x.id === id);
  if (!r) return;
  r.status = status;
  if (officerId) r.assignedOfficerId = officerId;
  r.timeline.push({ status, at: new Date().toISOString(), note });
  // Duplicates follow their primary report so every reporter sees the outcome (SG-049).
  for (const d of draft.reports.filter((x) => x.duplicateOf === id)) {
    d.status = status;
    if (officerId) d.assignedOfficerId = officerId;
    d.timeline.push({ status, at: new Date().toISOString(), note });
    if (d.mine) notifyMine(draft, d, status, notify);
  }
  if (r.mine) notifyMine(draft, r, status, notify);
}

function notifyMine(
  draft: AppState,
  r: CitizenReport,
  status: ReportStatus,
  notify: (d: AppState, n: { category: 'reports'; title: L; body: L; link?: string }) => void,
) {
  const num = r.ref.slice(-3);
  notify(draft, {
    category: 'reports',
    title: { bn: `রিপোর্ট #${num}: ${REPORT_STATUS[status].bn}`, en: `Report #${num}: ${REPORT_STATUS[status].en}` },
    body: r.locationLabel,
    link: `/reports/${r.id}`,
  });
}

export const OPEN_STATUSES: ReportStatus[] = ['received', 'verified', 'assigned', 'en_route', 'on_scene'];

/** Minutes from submission to the first acknowledgement (verified or later) and to closure (SG-048). */
export function responseMinutes(r: CitizenReport) {
  const start = new Date(r.createdAt).getTime();
  const ack = r.timeline.find((t) => t.status !== 'received' && t.status !== 'queued');
  const end = r.timeline.find((t) => t.status === 'resolved' || t.status === 'rejected');
  const mins = (iso?: string) => (iso ? Math.max(0, Math.round((new Date(iso).getTime() - start) / 60000)) : undefined);
  return { ack: mins(ack?.at), close: mins(end?.at) };
}
