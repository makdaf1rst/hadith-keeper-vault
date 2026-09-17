import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

function toBookmark(row: Row): Bookmark {
  return {
    number: row.hadith_number,
    bookTitle: row.book_title,
    collectionTitle: row.collection_title,
    chapterTitle: row.chapter_title,
    savedAt: new Date(row.created_at).getTime(),
  };
}

const EMPTY: Bookmark[] = [];

/**
 * Account-backed bookmarks stored in the database against the signed-in reader.
 * Never touches hadith records.
 */
export function useBookmarks() {
  const { user, signedIn, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const queryKey = ["bookmarks", userId] as const;

  const list = useQuery({
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

  const bookmarks = list.data ?? EMPTY;

  const toggleMutation = useMutation({
    mutationFn: async (entry: Omit<Bookmark, "savedAt">) => {
      if (!userId) throw new Error("Sign in to save bookmarks.");
      const exists = bookmarks.some((b) => b.number === entry.number);
      if (exists) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("hadith_number", entry.number);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase.from("bookmarks").insert({
        user_id: userId,
        hadith_number: entry.number,
        book_title: entry.bookTitle ?? null,
        collection_title: entry.collectionTitle ?? null,
        chapter_title: entry.chapterTitle ?? null,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: async (number: number) => {
      if (!userId) throw new Error("Sign in to manage bookmarks.");
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("hadith_number", number);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    bookmarks,
    signedIn,
    sessionLoading,
    isLoading: !!userId && list.isLoading,
    pending: toggleMutation.isPending || removeMutation.isPending,
    has: (number: number) => bookmarks.some((b) => b.number === number),
    toggle: (entry: Omit<Bookmark, "savedAt">) => toggleMutation.mutateAsync(entry),
    remove: (number: number) => removeMutation.mutateAsync(number),
  };
}
