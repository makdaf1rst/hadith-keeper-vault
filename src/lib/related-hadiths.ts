import { fetchBookHadiths, type HadithFull } from "@/lib/library-api";

/**
 * Structural "related" hadiths — derived ONLY from the existing hierarchy:
 * same Bāb first, then the same Collection, then nearby hadiths in the same Kitāb.
 * No semantic matching and no outside sources. Read-only.
 */
export type RelatedSource = "bab" | "collection" | "kitab";
export type RelatedHadith = { hadith: HadithFull; source: RelatedSource };

export async function fetchRelatedHadiths(hadith: HadithFull, limit = 5): Promise<RelatedHadith[]> {
  if (!hadith.book_id) return [];
  const all = await fetchBookHadiths(hadith.book_id);
  const others = all.filter((item) => item.hadith_number !== hadith.hadith_number);
  const distance = (item: HadithFull) => Math.abs(item.hadith_number - hadith.hadith_number);
  const picked: RelatedHadith[] = [];

  const add = (list: HadithFull[], source: RelatedSource) => {
    for (const item of [...list].sort((a, b) => distance(a) - distance(b))) {
      if (picked.length >= limit) return;
      if (picked.some((p) => p.hadith.hadith_number === item.hadith_number)) continue;
      picked.push({ hadith: item, source });
    }
  };

  if (hadith.chapter_id) add(others.filter((h) => h.chapter_id === hadith.chapter_id), "bab");
  if (hadith.collection_id) {
    add(others.filter((h) => h.collection_id === hadith.collection_id), "collection");
  }
  add(others, "kitab");

  return picked.sort((a, b) => a.hadith.hadith_number - b.hadith.hadith_number);
}

/** Short preview of existing text; strips only the leading "7297 — " display number. */
export function snippet(value: string | null | undefined, length = 160) {
  if (!value) return null;
  const flat = value
    .replace(/\s+/g, " ")
    .replace(/^[\d٠-٩০-৯]+\s*[—–-]\s*/, "")
    .trim();
  return flat.length > length ? `${flat.slice(0, length)} …` : flat;
}
