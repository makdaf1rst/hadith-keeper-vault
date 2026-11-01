// Production rebuild marker: reader controls
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ReaderControls } from "@/components/library/ReaderControls";
import { ReaderSubBar, subBarBack, subBarPill } from "@/components/library/ReaderSubBar";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { fetchBengaliStructure } from "@/lib/bengali-translations";
import { HadithView } from "@/components/library/HadithView";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  fetchHadithByNumber,
  fetchHadithContext,
  fetchNeighbours,
  type ReadingTarget,
} from "@/lib/library-api";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import { recordHistory } from "@/lib/reading-history";
import { useReaderSettings } from "@/lib/reader-settings";
import {
  makeBreadcrumbList,
  SITE_ORIGIN,
  sourceExcerpt,
  WORK_AUTHOR,
  WORK_NAME,
  WORK_TRANSLATOR,
} from "@/lib/seo";

// ponytail: hardcoded total for the progress line; read library-stats if the count changes
const TOTAL_HADITHS = 16546;

function ReadingLink({
  target,
  children,
  className,
}: {
  target: ReadingTarget;
  children: ReactNode;
  className?: string;
}) {
  return target.kind === "hadith" ? (
    <Link to="/hadith/$number" params={{ number: String(target.number) }} className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/chapter/$id" params={{ id: target.id }} className={className}>
      {children}
    </Link>
  );
}

function targetLabel(target: ReadingTarget, isBengali: boolean, chapterLabel: string) {
  if (target.kind === "hadith") {
    return isBengali ? toBengaliDigits(target.number) : target.number;
  }

  if (target.isIntroduction) {
    return isBengali ? "ভূমিকা" : "Introduction";
  }

  if (target.chapterNumber != null) {
    return `${chapterLabel} ${isBengali ? toBengaliDigits(target.chapterNumber) : target.chapterNumber}`;
  }

  return chapterLabel;
}

export const Route = createFileRoute("/hadith/$number")({
  loader: async ({ params }) => {
    const hadithNumber = Number(params.number);
    if (!Number.isSafeInteger(hadithNumber) || hadithNumber < 1) throw notFound();

    const hadith = await fetchHadithByNumber(hadithNumber);
    if (!hadith) throw notFound();

    const context = await fetchHadithContext(hadith);
    return { hadith, context };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { hadith, context } = loaderData;
    const canonical = `${SITE_ORIGIN}/hadith/${hadith.hadith_number}`;
    const bookTitle = context.book
      ? formatBookTitle(context.book.book_number, context.book.title_en)
      : WORK_NAME;
    const chapterTitle = context.chapter
      ? formatChapterTitle(context.chapter.chapter_number, context.chapter.title_en)
      : null;
    const title = [`Hadith ${hadith.hadith_number}`, chapterTitle, bookTitle, "Al-Jāmiʿ al-Kāmil"]
      .filter(Boolean)
      .join(" — ");
    const description =
      sourceExcerpt(hadith.english_display) ||
      `Hadith ${hadith.hadith_number} in Arabic and English from ${WORK_NAME}.`;
    const breadcrumbs = [
      { name: "Home", url: `${SITE_ORIGIN}/` },
      ...(context.book
        ? [
            {
              name: bookTitle,
              url: `${SITE_ORIGIN}/book/${context.book.book_number}`,
            },
          ]
        : []),
      ...(context.chapter
        ? [
            {
              name: chapterTitle ?? "Chapter",
              url: `${SITE_ORIGIN}/chapter/${encodeURIComponent(context.chapter.id)}`,
            },
          ]
        : []),
      { name: `Hadith ${hadith.hadith_number}`, url: canonical },
    ];

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": ["CreativeWork", "Article"],
                name: `Hadith ${hadith.hadith_number}`,
                headline: title,
                url: canonical,
                inLanguage: ["ar", "en"],
                isPartOf: {
                  "@type": "Book",
                  name: WORK_NAME,
                  author: { "@type": "Person", name: WORK_AUTHOR },
                  translator: { "@type": "Person", name: WORK_TRANSLATOR },
                  inLanguage: ["ar", "en"],
                  url: `${SITE_ORIGIN}/`,
                },
              },
              makeBreadcrumbList(breadcrumbs),
            ],
          }),
        },
      ],
    };
  },
  component: HadithPage,
});

