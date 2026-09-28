import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type Bookmark = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
  savedAt: number;
};

type Row = {
  hadith_number: number;
  book_title: string | null;
  collection_title: string | null;
  chapter_title: string | null;
  created_at: string;
};

const STORAGE_KEY = "jami-al-kamil-bookmarks-v1";
const EMPTY: Bookmark[] = [];

function toBookmark(row: Row): Bookmark {
  return {
    number: row.hadith_number,
    bookTitle: row.book_title,
    collectionTitle: row.collection_title,
    chapterTitle: row.chapter_title,
    savedAt: new Date(row.created_at).getTime(),
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
      .filter((item) => item && Number.isFinite(Number(item.number)))
      .map((item) => ({
        number: Number(item.number),
        bookTitle: typeof item.bookTitle === "string" ? item.bookTitle : null,
        collectionTitle: typeof item.collectionTitle === "string" ? item.collectionTitle : null,
        chapterTitle: typeof item.chapterTitle === "string" ? item.chapterTitle : null,
        savedAt: Number.isFinite(Number(item.savedAt)) ? Number(item.savedAt) : Date.now(),
      }));
  } catch {
    return EMPTY;
  }
}

function writeLocalBookmarks(bookmarks: Bookmark[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function mergeBookmarks(local: Bookmark[], remote: Bookmark[]) {
  const merged = new Map<number, Bookmark>();
  remote.forEach((bookmark) => merged.set(bookmark.number, bookmark));
  local.forEach((bookmark) => merged.set(bookmark.number, bookmark));
  return Array.from(merged.values()).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Bookmarks always save to this browser/device first.
 * Signed-in readers additionally sync the same bookmarks to their account,
 * allowing them to appear on other devices after sign-in.
 */
export function useBookmarks() {
  const { user, signedIn, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const queryKey = ["bookmarks", userId] as const;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(EMPTY);
  const [localReady, setLocalReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setBookmarks(readLocalBookmarks());
    setLocalReady(true);
  }, []);

  const remote = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<Bookmark[]> => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("hadith_number, book_title, collection_title, chapter_title, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => toBookmark(row as Row));
    },
  });

  // When a reader signs in, merge device bookmarks with account bookmarks.
  // Device-only bookmarks are then uploaded so they follow the reader elsewhere.
  useEffect(() => {
    if (!userId || !localReady || !remote.data) return;

    const merged = mergeBookmarks(bookmarks, remote.data);
    setBookmarks(merged);
    writeLocalBookmarks(merged);

    const remoteNumbers = new Set(remote.data.map((bookmark) => bookmark.number));
    const deviceOnly = bookmarks.filter((bookmark) => !remoteNumbers.has(bookmark.number));
    if (!deviceOnly.length) return;

    void supabase
      .from("bookmarks")
      .upsert(
        deviceOnly.map((bookmark) => ({
          user_id: userId,
          hadith_number: bookmark.number,
          book_title: bookmark.bookTitle ?? null,
          collection_title: bookmark.collectionTitle ?? null,
          chapter_title: bookmark.chapterTitle ?? null,
        })),
        { onConflict: "user_id,hadith_number" },
      )
      .then(({ error }) => {
        if (!error) {
          void queryClient.invalidateQueries({ queryKey });
        } else {
          console.error("Could not sync device bookmarks to account", error);
        }
      });
  }, [bookmarks, localReady, queryClient, remote.data, userId]);

  async function toggle(entry: Omit<Bookmark, "savedAt">) {
    const exists = bookmarks.some((bookmark) => bookmark.number === entry.number);
    const next = exists
      ? bookmarks.filter((bookmark) => bookmark.number !== entry.number)
      : [
          {
            ...entry,
            savedAt: Date.now(),
          },
          ...bookmarks,
        ];

    setBookmarks(next);
    writeLocalBookmarks(next);

    if (!userId) return !exists;

    setPending(true);
    try {
      if (exists) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("hadith_number", entry.number);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bookmarks").upsert(
          {
            user_id: userId,
            hadith_number: entry.number,
            book_title: entry.bookTitle ?? null,
            collection_title: entry.collectionTitle ?? null,
            chapter_title: entry.chapterTitle ?? null,
          },
          { onConflict: "user_id,hadith_number" },
        );
        if (error) throw error;
      }
      void queryClient.invalidateQueries({ queryKey });
      return !exists;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Saved on this device, but account sync failed: ${error.message}`
          : "Saved on this device, but account sync failed.",
      );
    } finally {
      setPending(false);
    }
  }

  async function remove(number: number) {
    const next = bookmarks.filter((bookmark) => bookmark.number !== number);
    setBookmarks(next);
    writeLocalBookmarks(next);

    if (!userId) return;

    setPending(true);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("hadith_number", number);
      if (error) throw error;
      void queryClient.invalidateQueries({ queryKey });
    } finally {
      setPending(false);
    }
  }

  return {
    bookmarks,
    signedIn,
    sessionLoading,
    isLoading: !localReady || (!!userId && remote.isLoading),
    pending,
    has: (number: number) => bookmarks.some((bookmark) => bookmark.number === number),
    toggle,
    remove,
  };
}
