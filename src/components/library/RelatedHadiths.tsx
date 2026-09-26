import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { fetchBengaliBookTranslations } from "@/lib/bengali-translations";
import type { HadithFull } from "@/lib/library-api";
import { useLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";
import { fetchRelatedHadiths, snippet, type RelatedSource } from "@/lib/related-hadiths";

export function RelatedHadiths({
  hadith,
  bookNumber,
}: {
  hadith: HadithFull;
  bookNumber: number | null;
}) {
  const { contentLanguage, interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const related = useQuery({
    queryKey: ["related-hadiths", hadith.hadith_number],
    queryFn: () => fetchRelatedHadiths(hadith),
  });
  const bengali = useQuery({
    queryKey: ["bengali-book-translations", bookNumber],
    queryFn: () => fetchBengaliBookTranslations(bookNumber!),
    enabled: contentLanguage === "bn" && bookNumber != null,
    staleTime: 5 * 60 * 1000,
  });

  if (!related.data?.length) return null;

  const sourceLabel = (source: RelatedSource) =>
    source === "bab"
      ? bn ? "একই বাব" : "Same Bāb"
      : source === "collection"
        ? bn ? "একই সংগ্রহ" : "Same Collection"
        : bn ? "একই কিতাব" : "Same Kitāb";

  return (
    <section aria-labelledby="related-hadiths" className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <h2 id="related-hadiths" className="text-base font-semibold text-foreground">
        {bn ? "সম্পর্কিত হাদিস" : "Related Hadiths"}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {bn
          ? "গ্রন্থের বিন্যাস অনুযায়ী নিকটবর্তী হাদিস (একই বাব, সংগ্রহ বা কিতাব) — অর্থগত সাদৃশ্যের দাবি নয়।"
          : "Nearby hadiths by position in the book (same Bāb, Collection or Kitāb) — not a claim of identical meaning."}
      </p>
      <ul className="mt-3 space-y-2">
        {related.data.map(({ hadith: item, source }) => {
          const text =
            contentLanguage === "bn"
              ? snippet(bengali.data?.[String(item.hadith_number)]?.text) ??
                snippet(item.arabic_display ?? item.arabic_source)
              : snippet(item.english_display ?? item.english_source) ??
                snippet(item.arabic_display ?? item.arabic_source);
          return (
            <li key={item.id}>
              <Link
                to="/hadith/$number"
                params={{ number: String(item.hadith_number) }}
                className="block rounded-md border border-border bg-background px-3 py-2 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-primary">
                    {bn ? "হাদিস" : "Hadith"}{" "}
                    {bn ? toBengaliDigits(item.hadith_number) : item.hadith_number}
                  </span>
                  <span className="text-xs text-muted-foreground">{sourceLabel(source)}</span>
                </span>
                {text ? (
                  <span className="mt-1 block text-sm text-muted-foreground" dir="auto">
                    {text}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
