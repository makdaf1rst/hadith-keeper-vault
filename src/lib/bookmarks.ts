import { useEffect, useState } from "react";

export type Bookmark = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
  savedAt: number;
};

export type BookmarkBackup = {
  app: "al-jami-al-kamil";
  version: 1;
  exportedAt: string;
  bookmarks: Bookmark[];
};

const STORAGE_KEY = "jami-al-kamil-bookmarks-v1";
const EMPTY: Bookmark[] = [];

function normalizeBookmark(item: unknown): Bookmark | null {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  const number = Number(value["number"]);
  if (!Number.isFinite(number) || number <= 0) return null;

  return {
    number,
    bookTitle: typeof value["bookTitle"] === "string" ? value["bookTitle"] : null,
    collectionTitle: typeof value["collectionTitle"] === "string" ? value["collectionTitle"] : null,
    chapterTitle: typeof value["chapterTitle"] === "string" ? value["chapterTitle"] : null,
    savedAt: Number.isFinite(Number(value["savedAt"])) ? Number(value["savedAt"]) : Date.now(),
  };
}

function readLocalBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed
      .map(normalizeBookmark)
      .filter((bookmark): bookmark is Bookmark => !!bookmark)
      .sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return EMPTY;
  }
}

function writeLocalBookmarks(bookmarks: Bookmark[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function mergeBookmarks(current: Bookmark[], incoming: Bookmark[]) {
  const merged = new Map<number, Bookmark>();
  [...current, ...incoming].forEach((bookmark) => {
    const existing = merged.get(bookmark.number);
    if (!existing || bookmark.savedAt >= existing.savedAt) {
      merged.set(bookmark.number, bookmark);
    }
  });
  return Array.from(merged.values()).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Device-only bookmarks. No account or sign-in is required.
 * Readers can export a backup file and restore it on another device.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setBookmarks(readLocalBookmarks());
    setIsLoading(false);
  }, []);

  async function toggle(entry: Omit<Bookmark, "savedAt">) {
    const exists = bookmarks.some((bookmark) => bookmark.number === entry.number);
    const next = exists
      ? bookmarks.filter((bookmark) => bookmark.number !== entry.number)
      : [{ ...entry, savedAt: Date.now() }, ...bookmarks];

    setBookmarks(next);
    writeLocalBookmarks(next);
    return !exists;
  }

  async function remove(number: number) {
    const next = bookmarks.filter((bookmark) => bookmark.number !== number);
    setBookmarks(next);
    writeLocalBookmarks(next);
  }

  function createBackup(): BookmarkBackup {
    return {
      app: "al-jami-al-kamil",
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks,
    };
  }

  function restoreBackup(input: unknown) {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid bookmark backup file.");
    }

    const backup = input as Partial<BookmarkBackup>;
    if (
      backup.app !== "al-jami-al-kamil" ||
      backup.version !== 1 ||
      !Array.isArray(backup.bookmarks)
    ) {
      throw new Error("This is not a valid Al-Jāmiʿ al-Kāmil bookmark backup.");
    }

    const incoming = backup.bookmarks
      .map(normalizeBookmark)
      .filter((bookmark): bookmark is Bookmark => !!bookmark);

    const merged = mergeBookmarks(bookmarks, incoming);
    setBookmarks(merged);
    writeLocalBookmarks(merged);

    return {
      imported: incoming.length,
      total: merged.length,
    };
  }

  return {
    bookmarks,
    isLoading,
    pending: false,
    has: (number: number) => bookmarks.some((bookmark) => bookmark.number === number),
    toggle,
    remove,
    createBackup,
    restoreBackup,
  };
}
