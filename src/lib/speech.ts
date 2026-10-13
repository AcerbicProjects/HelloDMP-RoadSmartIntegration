import { useEffect, useState } from 'react';

/** Reads text aloud with the browser's own speech synthesis. Nothing leaves the device;
 * `available` is false where the browser has no speech engine, so callers can hide the button. */
export function useReadAloud(lang: 'bn' | 'en') {
  const available = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const toggle = (text: string) => {
    if (!available) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };
  return { available, speaking, toggle };
}
