"use client";

export type BengaliHadithTranslation = {
  hadith_number: number;
  text: string;
  status?: "draft" | "reviewed" | "approved";
};

type BengaliTranslationFile = Record<string, BengaliHadithTranslation>;

let cache: Promise<BengaliTranslationFile> | null = null;

async function loadTranslations(): Promise<BengaliTranslationFile> {
  cache ??= fetch("/content/bengali/hadiths.json", { cache: "no-store" })
    .then(async (response) => {
      if (response.status === 404) return {};
      if (!response.ok) {
        throw new Error(`Failed to load Bengali translations: ${response.status}`);
      }
      return (await response.json()) as BengaliTranslationFile;
    })
    .catch(() => ({}));
  return cache;
}

/**
 * Bengali translations live in their own additive content file.
 * Existing Arabic/English hadith JSON is never modified or overwritten.
 */
export async function fetchBengaliTranslation(
  hadithNumber: number,
): Promise<BengaliHadithTranslation | null> {
  const translations = await loadTranslations();
  return translations[String(hadithNumber)] ?? null;
}
