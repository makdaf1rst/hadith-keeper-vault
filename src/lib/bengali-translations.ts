"use client";

export type BengaliHadithTranslation = {
  hadith_number: number;
  text: string;
  status?: "draft" | "reviewed" | "approved";
};

export type BengaliStructuralTranslation = {
  id: string;
  book_id: string;
  collection_id?: string | null;
  chapter_number?: number | null;
  title_bn: string | null;
  intro_bn_source: string | null;
  intro_bn_display: string | null;
  sort_order: number;
};

export type BengaliChapterTranslation = BengaliStructuralTranslation;
export type BengaliCollectionTranslation = BengaliStructuralTranslation;

export type BengaliStructureFile = {
  collections: BengaliCollectionTranslation[];
  chapters: BengaliChapterTranslation[];
};

type BengaliTranslationFile = Record<string, BengaliHadithTranslation>;
type HadithIndexEntry = { n: number; b: number };

let indexCache: Promise<Map<number, number>> | null = null;


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
  try {
    const response = await fetch(`/content/bengali/book-${bookNumber}/hadiths.json`, {
      cache: "no-store",
    });
    if (response.status === 404) return {};
    if (!response.ok) {
      throw new Error(
        `Failed to load Bengali translations for book ${bookNumber}: ${response.status}`,
      );
    }
    return (await response.json()) as BengaliTranslationFile;
  } catch {
    return {};
  }
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


async function loadChapterTranslations(bookNumber: number): Promise<BengaliStructureFile> {
  try {
    const response = await fetch(`/content/bengali/book-${bookNumber}/chapters.json`, {
      cache: "no-store",
    });
    if (response.status === 404) return { collections: [], chapters: [] };
    if (!response.ok) {
      throw new Error(
        `Failed to load Bengali structural translations for book ${bookNumber}: ${response.status}`,
      );
    }
    return (await response.json()) as BengaliStructureFile;
  } catch {
    return { collections: [], chapters: [] };
  }
}

export async function fetchBengaliStructure(bookNumber: number): Promise<BengaliStructureFile> {
  return loadChapterTranslations(bookNumber);
}

export async function fetchBengaliChapterTranslation(
  bookNumber: number,
  chapterId: string,
): Promise<BengaliChapterTranslation | null> {
  const translations = await loadChapterTranslations(bookNumber);
  return translations.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export async function fetchBengaliCollectionTranslation(
  bookNumber: number,
  collectionId: string,
): Promise<BengaliCollectionTranslation | null> {
  const translations = await loadChapterTranslations(bookNumber);
  return translations.collections.find((collection) => collection.id === collectionId) ?? null;
}
