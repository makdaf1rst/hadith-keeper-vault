import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { IntroText } from "@/components/library/IntroText";
import { buttonVariants } from "@/components/ui/button";
import { fetchBengaliStructure } from "@/lib/bengali-translations";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import {
  fetchChapterContext,
  fetchChapterNeighbours,
  type ReadingTarget,
} from "@/lib/library-api";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { toArabicIndicDigits, toBengaliDigits } from "@/lib/normalize";

export const Route = createFileRoute("/chapter/$id")({
  component: ChapterReadingPage,
});

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
    <Link
      to="/hadith/$number"
      params={{ number: String(target.number) }}
      className={className}
    >
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

function ChapterReadingPage() {
  const { id } = Route.useParams();
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const isBengali = contentLanguage === "bn";

  const context = useQuery({
    queryKey: ["chapter-reading-context", id],
    queryFn: () => fetchChapterContext(id),
  });

  const neighbours = useQuery({
    queryKey: ["chapter-reading-neighbours", id],
    queryFn: () => fetchChapterNeighbours(id),
  });

  const bengaliStructure = useQuery({
    queryKey: ["bengali-structure", context.data?.book?.book_number],
    queryFn: () => fetchBengaliStructure(context.data!.book!.book_number),
    enabled: contentLanguage === "bn" && !!context.data?.book?.book_number,
  });

  const bengaliChapter = context.data?.chapter
    ? bengaliStructure.data?.chapters.find((item) => item.id === context.data?.chapter.id)
    : null;

  const isIntroductionChapter =
    !!context.data?.chapter &&
    context.data.chapter.chapter_number == null &&
    /^chapter$/i.test((context.data.chapter.title_en ?? "").trim()) &&
    /introduction/i.test(context.data.collection?.title_en ?? "");

  const chapterTitle = context.data?.chapter
    ? contentLanguage === "bn" && bengaliChapter?.title_bn
      ? bengaliChapter.title_bn
      : isIntroductionChapter
        ? contentLanguage === "bn"
          ? "ভূমিকা"
          : "Introduction"
        : formatChapterTitle(context.data.chapter.chapter_number, context.data.chapter.title_en)
    : t.chapter;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> {t.library}
          </Link>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {context.isLoading ? <p className="text-muted-foreground">{t.loading}</p> : null}
        {!context.isLoading && !context.data ? (
          <p className="text-destructive">Chapter information could not be loaded.</p>
        ) : null}

        {context.data ? (
          <div className="space-y-4">
            <article className="rounded-lg border border-border bg-card shadow-sm">
              <header className="border-b border-border bg-parchment px-4 py-4 sm:px-6">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {t.chapter}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-foreground">{chapterTitle}</h1>
                {context.data.chapter.title_ar ? (
                  <p className="arabic-text mt-2 text-xl! text-foreground">
                    {context.data.chapter.chapter_number != null
                      ? `${toArabicIndicDigits(context.data.chapter.chapter_number)}. `
                      : ""}
                    {context.data.chapter.title_ar}
                  </p>
                ) : null}
                {context.data.book ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatBookTitle(context.data.book.book_number, context.data.book.title_en)}
                  </p>
                ) : null}
                {context.data.collection?.title_en ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {context.data.collection.title_en}
                  </p>
                ) : null}
              </header>
              <div className="px-4 py-6 sm:px-6">
                <IntroText
                  intro={context.data.chapter}
                  bengaliIntro={bengaliChapter}
                  label={t.chapterIntroduction}
                />
              </div>
            </article>

            <nav
              aria-label={t.hadithNavigation}
              className="grid grid-cols-2 gap-3 border-t border-border pt-6"
            >
              {neighbours.data?.previous ? (
                <ReadingLink
                  target={neighbours.data.previous}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full justify-start px-4 sm:px-6",
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
                    className: "w-full justify-end px-4 sm:px-6",
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
