import { fetchBengaliBookTranslations } from "@/lib/bengali-translations";
import {
  fetchBookHadiths,
  fetchBooks,
  fetchHadithByNumber,
  type HadithFull,
  type SearchResult,
} from "@/lib/library-api";
import { containsArabic, normalizeArabic, normalizeEnglish } from "@/lib/normalize";

/**
 * Optional advanced-search refinements. Everything here only READS existing
 * static content; nothing is written or altered.
 */
export type GradeFilter = "any" | "agreed" | "sahih" | "hasan";
export type AdvancedResult = SearchResult & { bengali_text?: string | null };

export type AdvancedOptions = {
  from: number | null;
  to: number | null;
  grade: GradeFilter;
  exact: boolean;
  phrase: string;
  language: "all" | "ar" | "en";
};

const GRADE_PATTERNS: Record<Exclude<GradeFilter, "any">, RegExp[]> = {
  agreed: [/^\s*agreed upon\b/im, /^\s*متفق عليه/m],
  sahih: [/^\s*sa[hḥ][iī][hḥ]\b/im, /^\s*صحيح/m],
  hasan: [/^\s*[hḥ]asan\b/im, /^\s*حسن/m],
};

/** Grade as already written on its own line in the stored text (e.g. "Sahih: Narrated by…"). */
export function hasGrade(hadith: HadithFull, grade: GradeFilter) {
  if (grade === "any") return true;
  const haystack = [
    hadith.full_display_content ?? hadith.full_source_content,
    hadith.english_display ?? hadith.english_source,
    hadith.arabic_display ?? hadith.arabic_source,
  ]
    .filter(Boolean)
    .join("\n");
  return GRADE_PATTERNS[grade].some((pattern) => pattern.test(haystack));
}

export function containsExactPhrase(
  hadith: HadithFull,
  phrase: string,
  language: "all" | "ar" | "en",
) {
  const raw = phrase.trim();
  if (!raw) return true;
  if (containsArabic(raw)) {
    if (language === "en") return false;
    const needle = normalizeArabic(raw);
    const hay = normalizeArabic(
      `${hadith.arabic_display ?? ""} ${hadith.full_display_content ?? ""} ${hadith.full_source_content ?? ""}`,
    );
    return !!needle && hay.includes(needle);
  }
  if (language === "ar") return false;
  const needle = normalizeEnglish(raw);
  const hay = normalizeEnglish(
    `${hadith.english_display ?? ""} ${hadith.full_display_content ?? ""}`,
  );
  return !!needle && ` ${hay} `.includes(` ${needle} `);
}

function inRange(n: number, from: number | null, to: number | null) {
  return (from == null || n >= from) && (to == null || n <= to);
}

export async function refineResults(
  results: AdvancedResult[],
  options: AdvancedOptions,
): Promise<AdvancedResult[]> {
  const needsText = options.grade !== "any" || (options.exact && options.phrase.trim());
  const out: AdvancedResult[] = [];
  for (const result of results) {
    if (!inRange(result.hadith_number, options.from, options.to)) continue;
    if (needsText) {
      const hadith = await fetchHadithByNumber(result.hadith_number);
      if (!hadith) continue;
      if (!hasGrade(hadith, options.grade)) continue;
      if (options.exact && !result.bengali_text) {
        if (!containsExactPhrase(hadith, options.phrase, options.language)) continue;
      }
    }
    out.push(result);
  }
  return out;
}

function toResult(h: HadithFull): AdvancedResult {
  return {
    id: h.id,
    hadith_number: h.hadith_number,
    book_id: h.book_id,
    collection_id: h.collection_id,
    chapter_id: h.chapter_id,
    arabic_display: h.arabic_display,
    english_display: h.english_display,
  };
}

export const RANGE_LIMIT = 200;

/** Lists existing hadiths inside a number range (capped), optionally within a Kitāb/Collection/Bāb. */
export async function hadithsInRange(
  from: number,
  to: number,
  scope: { bookId: string | null; collectionId: string | null; chapterId: string | null },
): Promise<AdvancedResult[]> {
  const out: AdvancedResult[] = [];
  const end = Math.min(to, from + RANGE_LIMIT - 1);
  for (let n = from; n <= end; n += 1) {
    const h = await fetchHadithByNumber(n);
    if (!h) continue;
    if (scope.bookId && h.book_id !== scope.bookId) continue;
    if (scope.collectionId && h.collection_id !== scope.collectionId) continue;
    if (scope.chapterId && h.chapter_id !== scope.chapterId) continue;
    out.push(toResult(h));
  }
  return out;
}

function normalizeBengali(value: string) {
  return value.normalize("NFC").toLowerCase().replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim();
}

/** Searches the existing Bengali translation file of one Kitāb. */
export async function searchBengaliInBook(
  bookId: string,
  query: string,
  exact: boolean,
  scope: { collectionId: string | null; chapterId: string | null },
): Promise<AdvancedResult[]> {
  const books = await fetchBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return [];
  const needle = normalizeBengali(query);
  if (!needle) return [];
  const words = needle.split(" ");
  const [translations, hadiths] = await Promise.all([
    fetchBengaliBookTranslations(book.book_number),
    fetchBookHadiths(bookId),
  ]);
  const out: AdvancedResult[] = [];
  for (const h of hadiths) {
    if (scope.collectionId && h.collection_id !== scope.collectionId) continue;
    if (scope.chapterId && h.chapter_id !== scope.chapterId) continue;
    const text = translations[String(h.hadith_number)]?.text;
    if (!text) continue;
    const hay = normalizeBengali(text);
    const matched = exact ? hay.includes(needle) : words.every((w) => hay.includes(w));
    if (!matched) continue;
    out.push({ ...toResult(h), bengali_text: text });
    if (out.length >= 200) break;
  }
  return out.sort((a, b) => a.hadith_number - b.hadith_number);
}
