// Deployment sync marker: hadith share, error-report, and 16273 correction
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { BookmarkButton } from "@/components/library/BookmarkButton";
import { Button } from "@/components/ui/button";
import { fetchBengaliStructure, fetchBengaliTranslation } from "@/lib/bengali-translations";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import type { Book, Chapter, Collection, HadithFull } from "@/lib/library-api";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { toArabicIndicDigits, toBengaliDigits } from "@/lib/normalize";
import { useReaderSettings } from "@/lib/reader-settings";

type Props = {
  hadith: HadithFull;
  context?:
    { book: Book | null; collection: Collection | null; chapter: Chapter | null } | undefined;
  showExactSource?: boolean | undefined;
};

function text(display: string | null, source: string | null) {
  const value = display ?? source;
  return value && value.trim().length > 0 ? value : null;
}

/**
 * Bengali UI labels and digits follow the selected content language.
 * The stored "full" record begins with the Arabic and English texts and then continues
 * with grading, references and commentary. Strip the parts that are already rendered
 * above so nothing is shown twice, while keeping any remaining material in full.
 */
function remainder(full: string | null, parts: (string | null)[]) {
  if (!full) return null;
  let rest = full;
  for (const part of parts) {
    if (!part) continue;
    const at = rest.indexOf(part.trim());
    if (at !== -1) {
      rest = (rest.slice(0, at) + "\n" + rest.slice(at + part.trim().length)).trim();
    }
  }
  return rest.trim().length > 0 ? rest.trim() : null;
}

async function shareHadith(hadithNumber: number, isBengali: boolean) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `Hadith ${hadithNumber} — Al-Jāmiʿ al-Kāmil`;
  const text = isBengali
    ? `আল-জামিʿ আল-কামিল থেকে হাদিস ${toBengaliDigits(hadithNumber)}`
    : `Hadith ${hadithNumber} from Al-Jāmiʿ al-Kāmil`;

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(isBengali ? "হাদিসের লিংক কপি হয়েছে।" : "Hadith link copied.");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(isBengali ? "হাদিসের লিংক কপি হয়েছে।" : "Hadith link copied.");
    } catch {
      toast.error(isBengali ? "শেয়ার করা যায়নি।" : "Sharing failed.");
    }
  }
}

function reportIssue(hadithNumber: number, isBengali: boolean) {
  if (typeof window === "undefined") return;

  const subject = isBengali
    ? `হাদিস ${toBengaliDigits(hadithNumber)} — সংশোধন / ত্রুটি প্রতিবেদন`
    : `Hadith ${hadithNumber} — Correction / Error Report`;

  const body = isBengali
    ? [
        `আসসালামু আলাইকুম,`,
        ``,
        `আমি হাদিস ${toBengaliDigits(hadithNumber)}-এ একটি সম্ভাব্য ভুল বা সংশোধনযোগ্য বিষয় পেয়েছি।`,
        ``,
        `হাদিসের লিংক: ${window.location.href}`,
        ``,
        `সমস্যার ধরন (যেমন: আরবি, বাংলা অনুবাদ, ইংরেজি অনুবাদ, রেফারেন্স, গ্রেড, প্রদর্শন):`,
        ``,
        `সমস্যার বিস্তারিত:`,
        ``,
        `সম্ভব হলে স্ক্রিনশট সংযুক্ত করুন।`,
      ].join("\n")
    : [
        `Assalamu alaikum,`,
        ``,
        `I found a possible error or correction needed in Hadith ${hadithNumber}.`,
        ``,
        `Hadith link: ${window.location.href}`,
        ``,
        `Type of issue (for example: Arabic, English/Bengali translation, reference, grade, or display):`,
        ``,
        `Details of the issue:`,
        ``,
        `Please attach a screenshot if possible.`,
      ].join("\n");

  window.location.href = `mailto:Aljamiushshamil@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function copy(value: string | null, label: string) {
  if (!value) {
    toast.error(`No ${label} text stored for this hadith.`);
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied in full.`);
  } catch {
    toast.error("Copying failed in this browser.");
  }
}