function HadithPage() {
  const { number } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const t = useInterfaceText();
  const { interfaceLanguage, contentLanguage, setInterfaceLanguage, setContentLanguage } =
    useLanguage();
  const isBengali = contentLanguage === "bn";
  const [readerSettings, updateReaderSettings] = useReaderSettings();
  const hadithNumber = Number(number);

  const hadith = useQuery({
    queryKey: ["hadith", hadithNumber],
    queryFn: () => fetchHadithByNumber(hadithNumber),
    enabled: Number.isFinite(hadithNumber),
    initialData: loaderData.hadith,
  });

  const context = useQuery({
    queryKey: ["hadith-context", hadith.data?.id],
    queryFn: () => fetchHadithContext(hadith.data!),
    enabled: !!hadith.data,
    initialData: loaderData.context,
  });

  const neighbours = useQuery({
    queryKey: ["hadith-neighbours", hadithNumber],
    queryFn: () => fetchNeighbours(hadithNumber),
    enabled: typeof window !== "undefined" && Number.isFinite(hadithNumber),
  });

  const bengaliStructure = useQuery({
    queryKey: ["bengali-structure", context.data?.book?.book_number],
    queryFn: () => fetchBengaliStructure(context.data!.book!.book_number),
    enabled:
      typeof window !== "undefined" &&
      contentLanguage === "bn" &&
      !!context.data?.book?.book_number,
  });
  const bengaliChapter = context.data?.chapter
    ? (bengaliStructure.data?.chapters.find((item) => item.id === context.data?.chapter?.id) ??
      bengaliStructure.data?.chapters.find(
        (item) =>
          item.sort_order === context.data?.chapter?.sort_order &&
          (context.data?.chapter?.chapter_number == null ||
            item.chapter_number === context.data.chapter.chapter_number),
      ))
    : null;

  useEffect(() => {
    if (!hadith.data) return;

    recordHistory({
      number: hadith.data.hadith_number,
      bookTitle: context.data?.book
        ? formatBookTitle(context.data.book.book_number, context.data.book.title_en)
        : null,
      collectionTitle: context.data?.collection?.title_en ?? null,
      chapterTitle: context.data?.chapter
        ? formatChapterTitle(context.data.chapter.chapter_number, context.data.chapter.title_en)
        : null,
    });
  }, [hadith.data, context.data]);

  const book = context.data?.book;
  const num = isBengali ? toBengaliDigits(hadithNumber) : hadithNumber;

  return (
    <div className="min-h-screen bg-background">
      <ReaderSubBar
        progress={hadithNumber / TOTAL_HADITHS}
        left={
          book ? (
            <Link
              to="/book/$number"
              params={{ number: String(book.book_number) }}
              className={subBarBack}
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span className="truncate">
                {isBengali
                  ? (getBengaliBookTitle(book.book_number) ??
                    formatBookTitle(book.book_number, book.title_en))
                  : formatBookTitle(book.book_number, book.title_en)}
              </span>
            </Link>
          ) : (
            <Link to="/" className={subBarBack}>
              <ArrowLeft className="size-4 shrink-0" /> {t.library}
            </Link>
          )
        }
        title={`${t.hadith} ${num}`}
        right={
          <>
            <ReaderControls settings={readerSettings} update={updateReaderSettings} />
            {neighbours.data?.previous ? (
              <ReadingLink target={neighbours.data.previous} className={subBarPill}>
                <ChevronLeft className="size-3.5" aria-label={t.previousHadith} />
              </ReadingLink>
            ) : null}
            {neighbours.data?.next ? (
              <ReadingLink target={neighbours.data.next} className={subBarPill}>
                <ChevronRight className="size-3.5" aria-label={t.nextHadith} />
              </ReadingLink>
            ) : null}
          </>
        }
      />
      <header
        className={
          readerSettings.readerMode
            ? "relative hidden border-b border-border bg-parchment/95 [.app_&]:block"
            : "relative hidden border-b border-border bg-parchment [.app_&]:block"
        }
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = interfaceLanguage === "bn" ? "en" : "bn";
            setInterfaceLanguage(next);
            setContentLanguage(next);
          }}
          className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-10 h-9 rounded-full border-gold/40 bg-background/90 px-2 shadow-sm backdrop-blur hover:bg-accent sm:left-6 sm:px-3"
          aria-label={interfaceLanguage === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          title={interfaceLanguage === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
        >
          <Languages className="size-4" aria-hidden />
          <span className="hidden font-medium sm:inline">
            {interfaceLanguage === "bn" ? "English" : "বাংলা"}
          </span>
        </Button>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 pt-16 pb-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> {t.library}
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <ReaderControls settings={readerSettings} update={updateReaderSettings} />
            {!readerSettings.readerMode ? (
              <>
                {neighbours.data?.previous ? (
                  <ReadingLink
                    target={neighbours.data.previous}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <ChevronLeft className="size-4 shrink-0" />
                    <span>{targetLabel(neighbours.data.previous, isBengali, t.chapter)}</span>
                  </ReadingLink>
                ) : null}
                {neighbours.data?.next ? (
                  <ReadingLink
                    target={neighbours.data.next}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <span>{targetLabel(neighbours.data.next, isBengali, t.chapter)}</span>
                    <ChevronRight className="size-4 shrink-0" />
                  </ReadingLink>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main
        className={
          readerSettings.readerMode
            ? "mx-auto max-w-3xl px-4 py-8 sm:px-6"
            : "mx-auto max-w-4xl px-4 py-8 sm:px-6"
        }
      >
        {hadith.isLoading ? <p className="text-muted-foreground">{t.loadingHadith}</p> : null}
        {hadith.error ? <p className="text-destructive">{t.hadithLoadFailed}</p> : null}
        {!hadith.isLoading && !hadith.data ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="text-lg font-semibold">
              {t.hadith} {isBengali ? toBengaliDigits(number) : number} {t.hadithNotImported}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.hadithNumberRange}</p>
          </div>
        ) : null}
        {hadith.data ? (
          <div className="space-y-4">
            <HadithView hadith={hadith.data} context={context.data} />
            <nav
              aria-label={t.hadithNavigation}
              className={
                readerSettings.readerMode
                  ? "grid grid-cols-2 gap-3 pt-2"
                  : "grid grid-cols-2 gap-3 border-t border-border pt-6"
              }
            >
              {neighbours.data?.previous ? (
                <ReadingLink
                  target={neighbours.data.previous}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full justify-start px-4 sm:px-6 web:rounded-full",
                  })}
                >
                  <ChevronLeft className="size-5 shrink-0" />
                  <span className="truncate">
                    {neighbours.data.previous.kind === "chapter"
                      ? targetLabel(neighbours.data.previous, isBengali, t.chapter)
                      : `${t.previousHadith} ${targetLabel(neighbours.data.previous, isBengali, t.chapter)}`}
                  </span>
                </ReadingLink>
              ) : (
                <span />
              )}
              {neighbours.data?.next ? (
                <ReadingLink
                  target={neighbours.data.next}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full justify-end px-4 sm:px-6 web:rounded-full",
                  })}
                >
                  <span className="truncate">
                    {neighbours.data.next.kind === "chapter"
                      ? targetLabel(neighbours.data.next, isBengali, t.chapter)
                      : `${t.nextHadith} ${targetLabel(neighbours.data.next, isBengali, t.chapter)}`}
                  </span>
                  <ChevronRight className="size-5 shrink-0" />
                </ReadingLink>
              ) : (
                <span />
              )}
            </nav>
          </div>
        ) : null}
      </main>
    </div>
  );
}
