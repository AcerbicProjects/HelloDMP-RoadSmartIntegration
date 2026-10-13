import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppNotification, AppState, L, NotificationCategory, Severity } from '../data/types';
import { createSeed, SEED_VERSION } from '../data/seed';
import { SEVERITY } from '../data/catalog';

const STORAGE_KEY = 'hellodmp-roadsmart-demo';
let notifSeq = 0;

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === SEED_VERSION) return parsed;
    }
  } catch {
    // Storage may be unavailable (private mode); fall back to a fresh seed.
  }
  return createSeed();
}

export interface Toast {
  id: number;
  tone: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextValue {
  state: AppState;
  /** Applies a mutation to a copy of the state, then persists it. */
  update: (mutate: (draft: AppState) => void) => void;
  /** Restores the seed data. `full` also forgets language, consent and onboarding (delete my data). */
  reset: (opts?: { full?: boolean }) => void;
  toast: (text: string, tone?: Toast['tone']) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  /** Adds an in-app notification, honouring the citizen's category and severity preferences. */
  notify: (draft: AppState, n: { category: NotificationCategory; title: L; body: L; link?: string; severity?: Severity }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota or privacy-mode errors: the demo still works in memory.
    }
  }, [state]);

  const update = useCallback((mutate: (draft: AppState) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      mutate(next);
      return next;
    });
  }, []);

  const reset = useCallback((opts?: { full?: boolean }) => {
    if (opts?.full) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing stored or storage unavailable.
      }
      setState((prev) => createSeed(Date.now(), { lang: prev.settings.lang }));
      return;
    }
    setState((prev) => createSeed(Date.now(), { lang: prev.settings.lang, onboarded: true, consent: prev.settings.consent }));
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (text: string, tone: Toast['tone'] = 'success') => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-2), { id, tone, text }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const notify = useCallback<AppContextValue['notify']>((draft, n) => {
    const prefs = draft.settings.notif;
    const enabled = n.category === 'system' || prefs[n.category as keyof typeof prefs] !== false;
    const severityOk = !n.severity || SEVERITY[n.severity].rank >= SEVERITY[prefs.minSeverity].rank;
    if (!enabled || !severityOk) return;
    const item: AppNotification = {
      id: `NT${Date.now().toString(36)}-${++notifSeq}`,
      category: n.category,
      title: n.title,
      body: n.body,
      link: n.link,
      at: new Date().toISOString(),
      read: false,
    };
    draft.notifications.unshift(item);
  }, []);

  const value = useMemo(() => ({ state, update, reset, toast, toasts, dismissToast, notify }), [state, update, reset, toast, toasts, dismissToast, notify]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/** True when quiet hours are on and the current time is inside them (pushes would be held). */
export function inQuietHours(from: string, to: string, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const a = fh * 60 + fm;
  const b = th * 60 + tm;
  return a <= b ? mins >= a && mins < b : mins >= a || mins < b;
}
