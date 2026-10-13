import { useCallback } from 'react';
import { useApp } from '../store/AppStore';
import type { L } from '../data/types';
import { formatDate, formatDateTime, formatNumber, formatTaka, formatTime, localDigits, pick, relativeTime } from './format';

/** Language helpers bound to the current setting. tr() is used for UI copy, tx() for bilingual data. */
export function useI18n() {
  const { state } = useApp();
  const lang = state.settings.lang;
  const tr = useCallback((bn: string, en: string) => (lang === 'bn' ? bn : en), [lang]);
  const tx = useCallback((l: L | undefined) => pick(l, lang), [lang]);
  return {
    lang,
    tr,
    tx,
    n: (v: number | string) => localDigits(v, lang),
    num: (v: number) => formatNumber(v, lang),
    taka: (v: number) => formatTaka(v, lang),
    date: (iso: string) => formatDate(iso, lang),
    time: (iso: string) => formatTime(iso, lang),
    dateTime: (iso: string) => formatDateTime(iso, lang),
    ago: (iso: string) => relativeTime(iso, lang),
  };
}
