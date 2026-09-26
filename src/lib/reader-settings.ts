import { useCallback, useEffect, useState } from "react";

/** Reader Mode and font-size preferences, stored on this device only. */
export type ReaderSettings = {
  readerMode: boolean;
  arabicScale: number;
  translationScale: number;
};

const KEY = "jami-reader-settings.v1";
const EVENT = "jami-reader-settings-change";
export const SCALE_MIN = 0.8;
export const SCALE_MAX = 1.8;
export const SCALE_STEP = 0.1;
const DEFAULTS: ReaderSettings = { readerMode: false, arabicScale: 1, translationScale: 1 };

function clampScale(value: unknown) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 1;
  return Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, n)) * 10) / 10;
}

function read(): ReaderSettings {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Partial<ReaderSettings>;
    return {
      readerMode: raw.readerMode === true,
      arabicScale: clampScale(raw.arabicScale),
      translationScale: clampScale(raw.translationScale),
    };
  } catch {
    return DEFAULTS;
  }
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);

  useEffect(() => {
    const load = () => setSettings(read());
    load();
    window.addEventListener(EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    const next = { ...read(), ...patch };
    next.arabicScale = clampScale(next.arabicScale);
    next.translationScale = clampScale(next.translationScale);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures; the setting still applies for this view
    }
    setSettings(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [settings, update] as const;
}
