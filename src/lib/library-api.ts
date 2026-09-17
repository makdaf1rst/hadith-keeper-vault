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

const HADITH_FULL_COLUMNS =
  "id, hadith_number, book_id, collection_id, chapter_id, arabic_source, arabic_display, english_source, english_display, full_source_content, full_display_content, sort_order, source_document_id";

/** Every hadith of one book, paged so large Kitābs load completely. */
export async function fetchBookHadiths(bookId: string): Promise<HadithFull[]> {
  const pageSize = 500;
  const all: HadithFull[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("hadiths")
      .select(HADITH_FULL_COLUMNS)
      .eq("book_id", bookId)
      .order("sort_order", { ascending: true })
      .order("hadith_number", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
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

const SEARCH_COLUMNS =
  "id, hadith_number, book_id, collection_id, chapter_id, arabic_display, english_display";

function escapeForOr(value: string) {
  return value.replace(/[%,()]/g, " ").replace(/\s+/g, " ").trim();
}

function getSearchTokens(value: string, isArabic: boolean) {
  const minimumLength = isArabic ? 2 : 3;
  return [...new Set(value.split(/\s+/).filter((token) => token.length >= minimumLength))];
}

function scoreCandidate(result: SearchResult, tokens: string[], isArabic: boolean) {
  const text = isArabic
    ? normalizeArabic(result.arabic_display ?? "")
    : normalizeEnglish(result.english_display ?? "");
  if (!text || tokens.length === 0) return 0;
  const matched = tokens.reduce((count, token) => count + (text.includes(token) ? 1 : 0), 0);
  return matched / tokens.length;
}

export async function searchHadiths(filters: SearchFilters): Promise<SearchResult[]> {
  const raw = filters.query.trim();
  if (!raw) return [];

  const language = filters.language ?? "all";
  const queryIsArabic = containsArabic(raw);
  const searchArabic = language !== "en" && (queryIsArabic || language === "ar");
  const searchEnglish = language !== "ar" && (!queryIsArabic || language === "en");
  const arTerm = escapeForOr(normalizeArabic(raw));
  const enTerm = escapeForOr(normalizeEnglish(raw));

  const buildRequest = () => {
    let request = supabase
      .from("hadiths")
      .select(SEARCH_COLUMNS)
      .order("hadith_number", { ascending: true })
      .limit(200);

    if (filters.bookId) request = request.eq("book_id", filters.bookId);
    if (filters.collectionId) request = request.eq("collection_id", filters.collectionId);
    if (filters.chapterId) request = request.eq("chapter_id", filters.chapterId);
    return request;
  };

  // First try the complete normalized phrase. This keeps short/exact searches fast.
  const phraseClauses: string[] = [];
  if (searchArabic && arTerm) phraseClauses.push(`search_ar_normalized.ilike.%${arTerm}%`);
  if (searchEnglish && enTerm) phraseClauses.push(`search_en_normalized.ilike.%${enTerm}%`);

  if (phraseClauses.length > 0) {
    const { data, error } = await buildRequest().or(phraseClauses.join(","));
    if (error) throw error;
    if (data?.length) return data;
  }

  // A copied sentence can differ from the stored search index only in punctuation,
  // apostrophe spacing, tashkil, or a small wording correction. Fall back to strong
  // word anchors, then rank candidates against the CURRENT displayed hadith text.
  const isArabic = searchArabic && (!searchEnglish || queryIsArabic);
  const normalized = isArabic ? arTerm : enTerm;
  const allTokens = getSearchTokens(normalized, isArabic);
  if (allTokens.length === 0) return [];

  const anchorTokens = [...allTokens]
    .sort((a, b) => b.length - a.length)
    .slice(0, Math.min(3, allTokens.length));

  let fallback = buildRequest();
  const field = isArabic ? "search_ar_normalized" : "search_en_normalized";
  for (const token of anchorTokens) {
    fallback = fallback.ilike(field, `%${escapeForOr(token)}%`);
  }

  let { data: fallbackData, error: fallbackError } = await fallback;
  if (fallbackError) throw fallbackError;

  // If three anchors were too restrictive because an index is stale, retry with
  // the single strongest token and let client-side scoring identify the best rows.
  if ((!fallbackData || fallbackData.length === 0) && anchorTokens.length > 1) {
    const retry = buildRequest().ilike(field, `%${escapeForOr(anchorTokens[0] ?? "")}%`);
    const retryResult = await retry;
    if (retryResult.error) throw retryResult.error;
    fallbackData = retryResult.data;
  }

  const scored = (fallbackData ?? [])
    .map((result) => ({ result, score: scoreCandidate(result, allTokens, isArabic) }))
    .filter(({ score }) => score >= (allTokens.length <= 3 ? 1 : 0.6))
    .sort((a, b) => b.score - a.score || a.result.hadith_number - b.result.hadith_number)
    .slice(0, 200)
    .map(({ result }) => result);

  return scored;
}

export type HeadingHit = {
  kind: "book" | "collection" | "chapter";
  id: string;
  bookNumber?: number;
  chapterNumber?: number | null;
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
      .select("id, chapter_number, title_ar, title_en")
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
    hits.push({
      kind: "chapter",
      id: c.id,
      chapterNumber: c.chapter_number,
      title_ar: c.title_ar,
      title_en: c.title_en,
    });
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
