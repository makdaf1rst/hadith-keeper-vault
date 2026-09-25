import { createIsomorphicFn } from "@tanstack/react-start";

import { containsArabic, normalizeArabic, normalizeEnglish } from "@/lib/normalize";

export type Intro = {
  intro_ar_source: string | null;
  intro_ar_display: string | null;
  intro_en_source: string | null;
  intro_en_display: string | null;
};

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

type BookChaptersFile = {
  collections: Collection[];
  chapters: Chapter[];
};

type HadithIndexEntry = { n: number; b: number };

type StatsFile = {
  books: number;
  hadiths: number;
  chapters: number;
  collections: number;
  documents: number;
};

/**
 * Static content loading.
 *
 * In the browser, files under public/content/ are fetched as `/content/...`.
 * During SSR there is no base URL for a relative fetch, so the request origin
 * is taken from TanStack Start's request context; if no request is in scope
 * (e.g. a server function outside a handler) the file is read from disk.
 * createIsomorphicFn keeps the server branch (and its server-only imports)
 * out of the client bundle. Note: all current callers run through react-query
 * on the client, so the SSR path is a safety net, not the hot path.
 */
const fetchContent = createIsomorphicFn()
  .client(async (path: string): Promise<unknown> => {
    const response = await fetch(`/content/${path}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load /content/${path}: ${response.status}`);
    return response.json();
  })
  .server(async (path: string): Promise<unknown> => {
    try {
      const { getRequestUrl } = await import("@tanstack/react-start/server");
      const url = new URL(`/content/${path}`, getRequestUrl().origin);
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
      return response.json();
    } catch {
      const { readFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      const text = await readFile(join(process.cwd(), "public", "content", path), "utf8");
      return JSON.parse(text);
    }
  });

const booksCache = { current: null as Promise<Book[]> | null };
const statsCache = { current: null as Promise<StatsFile> | null };
const hadithIndexCache = { current: null as Promise<HadithIndexEntry[]> | null };
const bookChaptersCache = new Map<number, Promise<BookChaptersFile>>();
const bookHadithsCache = new Map<number, Promise<HadithFull[]>>();

function loadBooks(): Promise<Book[]> {
  booksCache.current ??= fetchContent("books.json") as Promise<Book[]>;
  return booksCache.current;
}

function loadStats(): Promise<StatsFile> {
  statsCache.current ??= fetchContent("stats.json") as Promise<StatsFile>;
  return statsCache.current;
}

function loadHadithIndex(): Promise<HadithIndexEntry[]> {
  hadithIndexCache.current ??= fetchContent("hadith-index.json") as Promise<HadithIndexEntry[]>;
  return hadithIndexCache.current;
}

function loadBookChapters(bookNumber: number): Promise<BookChaptersFile> {
  let cached = bookChaptersCache.get(bookNumber);
  if (!cached) {
    cached = fetchContent(`book-${bookNumber}/chapters.json`) as Promise<BookChaptersFile>;
    bookChaptersCache.set(bookNumber, cached);
  }
  return cached;
}

/** Every hadith of one book, from its static per-book file. */
function loadBookHadiths(bookNumber: number): Promise<HadithFull[]> {
  let cached = bookHadithsCache.get(bookNumber);
  if (!cached) {
    cached = fetchContent(`book-${bookNumber}/hadiths.json`) as Promise<HadithFull[]>;
    bookHadithsCache.set(bookNumber, cached);
  }
  return cached;
}

async function bookNumberForId(bookId: string): Promise<number | null> {
  const books = await loadBooks();
  return books.find((b) => b.id === bookId)?.book_number ?? null;
}

/**
 * Finds the book_number whose chapters file contains the given chapter or
 * collection id. Checks already-cached books first, then walks the remaining
 * per-book chapter files (they are small) until the id resolves.
 */
async function bookNumberForHeadingId(id: string): Promise<number | null> {
  const matches = (file: BookChaptersFile) =>
    file.chapters.some((c) => c.id === id) || file.collections.some((c) => c.id === id);

  for (const [bookNumber, cached] of bookChaptersCache) {
    try {
      if (matches(await cached)) return bookNumber;
    } catch {
      // ignore unreadable cached file, keep scanning
    }
  }

  const books = await loadBooks();
  for (const book of books) {
    if (bookChaptersCache.has(book.book_number)) continue;
    try {
      if (matches(await loadBookChapters(book.book_number))) return book.book_number;
    } catch {
      // book has no chapters file yet, keep scanning
    }
  }
  return null;
}

export async function fetchBooks(): Promise<Book[]> {
  const books = await loadBooks();
  return [...books].sort((a, b) => a.book_number - b.book_number);
}

export async function fetchBookByNumber(bookNumber: number): Promise<Book | null> {
  const books = await loadBooks();
  return books.find((b) => b.book_number === bookNumber) ?? null;
}

async function refreshBookChapters(bookNumber: number): Promise<BookChaptersFile> {
  const fresh = fetchContent(`book-${bookNumber}/chapters.json`) as Promise<BookChaptersFile>;
  bookChaptersCache.set(bookNumber, fresh);
  return fresh;
}

export async function fetchCollections(bookId: string): Promise<Collection[]> {
  const bookNumber = await bookNumberForId(bookId);
  if (bookNumber === null) return [];
  const file = await refreshBookChapters(bookNumber);
  return file.collections;
}

export async function fetchChapters(bookId: string): Promise<Chapter[]> {
  const bookNumber = await bookNumberForId(bookId);
  if (bookNumber === null) return [];
  const file = await refreshBookChapters(bookNumber);
  return file.chapters;
}

export async function fetchChapterHadiths(chapterId: string): Promise<HadithStub[]> {
  const bookNumber = await bookNumberForHeadingId(chapterId);
  if (bookNumber === null) return [];
  const hadiths = await loadBookHadiths(bookNumber);
  return hadiths
    .filter((h) => h.chapter_id === chapterId)
    .map((h) => ({ id: h.id, hadith_number: h.hadith_number, chapter_id: h.chapter_id }))
    .sort((a, b) => a.hadith_number - b.hadith_number);
}

export async function fetchBookHadiths(bookId: string): Promise<HadithFull[]> {
  const bookNumber = await bookNumberForId(bookId);
  if (bookNumber === null) return [];
  return loadBookHadiths(bookNumber);
}

export async function fetchHadithByNumber(hadithNumber: number): Promise<HadithFull | null> {
  const index = await loadHadithIndex();
  const entry = index.find((e) => e.n === hadithNumber);
  if (!entry) return null;
  const hadiths = await loadBookHadiths(entry.b);
  return hadiths.find((h) => h.hadith_number === hadithNumber) ?? null;
}

export async function fetchHadithContext(hadith: HadithFull) {
  const books = await loadBooks();
  const book = hadith.book_id ? (books.find((b) => b.id === hadith.book_id) ?? null) : null;

  let collection: Collection | null = null;
  let chapter: Chapter | null = null;
  if (book && (hadith.collection_id || hadith.chapter_id)) {
    const file = await loadBookChapters(book.book_number);
    collection = hadith.collection_id
      ? (file.collections.find((c) => c.id === hadith.collection_id) ?? null)
      : null;
    chapter = hadith.chapter_id
      ? (file.chapters.find((c) => c.id === hadith.chapter_id) ?? null)
      : null;
  }
  return { book, collection, chapter };
}

export type ReadingTarget =
  | { kind: "hadith"; number: number }
  | {
      kind: "chapter";
      id: string;
      chapterNumber: number | null;
      isIntroduction: boolean;
    };

function hasMeaningfulChapterIntro(chapter: Chapter): boolean {
  return [
    chapter.intro_ar_display,
    chapter.intro_ar_source,
    chapter.intro_en_display,
    chapter.intro_en_source,
  ].some((value) => value?.trim());
}

async function readingSequenceForBook(bookNumber: number): Promise<ReadingTarget[]> {
  const [file, hadiths] = await Promise.all([
    loadBookChapters(bookNumber),
    loadBookHadiths(bookNumber),
  ]);

  const sortedHadiths = [...hadiths].sort((a, b) => a.hadith_number - b.hadith_number);
  const hadithsByChapter = new Map<string, HadithFull[]>();

  for (const hadith of sortedHadiths) {
    if (!hadith.chapter_id) continue;
    const list = hadithsByChapter.get(hadith.chapter_id) ?? [];
    list.push(hadith);
    hadithsByChapter.set(hadith.chapter_id, list);
  }

  const collections = [...file.collections].sort((a, b) => a.sort_order - b.sort_order);
  const collectionRank = new Map(collections.map((collection, index) => [collection.id, index]));

  const structuralChapters = [...file.chapters].sort((a, b) => {
    const aCollection = a.collection_id
      ? (collectionRank.get(a.collection_id) ?? Number.MAX_SAFE_INTEGER)
      : -1;
    const bCollection = b.collection_id
      ? (collectionRank.get(b.collection_id) ?? Number.MAX_SAFE_INTEGER)
      : -1;
    if (aCollection !== bCollection) return aCollection - bCollection;
    return a.sort_order - b.sort_order || (a.chapter_number ?? 0) - (b.chapter_number ?? 0);
  });

  const stopsAfter = new Map<number, Chapter[]>();
  const stopsBefore = new Map<number, Chapter[]>();

  for (let i = 0; i < structuralChapters.length; i += 1) {
    const chapter = structuralChapters[i];
    if ((hadithsByChapter.get(chapter.id) ?? []).length > 0) continue;
    if (!hasMeaningfulChapterIntro(chapter)) continue;

    let previousNumber: number | null = null;
    let nextNumber: number | null = null;

    for (let j = i - 1; j >= 0; j -= 1) {
      const previousHadiths = hadithsByChapter.get(structuralChapters[j].id) ?? [];
      if (previousHadiths.length > 0) {
        previousNumber = Math.max(...previousHadiths.map((hadith) => hadith.hadith_number));
        break;
      }
    }

    for (let j = i + 1; j < structuralChapters.length; j += 1) {
      const nextHadiths = hadithsByChapter.get(structuralChapters[j].id) ?? [];
      if (nextHadiths.length > 0) {
        nextNumber = Math.min(...nextHadiths.map((hadith) => hadith.hadith_number));
        break;
      }
    }

    // Only insert the chapter when its structural neighbours agree with the
    // numbered hadith reading order. This prevents unrelated collection-only
    // chapters from being dumped at the start of a book (notably Book 48).
    if (
      previousNumber !== null &&
      nextNumber !== null &&
      previousNumber < nextNumber
    ) {
      const list = stopsAfter.get(previousNumber) ?? [];
      list.push(chapter);
      stopsAfter.set(previousNumber, list);
      continue;
    }

    if (previousNumber !== null && nextNumber === null) {
      const lastHadithNumber = sortedHadiths.at(-1)?.hadith_number ?? null;
      if (lastHadithNumber !== null && previousNumber === lastHadithNumber) {
        const list = stopsAfter.get(previousNumber) ?? [];
        list.push(chapter);
        stopsAfter.set(previousNumber, list);
      }
      continue;
    }

    if (previousNumber === null && nextNumber !== null) {
      const firstHadithNumber = sortedHadiths[0]?.hadith_number ?? null;
      if (firstHadithNumber !== null && nextNumber === firstHadithNumber) {
        const list = stopsBefore.get(nextNumber) ?? [];
        list.push(chapter);
        stopsBefore.set(nextNumber, list);
      }
    }
  }

  const sequence: ReadingTarget[] = [];

  for (const hadith of sortedHadiths) {
    const before = stopsBefore.get(hadith.hadith_number);
    if (before?.length) {
      before
        .sort((a, b) => a.sort_order - b.sort_order || (a.chapter_number ?? 0) - (b.chapter_number ?? 0))
        .forEach((chapter) => sequence.push({ kind: "chapter", id: chapter.id }));
    }

    sequence.push({ kind: "hadith", number: hadith.hadith_number });

    const after = stopsAfter.get(hadith.hadith_number);
    if (after?.length) {
      after
        .sort((a, b) => a.sort_order - b.sort_order || (a.chapter_number ?? 0) - (b.chapter_number ?? 0))
        .forEach((chapter) => sequence.push({ kind: "chapter", id: chapter.id }));
    }
  }

  return sequence;
}

async function readingSequenceForHadith(hadithNumber: number) {
  const index = await loadHadithIndex();
  const entry = index.find((item) => item.n === hadithNumber);
  if (!entry) return null;

  const sequence = await readingSequenceForBook(entry.b);
  const position = sequence.findIndex(
    (item) => item.kind === "hadith" && item.number === hadithNumber,
  );

  return position < 0 ? null : { bookNumber: entry.b, sequence, position };
}

async function adjacentAcrossBooks(
  bookNumber: number,
  sequence: ReadingTarget[],
  position: number,
): Promise<{ previous: ReadingTarget | null; next: ReadingTarget | null }> {
  const books = [...(await loadBooks())].sort((a, b) => a.book_number - b.book_number);
  const bookIndex = books.findIndex((book) => book.book_number === bookNumber);

  let previous = position > 0 ? sequence[position - 1] : null;
  let next = position < sequence.length - 1 ? sequence[position + 1] : null;

  if (!previous && bookIndex > 0) {
    for (let i = bookIndex - 1; i >= 0; i -= 1) {
      const previousSequence = await readingSequenceForBook(books[i].book_number);
      if (previousSequence.length > 0) {
        previous = previousSequence[previousSequence.length - 1];
        break;
      }
    }
  }

  if (!next && bookIndex >= 0 && bookIndex < books.length - 1) {
    for (let i = bookIndex + 1; i < books.length; i += 1) {
      const nextSequence = await readingSequenceForBook(books[i].book_number);
      if (nextSequence.length > 0) {
        next = nextSequence[0];
        break;
      }
    }
  }

  return { previous, next };
}

export async function fetchNeighbours(hadithNumber: number) {
  const result = await readingSequenceForHadith(hadithNumber);
  if (!result) return { previous: null, next: null };

  return adjacentAcrossBooks(result.bookNumber, result.sequence, result.position);
}

export async function fetchChapterContext(chapterId: string) {
  const bookNumber = await bookNumberForHeadingId(chapterId);
  if (bookNumber === null) return null;

  const [books, file] = await Promise.all([loadBooks(), loadBookChapters(bookNumber)]);
  const chapter = file.chapters.find((item) => item.id === chapterId) ?? null;
  if (!chapter) return null;

  const book = books.find((item) => item.book_number === bookNumber) ?? null;
  const collection = chapter.collection_id
    ? (file.collections.find((item) => item.id === chapter.collection_id) ?? null)
    : null;

  return { book, collection, chapter };
}

export async function fetchChapterNeighbours(chapterId: string) {
  const bookNumber = await bookNumberForHeadingId(chapterId);
  if (bookNumber === null) return { previous: null, next: null };

  const sequence = await readingSequenceForBook(bookNumber);
  const position = sequence.findIndex(
    (item) => item.kind === "chapter" && item.id === chapterId,
  );
  if (position < 0) return { previous: null, next: null };

  return adjacentAcrossBooks(bookNumber, sequence, position);
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

type PagefindResult = { data: () => Promise<{ url: string; meta: Record<string, string> }> };
type PagefindApi = {
  init: () => Promise<void>;
  search: (
    term: string,
    options?: { filters?: Record<string, string[]> },
  ) => Promise<{ results: PagefindResult[] }>;
};

/**
 * Loads the static pagefind index built by scripts/build-search-index.mjs.
 * Browser-only and resolved at runtime (the file is generated post-build, so
 * it must stay out of the Vite bundle). Resolves to null during SSR and in
 * dev, where /pagefind/ does not exist — callers then fall back to the
 * legacy cached-book search below.
 */
const pagefindCache = { current: null as Promise<PagefindApi | null> | null };

function loadPagefind(): Promise<PagefindApi | null> {
  pagefindCache.current ??= (async () => {
    if (typeof window === "undefined") return null;
    try {
      const pagefindPath = "/pagefind/pagefind.js";
      const pagefind = (await import(/* @vite-ignore */ pagefindPath)) as PagefindApi;
      await pagefind.init();
      return pagefind;
    } catch {
      return null;
    }
  })();
  return pagefindCache.current;
}

export async function searchHadiths(filters: SearchFilters): Promise<SearchResult[]> {
  if (!filters.query.trim()) return [];
  return pagefindSearchHadiths(filters);
}

/**
 * Full-text search over the static pagefind index. Each hadith is indexed as
 * two records (lang filter "ar" / "en") holding the display text plus the
 * folded search_*_normalized columns, so the query is run through the same
 * normalization before searching. Arabic and English records for the same
 * hadith share one result here (deduped by hadith_number).
 */
async function pagefindSearchHadiths(filters: SearchFilters): Promise<SearchResult[]> {
  const raw = filters.query.trim();
  const pagefind = await loadPagefind();
  if (!pagefind) return legacySearchHadiths(filters);

  const normalized = containsArabic(raw) ? normalizeArabic(raw) : normalizeEnglish(raw);
  const term = normalized || raw;

  const pfFilters: Record<string, string[]> = { kind: ["hadith"] };
  if (filters.bookId) pfFilters["book"] = [filters.bookId];
  if (filters.collectionId) pfFilters["collection"] = [filters.collectionId];
  if (filters.chapterId) pfFilters["chapter"] = [filters.chapterId];
  const language = filters.language ?? "all";
  if (language !== "all") pfFilters["lang"] = [language];

  const { results } = await pagefind.search(term, { filters: pfFilters });

  const seen = new Set<number>();
  const out: SearchResult[] = [];
  for (const result of results) {
    const { meta } = await result.data();
    const hadithNumber = Number(meta["hadith_number"]);
    if (!hadithNumber || seen.has(hadithNumber)) continue;
    seen.add(hadithNumber);
    const hadith = await fetchHadithByNumber(hadithNumber);
    if (!hadith) continue;
    out.push({
      id: hadith.id,
      hadith_number: hadith.hadith_number,
      book_id: hadith.book_id,
      collection_id: hadith.collection_id,
      chapter_id: hadith.chapter_id,
      arabic_display: hadith.arabic_display,
      english_display: hadith.english_display,
    });
    if (out.length >= 200) break;
  }
  out.sort((a, b) => a.hadith_number - b.hadith_number);
  return out;
}

/**
 * Legacy fallback used when the pagefind index is unavailable (vite dev, SSR).
 * With no book filter, only books whose hadith files are already cached in
 * this session are searched — usually none — so an unfiltered global text
 * search returns no results in dev. Set a book filter to search a whole book.
 */
async function legacySearchHadiths(filters: SearchFilters): Promise<SearchResult[]> {
  const raw = filters.query.trim();
  if (!raw) return [];

  let bookNumbers: number[];
  if (filters.bookId) {
    const bookNumber = await bookNumberForId(filters.bookId);
    bookNumbers = bookNumber === null ? [] : [bookNumber];
  } else if (filters.chapterId || filters.collectionId) {
    const bookNumber = await bookNumberForHeadingId((filters.chapterId ?? filters.collectionId)!);
    bookNumbers = bookNumber === null ? [] : [bookNumber];
  } else {
    bookNumbers = [...bookHadithsCache.keys()];
  }

  const language = filters.language ?? "all";
  const arTerm = normalizeArabic(raw);
  const enTerm = normalizeEnglish(raw);

  const searchAr = language !== "en" && (containsArabic(raw) || !enTerm) && !!arTerm;
  const searchEn = language !== "ar" && (!containsArabic(raw) || !arTerm) && !!enTerm;
  if (!searchAr && !searchEn) return [];

  const results: SearchResult[] = [];
  for (const bookNumber of bookNumbers) {
    const hadiths = await loadBookHadiths(bookNumber);
    for (const h of hadiths) {
      if (filters.collectionId && h.collection_id !== filters.collectionId) continue;
      if (filters.chapterId && h.chapter_id !== filters.chapterId) continue;

      let matched = false;
      if (searchAr) {
        const haystack = normalizeArabic(
          `${h.arabic_display ?? ""} ${h.full_source_content ?? ""}`,
        );
        matched = haystack.includes(arTerm);
      }
      if (!matched && searchEn) {
        const haystack = normalizeEnglish(
          `${h.english_display ?? ""} ${h.full_display_content ?? ""}`,
        );
        matched = haystack.includes(enTerm);
      }
      if (!matched) continue;

      results.push({
        id: h.id,
        hadith_number: h.hadith_number,
        book_id: h.book_id,
        collection_id: h.collection_id,
        chapter_id: h.chapter_id,
        arabic_display: h.arabic_display,
        english_display: h.english_display,
      });
      if (results.length >= 200) {
        results.sort((a, b) => a.hadith_number - b.hadith_number);
        return results;
      }
    }
  }
  results.sort((a, b) => a.hadith_number - b.hadith_number);
  return results;
}

export type HeadingHit = {
  kind: "book" | "collection" | "chapter";
  id: string;
  bookNumber?: number;
  chapterNumber?: number | null;
  title_ar: string | null;
  title_en: string | null;
};

function titleMatches(title: string | null, term: string): boolean {
  return title ? title.toLowerCase().includes(term) : false;
}

/**
 * Heading search over the pagefind index. Every book, collection and chapter
 * title (raw + normalized) is indexed with a shared "heading" value on the
 * kind filter (pagefind ANDs multiple query values on one filter, so the
 * shared tag is how all three kinds are covered by a single query), keeping
 * heading hits separate from hadith text hits.
 */
async function pagefindSearchHeadings(query: string): Promise<HeadingHit[]> {
  const raw = query.trim();
  const pagefind = await loadPagefind();
  if (!pagefind) return legacySearchHeadings(query);

  const normalized = containsArabic(raw) ? normalizeArabic(raw) : normalizeEnglish(raw);
  const term = normalized || raw;

  const { results } = await pagefind.search(term, {
    filters: { kind: ["heading"] },
  });

  const hits: HeadingHit[] = [];
  const counts = { book: 0, collection: 0, chapter: 0 };
  for (const result of results) {
    const { meta } = await result.data();
    const kind = meta["kind"] as HeadingHit["kind"];
    const id = meta["id"];
    if ((kind !== "book" && kind !== "collection" && kind !== "chapter") || !id) continue;
    if (counts[kind] >= 20) continue;
    counts[kind] += 1;
    const bookNumber = meta["book_number"];
    const chapterNumber = meta["chapter_number"];
    hits.push({
      kind,
      id,
      ...(bookNumber ? { bookNumber: Number(bookNumber) } : {}),
      ...(kind === "chapter"
        ? { chapterNumber: chapterNumber != null ? Number(chapterNumber) : null }
        : {}),
      title_ar: meta["title_ar"] ?? null,
      title_en: meta["title_en"] ?? null,
    });
    if (counts.book >= 20 && counts.collection >= 20 && counts.chapter >= 20) break;
  }
  return hits;
}

export async function searchHeadings(query: string): Promise<HeadingHit[]> {
  if (query.trim().length < 2) return [];
  return pagefindSearchHeadings(query);
}

/**
 * Legacy heading-search fallback for when the pagefind index is unavailable
 * (vite dev, SSR). Book titles always match; collection and chapter titles
 * only match within books whose chapters file is already cached in this
 * session (loading all 66 files per keystroke is too heavy).
 */
async function legacySearchHeadings(query: string): Promise<HeadingHit[]> {
  const raw = query.trim();
  const term = raw.toLowerCase();

  const hits: HeadingHit[] = [];
  const books = await loadBooks();
  for (const b of books) {
    if (titleMatches(b.title_ar, term) || titleMatches(b.title_en, term)) {
      hits.push({
        kind: "book",
        id: b.id,
        bookNumber: b.book_number,
        title_ar: b.title_ar,
        title_en: b.title_en,
      });
      if (hits.filter((h) => h.kind === "book").length >= 20) break;
    }
  }

  let collectionCount = 0;
  let chapterCount = 0;
  for (const cached of bookChaptersCache.values()) {
    if (collectionCount >= 20 && chapterCount >= 20) break;
    let file: BookChaptersFile;
    try {
      file = await cached;
    } catch {
      continue;
    }
    if (collectionCount < 20) {
      for (const c of file.collections) {
        if (titleMatches(c.title_ar, term) || titleMatches(c.title_en, term)) {
          hits.push({ kind: "collection", id: c.id, title_ar: c.title_ar, title_en: c.title_en });
          collectionCount += 1;
          if (collectionCount >= 20) break;
        }
      }
    }
    if (chapterCount < 20) {
      for (const c of file.chapters) {
        if (titleMatches(c.title_ar, term) || titleMatches(c.title_en, term)) {
          hits.push({
            kind: "chapter",
            id: c.id,
            chapterNumber: c.chapter_number,
            title_ar: c.title_ar,
            title_en: c.title_en,
          });
          chapterCount += 1;
          if (chapterCount >= 20) break;
        }
      }
    }
  }
  return hits;
}

export async function fetchLibraryStats() {
  const stats = await loadStats();
  return {
    books: stats.books,
    hadiths: stats.hadiths,
    documents: stats.documents,
  };
}
