import { useCallback, useSyncExternalStore } from "react";

export type Bookmark = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
  savedAt: number;
};

const KEY = "jamikamil.bookmarks.v1";

const listeners = new Set<() => void>();
let cache: Bookmark[] | null = null;
let cacheRaw: string | null = null;

function read(): Bookmark[] {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return [];
  }
  if (cache && raw === cacheRaw) return cache;
  let parsed: Bookmark[] = [];
  try {
    const value = raw ? JSON.parse(raw) : [];
    if (Array.isArray(value)) {
      parsed = value.filter((b) => b && Number.isFinite(Number(b.number)));
    }
  } catch {
    parsed = [];
  }
  cacheRaw = raw;
  cache = parsed;
  return parsed;
}

function write(next: Bookmark[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — bookmarks simply do not persist */
  }
  cacheRaw = null;
  cache = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: Bookmark[] = [];

/** Reader-owned bookmarks kept in this browser only. Never touches the database. */
export function useBookmarks() {
  const list = useSyncExternalStore(
    subscribe,
    read,
    () => EMPTY,
  );

  const toggle = useCallback((entry: Omit<Bookmark, "savedAt">) => {
    const current = read();
    const exists = current.some((b) => b.number === entry.number);
    const next = exists
      ? current.filter((b) => b.number !== entry.number)
      : [{ ...entry, savedAt: Date.now() }, ...current];
    write(next);
    return !exists;
  }, []);

  const remove = useCallback((number: number) => {
    write(read().filter((b) => b.number !== number));
  }, []);

  const has = useCallback((number: number) => list.some((b) => b.number === number), [list]);

  return { bookmarks: list, toggle, remove, has };
}
