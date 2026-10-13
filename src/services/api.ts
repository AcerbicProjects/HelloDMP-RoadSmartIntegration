// Mock service layer. Every "backend" call in the prototype goes through simulate(), which adds a short,
// fixed delay (so loading states are visible) and fails on purpose when the demo's
// "Simulate network failure" switch is on. Nothing here contacts a real server.

export class SimulatedNetworkError extends Error {
  constructor() {
    super('Simulated network failure');
    this.name = 'SimulatedNetworkError';
  }
}

export function simulate<T>(work: () => T, opts: { fail?: boolean; delay?: number } = {}): Promise<T> {
  const delay = opts.delay ?? 650;
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (opts.fail) reject(new SimulatedNetworkError());
      else resolve(work());
    }, delay);
  });
}

/** Next sequential reference number based on what already exists (deterministic, no random IDs). */
export function nextNumber(existing: string[], prefix: string, pad = 6): string {
  const max = existing.reduce((m, id) => {
    const n = Number(id.replace(/\D/g, '').slice(-pad));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}
