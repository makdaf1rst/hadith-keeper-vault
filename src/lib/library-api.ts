import { supabase } from "@/integrations/supabase/client";
import { containsArabic, normalizeArabic, normalizeEnglish } from "@/lib/normalize";

export type Intro = {
  intro_ar_source: string | null;
  intro_ar_display: string | null;
  intro_en_source: string | null;
  intro_en_display: string | null;
};

const INTRO_COLUMNS =
  "intro_ar_source, intro_ar_display, intro_en_source, intro_en_display";

export type Book = Intro & {
  id: string;
  book_number: number;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
};

export type Collection = Intro & {
  id: string;
  book_id: string;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
};

export type Chapter = Intro & {
  id: string;
  book_id: string;
  collection_id: string | null;
  chapter_number: number | null;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
};

export type HadithStub = {
  id: string;
  hadith_number: number;
  chapter_id: string | null;
};

export type HadithFull = {
  id: string;
  hadith_number: number;
  book_id: string | null;
  collection_id: string | null;
  chapter_id: string | null;
  arabic_source: string | null;
  arabic_display: string | null;
  english_source: string | null;
  english_display: string | null;
  full_source_content: string | null;
  full_display_content: string | null;
  sort_order: number;
  source_document_id: string | null;
};

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(`id, book_number, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
    .order("sort_order", { ascending: true })
    .order("book_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchBookByNumber(bookNumber: number): Promise<Book | null> {
  const { data, error } = await supabase
    .from("books")
    .select(`id, book_number, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
    .eq("book_number", bookNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCollections(bookId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select(`id, book_id, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
    .eq("book_id", bookId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchChapters(bookId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from("chapters")
    .select(`id, book_id, collection_id, chapter_number, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
    .eq("book_id", bookId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchChapterHadiths(chapterId: string): Promise<HadithStub[]> {
  const { data, error } = await supabase
    .from("hadiths")
    .select("id, hadith_number, chapter_id")
    .eq("chapter_id", chapterId)
    .order("hadith_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchHadithByNumber(hadithNumber: number): Promise<HadithFull | null> {
  const { data, error } = await supabase
    .from("hadiths")
    .select(
      "id, hadith_number, book_id, collection_id, chapter_id, arabic_source, arabic_display, english_source, english_display, full_source_content, full_display_content, sort_order, source_document_id",
    )
    .eq("hadith_number", hadithNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchHadithContext(hadith: HadithFull) {
  const [book, collection, chapter] = await Promise.all([
    hadith.book_id
      ? supabase
          .from("books")
          .select(`id, book_number, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
          .eq("id", hadith.book_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    hadith.collection_id
      ? supabase
          .from("collections")
          .select(`id, book_id, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
          .eq("id", hadith.collection_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    hadith.chapter_id
      ? supabase
          .from("chapters")
          .select(`id, book_id, collection_id, chapter_number, title_ar, title_en, sort_order, ${INTRO_COLUMNS}`)
          .eq("id", hadith.chapter_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  return {
    book: (book.data as Book | null) ?? null,
    collection: (collection.data as Collection | null) ?? null,
    chapter: (chapter.data as Chapter | null) ?? null,
  };
}

export async function fetchNeighbours(hadithNumber: number) {
  const [prev, next] = await Promise.all([
    supabase
      .from("hadiths")
      .select("hadith_number")
      .lt("hadith_number", hadithNumber)
      .order("hadith_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("hadiths")
      .select("hadith_number")
      .gt("hadith_number", hadithNumber)
      .order("hadith_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    previous: prev.data?.hadith_number ?? null,
    next: next.data?.hadith_number ?? null,
  };
}

export type SearchFilters = {
  query: string;
  bookId?: string | null;
  collectionId?: string | null;
  chapterId?: string | null;
  language?: "all" | "ar" | "en";
};

export type SearchResult = {
  id: string;
  hadith_number: number;
  book_id: string | null;
  collection_id: string | null;
  chapter_id: string | null;
  arabic_display: string | null;
  english_display: string | null;
};

function escapeForOr(value: string) {
  return value.replace(/[%,()]/g, " ").trim();
}

export async function searchHadiths(filters: SearchFilters): Promise<SearchResult[]> {
  const raw = filters.query.trim();
  if (!raw) return [];

  let request = supabase
    .from("hadiths")
    .select(
      "id, hadith_number, book_id, collection_id, chapter_id, arabic_display, english_display",
    )
    .order("hadith_number", { ascending: true })
    .limit(200);

  if (filters.bookId) request = request.eq("book_id", filters.bookId);
  if (filters.collectionId) request = request.eq("collection_id", filters.collectionId);
  if (filters.chapterId) request = request.eq("chapter_id", filters.chapterId);

  const language = filters.language ?? "all";
  const arTerm = escapeForOr(normalizeArabic(raw));
  const enTerm = escapeForOr(normalizeEnglish(raw));

  const clauses: string[] = [];
  if (arTerm && language !== "en" && containsArabic(raw)) {
    clauses.push(`search_ar_normalized.ilike.%${arTerm}%`);
  }
  if (enTerm && language !== "ar" && !containsArabic(raw)) {
    clauses.push(`search_en_normalized.ilike.%${enTerm}%`);
  }
  if (clauses.length === 0) {
    if (arTerm && language !== "en") clauses.push(`search_ar_normalized.ilike.%${arTerm}%`);
    if (enTerm && language !== "ar") clauses.push(`search_en_normalized.ilike.%${enTerm}%`);
  }
  if (clauses.length === 0) return [];

  const { data, error } = await request.or(clauses.join(","));
  if (error) throw error;
  return data ?? [];
}

export type HeadingHit = {
  kind: "book" | "collection" | "chapter";
  id: string;
  bookNumber?: number;
  title_ar: string | null;
  title_en: string | null;
};

export async function searchHeadings(query: string): Promise<HeadingHit[]> {
  const raw = query.trim();
  if (raw.length < 2) return [];
  const term = escapeForOr(raw);
  const pattern = `%${term}%`;
  const [books, collections, chapters] = await Promise.all([
    supabase
      .from("books")
      .select("id, book_number, title_ar, title_en")
      .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern}`)
      .limit(20),
    supabase
      .from("collections")
      .select("id, title_ar, title_en")
      .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern}`)
      .limit(20),
    supabase
      .from("chapters")
      .select("id, title_ar, title_en")
      .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern}`)
      .limit(20),
  ]);

  const hits: HeadingHit[] = [];
  for (const b of books.data ?? [])
    hits.push({
      kind: "book",
      id: b.id,
      bookNumber: b.book_number,
      title_ar: b.title_ar,
      title_en: b.title_en,
    });
  for (const c of collections.data ?? [])
    hits.push({ kind: "collection", id: c.id, title_ar: c.title_ar, title_en: c.title_en });
  for (const c of chapters.data ?? [])
    hits.push({ kind: "chapter", id: c.id, title_ar: c.title_ar, title_en: c.title_en });
  return hits;
}

export async function fetchLibraryStats() {
  const [books, hadiths, documents] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("hadiths").select("*", { count: "exact", head: true }),
    supabase.from("import_documents").select("*", { count: "exact", head: true }),
  ]);
  return {
    books: books.count ?? 0,
    hadiths: hadiths.count ?? 0,
    documents: documents.count ?? 0,
  };
}
