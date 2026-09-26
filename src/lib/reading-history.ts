import { useEffect, useState } from "react";

/**
 * Device-local reading history (localStorage only — never sent to the backend).
 * Stores only the hadith number plus display labels for the hierarchy.
 */
export type HistoryEntry = {
  number: number;
  bookTitle: string | null;
  collectionTitle: string | null;
  chapterTitle: string | null;
  viewedAt: number;
};

const KEY = "jami-reading-history.v1";
const EVENT = "jami-reading-history-change";
const LIMIT = 10;

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is HistoryEntry =>
          !!item && typeof item === "object" && Number.isFinite((item as HistoryEntry).number),
      )
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

function save(list: HistoryEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // storage unavailable (private mode / quota) — history is optional
  }
}

export function recordHistory(entry: Omit<HistoryEntry, "viewedAt">) {
  const rest = readHistory().filter((item) => item.number !== entry.number);
  save([{ ...entry, viewedAt: Date.now() }, ...rest]);
}

export function clearHistory() {
  save([]);
}

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const load = () => setHistory(readHistory());
    load();
    window.addEventListener(EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return history;
}
