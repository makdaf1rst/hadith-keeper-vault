"use client";

import { isNative } from "@/lib/native";

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

/** Bundled JSON, or on iOS the newer copy content-refresh downloaded. null = no such file. */
async function loadContentJson(path: string): Promise<unknown | null> {
  if (isNative()) {
    const { readContentOverlay } = await import("@/lib/content-refresh");
    const overlay = await readContentOverlay(path).catch(() => undefined);
    if (overlay !== undefined) return overlay;
  }
  const response = await fetch(`/content/${path}?v=${Date.now()}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to load /content/${path}: ${response.status}`);
  return response.json();
}

async function loadBookTranslations(bookNumber: number): Promise<BengaliTranslationFile> {
  try {
    const translations = (await loadContentJson(
      `bengali/book-${bookNumber}/hadiths.json`,
    )) as BengaliTranslationFile | null;
    if (!translations) return {};

    // Reviewed QC corrections are kept as small per-book overlays so fixes can
    // ship safely without rewriting the multi-megabyte source translation files.
    try {
      const overrides = (await loadContentJson(
        `bengali/book-${bookNumber}/qc-overrides.json`,
      )) as BengaliTranslationFile | null;
      if (overrides) return { ...translations, ...overrides };
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
  // Append the clarification after the untouched original Bengali commentary for Hadith 6379.
  if (hadithNumber === 6379 && translation) {
    const clarificationBn =
      "(ব্যাখ্যা: এই তিনটি পরিস্থিতি প্রাচীন দাসপ্রথার ফিকহী বিধানের সঙ্গে সম্পর্কিত। প্রথম ক্ষেত্রে ‘ক্ষতি’ বলতে মালিকের আর্থিক স্বার্থের বিষয়টি বোঝানো হয়েছে: দাসী তাঁর সন্তানের মা বা ‘উম্মু ওয়ালাদ’ হলে অধিকাংশ ফকীহের মতে তাকে আর বিক্রি করা যেত না। এর অর্থ এই নয় যে ‘উম্মু ওয়ালাদ’ হওয়া নারীর নিজের ক্ষতি। দ্বিতীয় ক্ষেত্রে ক্ষতি বলতে বোঝানো হয়েছে, অন্যের মালিকানাধীন কোনো দাসীকে বিবাহ করলে তাঁর গর্ভজাত সন্তান তৎকালীন বিধান অনুযায়ী সাধারণত মায়ের অনুসরণে দাস হিসেবে গণ্য হতো। তৃতীয় ক্ষেত্রে স্বাধীন স্ত্রীর অনুমতি ছাড়া আযল সম্পর্কে আলেমদের মতভেদ আছে। ইমাম নববী শাফিঈ মাযহাবের দুটি মত উল্লেখ করে বলেছেন, অধিকতর গ্রহণযোগ্য মতে অনুমতি ছাড়া আযল করা হারাম নয়, যদিও মাকরূহ; অন্য ফকীহগণ স্ত্রীর অধিকার বিবেচনায় তাঁর অনুমতি শর্ত করেছেন। তথ্যসূত্র: ইমাম নববী, আল-মিনহাজ শরহ সহীহ মুসলিম, কিতাবুন নিকাহ, বাবু হুকমিল আযল (১০/১০–১২)।)";
    return {
      ...translation,
      text: translation.text.includes(clarificationBn)
        ? translation.text
        : `${translation.text}\n\n${clarificationBn}`,
    };
  }
  if (hadithNumber === 6380 && translation) {
    const clarificationBn =
      "(ব্যাখ্যা: এই হাদীসের সঙ্গে ৬৩৭২ নম্বর হাদীসের কোনো বিরোধ নেই, যেখানে নবী ﷺ বলেছেন, “ইহুদীরা মিথ্যা বলেছে।” পার্থক্যটি দুটি আরবি বাক্যাংশ ও সেগুলোর উদ্দেশ্য থেকে বোঝা যায়। ইহুদীরা আযলকে বলত “আল-মাওঊদাতুস সুগরা” (الْمَوْءُودَة الصُّغْرَى), অর্থাৎ “জীবন্ত কবর দেওয়া কন্যাশিশুর ছোট রূপ”। আরবি ‘মাওঊদাহ’ বলতে জীবন্ত কবর দেওয়া কন্যাশিশুকে বোঝায়; তাদের কথায় আযলকে যেন প্রকৃত সন্তান হত্যার একটি ছোট ধরন বলা হয়েছিল। অন্যদিকে নবী ﷺ একে বলেছেন “আল-ওয়াদুল খাফী” (الْوَأْد الْخَفِي), অর্থাৎ “গোপন সন্তান হত্যা”। এখানে কথাটি তুলনামূলক অর্থে বলা হয়েছে: আযলকারী গর্ভধারণ এড়াতে চায়, কিন্তু কোনো বিদ্যমান শিশুকে হত্যা করে না। ইবনুল কাইয়্যিম ব্যাখ্যা করেছেন, নবী ﷺ ইহুদীদের এই ধারণা প্রত্যাখ্যান করেছেন যে আযল করলে সন্তান সৃষ্টি অবশ্যই রোধ হয় অথবা তা সন্তান হত্যার সমতুল্য; কারণ আল্লাহ যাকে সৃষ্টি করতে চান, তাকে কেউ বাধা দিতে পারে না। প্রকৃত সন্তান হত্যা হলো বিদ্যমান শিশুকে হত্যা করা; আর আযল হলো গর্ভধারণ এড়ানোর চেষ্টা। এই পার্থক্য বাক্যাংশ দুটির প্রসঙ্গ ও উদ্দেশ্যে, ‘ওয়াদ’ শব্দটি নিজে শুধু ইচ্ছা বোঝায়—এমন নয়। তাই এই তুলনা থেকেই আযলকে সন্তান হত্যার মতো হারাম বলা যায় না। তথ্যসূত্র: ইবনু হাজার, ফাতহুল বারী (৯/২৭১), ইবনুল কাইয়্যিমের ব্যাখ্যা উদ্ধৃত; ইবনুল কাইয়্যিম, যাদুল মা‘আদ (৫/১৩১–১৩২)।)";
    return {
      ...translation,
      text: translation.text.includes(clarificationBn)
        ? translation.text
        : `${translation.text}\n${clarificationBn}`,
    };
  }
  return translation;
}

async function loadChapterTranslations(bookNumber: number): Promise<BengaliStructureFile> {
  try {
    const file = (await loadContentJson(
      `bengali/book-${bookNumber}/chapters.json`,
    )) as BengaliStructureFile | null;
    return file ?? { collections: [], chapters: [] };
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
