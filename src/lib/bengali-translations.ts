"use client";

export type BengaliHadithTranslation = {
  hadith_number: number;
  text: string;
  status?: "draft" | "reviewed" | "approved";
};

type BengaliTranslationFile = Record<string, BengaliHadithTranslation>;
type HadithIndexEntry = { n: number; b: number };

let indexCache: Promise<Map<number, number>> | null = null;
const bookCache = new Map<number, Promise<BengaliTranslationFile>>();

async function loadHadithIndex(): Promise<Map<number, number>> {
  indexCache ??= fetch("/content/hadith-index.json", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load hadith index: ${response.status}`);
      }
      const entries = (await response.json()) as HadithIndexEntry[];
      return new Map(entries.map(({ n, b }) => [n, b]));
    })
    .catch(() => new Map<number, number>());
  return indexCache;
}

async function loadBookTranslations(bookNumber: number): Promise<BengaliTranslationFile> {
  let cached = bookCache.get(bookNumber);
  if (!cached) {
    cached = fetch(`/content/bengali/book-${bookNumber}/hadiths.json`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) return {};
        if (!response.ok) {
          throw new Error(`Failed to load Bengali translations for book ${bookNumber}: ${response.status}`);
        }
        return (await response.json()) as BengaliTranslationFile;
      })
      .catch(() => ({}));
    bookCache.set(bookNumber, cached);
  }
  return cached;
}

/**
 * Bengali translations are stored per book so translation updates stay small.
 * Existing Arabic/English hadith JSON is never modified or overwritten.
 */
export async function fetchBengaliTranslation(
  hadithNumber: number,
): Promise<BengaliHadithTranslation | null> {
  const index = await loadHadithIndex();
  const bookNumber = index.get(hadithNumber);
  if (!bookNumber) return null;

  const translations = await loadBookTranslations(bookNumber);
  return translations[String(hadithNumber)] ?? null;
}
