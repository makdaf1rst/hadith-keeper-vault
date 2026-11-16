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
    const response = await fetch(
      `/content/bengali/book-${bookNumber}/hadiths.json?v=${Date.now()}`,
      {
        cache: "no-store",
      },
    );
    if (response.status === 404) return {};
    if (!response.ok) {
      throw new Error(
        `Failed to load Bengali translations for book ${bookNumber}: ${response.status}`,
      );
    }

    const translations = (await response.json()) as BengaliTranslationFile;

    // Reviewed QC corrections are kept as small per-book overlays so fixes can
    // ship safely without rewriting the multi-megabyte source translation files.
    try {
      const overridesResponse = await fetch(
        `/content/bengali/book-${bookNumber}/qc-overrides.json?v=${Date.now()}`,
        { cache: "no-store" },
      );
      if (overridesResponse.ok) {
        const overrides = (await overridesResponse.json()) as BengaliTranslationFile;
        return { ...translations, ...overrides };
      }
    } catch {
      // Fall back to the base translation file if the optional overlay is unavailable.
    }

    return translations;
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
  const translation = translations[String(hadithNumber)] ?? null;
  if (hadithNumber === 6380 && translation) {
    const clarificationBn = "(ব্যাখ্যা: এই হাদীসের সঙ্গে ৬৩৭২ নম্বর হাদীসের কোনো বিরোধ নেই, যেখানে নবী ﷺ বলেছেন, “ইহুদীরা মিথ্যা বলেছে।” পার্থক্যটি দুটি আরবি বাক্যাংশ ও সেগুলোর উদ্দেশ্য থেকে বোঝা যায়। ইহুদীরা আযলকে বলত “আল-মাওঊদাতুস সুগরা” (الْمَوْءُودَة الصُّغْرَى), অর্থাৎ “জীবন্ত কবর দেওয়া কন্যাশিশুর ছোট রূপ”। আরবি ‘মাওঊদাহ’ বলতে জীবন্ত কবর দেওয়া কন্যাশিশুকে বোঝায়; তাদের কথায় আযলকে যেন প্রকৃত সন্তান হত্যার একটি ছোট ধরন বলা হয়েছিল। অন্যদিকে নবী ﷺ একে বলেছেন “আল-ওয়াদুল খাফী” (الْوَأْد الْخَفِي), অর্থাৎ “গোপন সন্তান হত্যা”। এখানে কথাটি তুলনামূলক অর্থে বলা হয়েছে: আযলকারী গর্ভধারণ এড়াতে চায়, কিন্তু কোনো বিদ্যমান শিশুকে হত্যা করে না। ইবনুল কাইয়্যিম ব্যাখ্যা করেছেন, নবী ﷺ ইহুদীদের এই ধারণা প্রত্যাখ্যান করেছেন যে আযল করলে সন্তান সৃষ্টি অবশ্যই রোধ হয় অথবা তা সন্তান হত্যার সমতুল্য; কারণ আল্লাহ যাকে সৃষ্টি করতে চান, তাকে কেউ বাধা দিতে পারে না। প্রকৃত সন্তান হত্যা হলো বিদ্যমান শিশুকে হত্যা করা; আর আযল হলো গর্ভধারণ এড়ানোর চেষ্টা। এই পার্থক্য বাক্যাংশ দুটির প্রসঙ্গ ও উদ্দেশ্যে, ‘ওয়াদ’ শব্দটি নিজে শুধু ইচ্ছা বোঝায়—এমন নয়। তাই এই তুলনা থেকেই আযলকে সন্তান হত্যার মতো হারাম বলা যায় না। তথ্যসূত্র: ইবনু হাজার, ফাতহুল বারী (৯/২৭১), ইবনুল কাইয়্যিমের ব্যাখ্যা উদ্ধৃত; ইবনুল কাইয়্যিম, যাদুল মা‘আদ (৫/১৩১–১৩২)।)";
    return { ...translation, text: translation.text.includes(clarificationBn) ? translation.text : `${translation.text}\n${clarificationBn}` };
  }
  return translation;
}

async function loadChapterTranslations(bookNumber: number): Promise<BengaliStructureFile> {
  try {
    const response = await fetch(
      `/content/bengali/book-${bookNumber}/chapters.json?v=${Date.now()}`,
      {
        cache: "no-store",
      },
    );
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
  sortOrder?: number,
  chapterNumber?: number | null,
): Promise<BengaliChapterTranslation | null> {
  const translations = await loadChapterTranslations(bookNumber);
  return (
    translations.chapters.find((chapter) => chapter.id === chapterId) ??
    translations.chapters.find(
      (chapter) =>
        sortOrder !== undefined &&
        chapter.sort_order === sortOrder &&
        (chapterNumber == null || chapter.chapter_number === chapterNumber),
    ) ??
    null
  );
}

export async function fetchBengaliCollectionTranslation(
  bookNumber: number,
  collectionId: string,
  sortOrder?: number,
): Promise<BengaliCollectionTranslation | null> {
  const translations = await loadChapterTranslations(bookNumber);
  return (
    translations.collections.find((collection) => collection.id === collectionId) ??
    translations.collections.find(
      (collection) => sortOrder !== undefined && collection.sort_order === sortOrder,
    ) ??
    null
  );
}

/** All Bengali hadith translations for one book, read fresh (used by downloads). */
export async function fetchBengaliBookTranslations(
  bookNumber: number,
): Promise<Record<string, BengaliHadithTranslation>> {
  return loadBookTranslations(bookNumber);
}