export function HadithView({ hadith, context, showExactSource = false }: Props) {
  const { contentLanguage } = useLanguage();
  const isBengali = contentLanguage === "bn";
  const t = useInterfaceText();
  const [readerSettings] = useReaderSettings();
  const bengali = useQuery({
    queryKey: ["bengali-hadith", hadith.hadith_number],
    queryFn: () => fetchBengaliTranslation(hadith.hadith_number),
    enabled: contentLanguage === "bn",
  });
  const bengaliStructure = useQuery({
    queryKey: ["bengali-structure", context?.book?.book_number],
    queryFn: () => fetchBengaliStructure(context!.book!.book_number),
    enabled: contentLanguage === "bn" && !!context?.book?.book_number,
  });
  const bengaliCollection = context?.collection
    ? (bengaliStructure.data?.collections.find((item) => item.id === context.collection?.id) ??
      bengaliStructure.data?.collections.find(
        (item) => item.sort_order === context.collection?.sort_order,
      ))
    : null;
  const bengaliChapter = context?.chapter
    ? (bengaliStructure.data?.chapters.find((item) => item.id === context.chapter?.id) ??
      bengaliStructure.data?.chapters.find(
        (item) =>
          item.sort_order === context.chapter?.sort_order &&
          (context.chapter?.chapter_number == null ||
            item.chapter_number === context.chapter.chapter_number),
      ))
    : null;

  const arabic = showExactSource
    ? hadith.arabic_source
    : text(hadith.arabic_display, hadith.arabic_source);
  const englishRaw = showExactSource
    ? hadith.english_source
    : text(hadith.english_display, hadith.english_source);
  const fullRaw = showExactSource
    ? hadith.full_source_content
    : text(hadith.full_display_content, hadith.full_source_content);
  const correctHadith16273 = (value: string | null) =>
    hadith.hadith_number === 16273 && value
      ? value.replace(
          "Yes. By the One in whose hand is my soul,",
          "No. By the One in whose hand is my soul,",
        )
      : value;
  const english = correctHadith16273(englishRaw);
  const full = correctHadith16273(fullRaw);
  const extra = remainder(full, [arabic, english]);
  const selectedTranslation = contentLanguage === "bn" ? (bengali.data?.text ?? null) : english;
  const displayedTranslation =
    contentLanguage === "bn" && selectedTranslation
      ? toBengaliDigits(selectedTranslation)
      : selectedTranslation;

  const whole =
    contentLanguage === "bn"
      ? [arabic, selectedTranslation, extra].filter(Boolean).join("\n\n")
      : (full ?? [arabic, english, extra].filter(Boolean).join("\n\n"));

  return (
    <article className="rounded-lg border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-parchment px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight text-primary">
            {t.hadith} {isBengali ? toBengaliDigits(hadith.hadith_number) : hadith.hadith_number}
          </span>
          <span className="arabic-text text-xl! leading-none! text-muted-foreground">
            {toArabicIndicDigits(hadith.hadith_number)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookmarkButton
            number={hadith.hadith_number}
            bookTitle={
              context?.book
                ? formatBookTitle(context.book.book_number, context.book.title_en)
                : null
            }
            collectionTitle={context?.collection?.title_en ?? null}
            chapterTitle={
              context?.chapter
                ? formatChapterTitle(context.chapter.chapter_number, context.chapter.title_en)
                : null
            }
          />
          <Button variant="outline" size="sm" onClick={() => copy(arabic, t.arabic)}>
            <Copy /> {t.arabic}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copy(selectedTranslation, contentLanguage === "bn" ? t.bengali : t.english)
            }
          >
            <Copy /> {contentLanguage === "bn" ? t.bengali : t.english}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(whole, t.fullEntry)}>
            <Copy /> {t.fullEntry}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void shareHadith(hadith.hadith_number, isBengali)}
          >
            <Share2 />
            {isBengali ? "শেয়ার" : "Share"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reportIssue(hadith.hadith_number, isBengali)}
          >
            <CircleAlert />
            {isBengali ? "ত্রুটি জানান" : "Report error"}
          </Button>
        </div>
      </header>

      {context ? (
        <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
          <BreadcrumbLine
            label={isBengali ? "কিতাব" : "Book"}
            ar={context.book?.title_ar}
            en={
              context.book
                ? contentLanguage === "bn"
                  ? toBengaliDigits(
                      getBengaliBookTitle(context.book.book_number) ??
                        formatBookTitle(context.book.book_number, context.book.title_en),
                    )
                  : formatBookTitle(context.book.book_number, context.book.title_en)
                : null
            }
          />
          <BreadcrumbLine
            label={isBengali ? "সংগ্রহ" : "Collection"}
            ar={context.collection?.title_ar}
            en={
              contentLanguage === "bn"
                ? toBengaliDigits(
                    bengaliCollection?.title_bn ?? context.collection?.title_en ?? "",
                  ) || null
                : context.collection?.title_en
            }
          />
          <BreadcrumbLine
            label={isBengali ? "অধ্যায়" : "Chapter"}
            ar={context.chapter?.title_ar}
            en={
              contentLanguage === "bn"
                ? toBengaliDigits(
                    bengaliChapter?.title_bn ??
                      (context.chapter
                        ? formatChapterTitle(
                            context.chapter.chapter_number,
                            context.chapter.title_en,
                          )
                        : ""),
                  ) || null
                : context.chapter
                  ? formatChapterTitle(context.chapter.chapter_number, context.chapter.title_en)
                  : null
            }
          />
        </div>
      ) : null}

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {arabic ? (
          <p
            className="arabic-text text-foreground"
            style={{ fontSize: `calc(1em * ${readerSettings.arabicScale})` }}
          >
            {arabic}
          </p>
        ) : null}
        {arabic && (selectedTranslation || contentLanguage === "bn") ? (
          <hr className="border-border" />
        ) : null}
        {contentLanguage === "bn" ? (
          bengali.isLoading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : displayedTranslation ? (
            <div
              lang="bn"
              className="text-foreground leading-8"
              style={{ fontSize: `calc(1em * ${readerSettings.translationScale})` }}
            >
              {displayedTranslation}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {t.noBengaliTranslation}
            </div>
          )
        ) : english ? (
          <div
            className="english-text text-foreground"
            style={{ fontSize: `calc(1em * ${readerSettings.translationScale})` }}
          >
            {english}
          </div>
        ) : null}
        {extra ? (
          <>
            <hr className="border-border" />
            <div
              className="english-text text-foreground"
              style={{ fontSize: `calc(1em * ${readerSettings.translationScale})` }}
            >
              {extra}
            </div>
          </>
        ) : null}
        {!arabic && !selectedTranslation && !english && !extra ? (
          <p className="text-sm text-destructive">
            No content is stored for this hadith number yet.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function BreadcrumbLine({
  label,
  ar,
  en,
}: {
  label: string;
  ar?: string | null | undefined;
  en?: string | null | undefined;
}) {
  if (!ar && !en) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-0.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {en ? <span className="text-foreground">{en}</span> : null}
      {ar ? (
        <span className="arabic-text text-base! leading-normal! text-foreground">{ar}</span>
      ) : null}
    </div>
  );
}
