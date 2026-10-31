import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { BookAudioDownload } from "@/components/library/HadithAudio";
import { IntroText } from "@/components/library/IntroText";
import { ReaderSubBar, subBarBack } from "@/components/library/ReaderSubBar";
import { fetchBengaliStructure, type BengaliChapterTranslation } from "@/lib/bengali-translations";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import { formatBookTitle, formatChapterTitle, orderCollectionChapters } from "@/lib/display-titles";
import {
  fetchBookByNumber,
  fetchChapterHadiths,
  fetchChapters,
  fetchCollections,
  type Chapter,
} from "@/lib/library-api";
import { useLanguage } from "@/lib/language";
import { toArabicIndicDigits } from "@/lib/normalize";
import { makeBreadcrumbList, SITE_ORIGIN, sourceExcerpt } from "@/lib/seo";

export const Route = createFileRoute("/book/$number")({
  loader: async ({ params }) => {
    const bookNumber = Number(params.number);
    if (!Number.isSafeInteger(bookNumber) || bookNumber < 1) throw notFound();

    const book = await fetchBookByNumber(bookNumber);
    if (!book) throw notFound();

    const [collections, chapters] = await Promise.all([
      fetchCollections(book.id),
      fetchChapters(book.id),
    ]);
    return { book, collections, chapters };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { book } = loaderData;
    const bookTitle = formatBookTitle(book.book_number, book.title_en);
    const canonical = `${SITE_ORIGIN}/book/${book.book_number}`;
    const title = `${bookTitle} — Al-Jāmiʿ al-Kāmil`;
    const description =
      sourceExcerpt(book.intro_en_display) ||
      `Collections and chapters of ${bookTitle} in Arabic and English.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            ...makeBreadcrumbList([
              { name: "Home", url: `${SITE_ORIGIN}/` },
              { name: bookTitle, url: canonical },
            ]),
          }),
        },
      ],
    };
  },
  component: BookPage,
});

function ChapterHadiths({ chapter }: { chapter: Chapter }) {
  const hadiths = useQuery({
    queryKey: ["chapter-hadiths", chapter.id],
    queryFn: () => fetchChapterHadiths(chapter.id),
  });

  if (hadiths.isLoading) {
    return <p className="mt-2 text-xs text-muted-foreground">Loading hadiths…</p>;
  }

  if (!hadiths.data?.length) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">No numbered hadiths in this chapter.</p>
    );
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {hadiths.data.map((hadith) => (
        <li key={hadith.id}>
          <Link
            to="/hadith/$number"
            params={{ number: String(hadith.hadith_number) }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {hadith.hadith_number}
            <span className="arabic-text text-sm! leading-none! text-muted-foreground">
              {toArabicIndicDigits(hadith.hadith_number)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ponytail: native <details>; children mount only once opened so a closed baab never fetches its hadiths.
function Fold({
  summary,
  className,
  children,
}: {
  summary: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details className={className} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
        <div className="min-w-0 flex-1">{summary}</div>
      </summary>
      {open ? children : null}
    </details>
  );
}

function ChapterBlock({
  chapter,
  bengali,
}: {
  chapter: Chapter;
  bengali?: BengaliChapterTranslation | null | undefined;
}) {
  const { contentLanguage } = useLanguage();
  const title =
    contentLanguage === "bn" && bengali?.title_bn
      ? bengali.title_bn
      : formatChapterTitle(chapter.chapter_number, chapter.title_en) || "Chapter";

  return (
    <li className="border-l-2 border-border pl-3">
      <Fold
        summary={
          <>
            <p className="text-sm font-medium">{title}</p>
            {chapter.title_ar ? (
              <p className="arabic-text text-lg! leading-relaxed!">{chapter.title_ar}</p>
            ) : null}
          </>
        }
      >
        <IntroText
          intro={chapter}
          bengaliIntro={bengali}
          className="mt-2"
          label={contentLanguage === "bn" ? "অধ্যায়ের ভূমিকা" : "Chapter introduction"}
        />
        <ChapterHadiths chapter={chapter} />
      </Fold>
    </li>
  );
}

function BookPage() {
  const { number } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { contentLanguage } = useLanguage();
  const bookNumber = Number(number);

  const book = useQuery({
    queryKey: ["book", bookNumber],
    queryFn: () => fetchBookByNumber(bookNumber),
    enabled: Number.isFinite(bookNumber),
    initialData: loaderData.book,
  });
  const collections = useQuery({
    queryKey: ["collections", book.data?.id],
    queryFn: () => fetchCollections(book.data!.id),
    enabled: !!book.data,
    initialData: loaderData.collections,
  });
  const chapters = useQuery({
    queryKey: ["chapters", book.data?.id],
    queryFn: () => fetchChapters(book.data!.id),
    enabled: !!book.data,
    initialData: loaderData.chapters,
  });
  const bengaliStructure = useQuery({
    queryKey: ["bengali-structure", bookNumber],
    queryFn: () => fetchBengaliStructure(bookNumber),
    enabled:
      typeof window !== "undefined" && contentLanguage === "bn" && Number.isFinite(bookNumber),
  });

  const bengaliCollections = new Map(
    (bengaliStructure.data?.collections ?? []).flatMap((item) => [
      [item.id, item] as const,
      [`sort:${item.sort_order}`, item] as const,
    ]),
  );
  const bengaliChapters = new Map(
    (bengaliStructure.data?.chapters ?? []).flatMap((item) => [
      [item.id, item] as const,
      [`sort:${item.sort_order}`, item] as const,
    ]),
  );

  return (
    <div className="min-h-screen bg-background">
      <ReaderSubBar
        left={
          <Link to="/" className={subBarBack}>
            <ArrowLeft className="size-4 shrink-0" />
            {contentLanguage === "bn" ? "লাইব্রেরি" : "Library"}
          </Link>
        }
        title={contentLanguage === "bn" ? "কিতাব" : "Book"}
        {...(Number.isFinite(bookNumber) ? { progress: bookNumber / 66 } : {})}
      />
      <header className="hidden border-b border-border bg-parchment [.app_&]:block">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Library
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {book.isLoading ? <p className="text-muted-foreground">Loading book…</p> : null}
        {!book.isLoading && !book.data ? (
          <p className="text-muted-foreground">Book {number} has not been imported yet.</p>
        ) : null}
        {book.data ? (
          <>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {contentLanguage === "bn"
                    ? (getBengaliBookTitle(book.data.book_number) ??
                      formatBookTitle(book.data.book_number, book.data.title_en))
                    : formatBookTitle(book.data.book_number, book.data.title_en)}
                </h1>
                <BookAudioDownload bookId={book.data.id} bookNumber={book.data.book_number} />
              </div>
              {book.data.title_ar ? <p className="arabic-text">{book.data.title_ar}</p> : null}
              <IntroText
                intro={book.data}
                bengaliIntro={
                  contentLanguage === "bn" ? getBengaliBookIntro(book.data.book_number) : null
                }
                className="mt-4"
                label={contentLanguage === "bn" ? "কিতাবের ভূমিকা" : "Book introduction"}
              />
            </div>

            {(collections.data ?? []).map((collection) => {
              const bengaliCollection =
                bengaliCollections.get(collection.id) ??
                bengaliCollections.get(`sort:${collection.sort_order}`);
              return (
                <section
                  key={collection.id}
                  className="rounded-lg border border-border bg-card p-5 web:rounded-2xl"
                >
                  <Fold
                    summary={
                      <>
                        <h2 className="text-lg font-semibold">
                          {contentLanguage === "bn" && bengaliCollection?.title_bn
                            ? bengaliCollection.title_bn
                            : (collection.title_en ?? "Collection")}
                        </h2>
                        {collection.title_ar ? (
                          <p className="arabic-text">{collection.title_ar}</p>
                        ) : null}
                      </>
                    }
                  >
                    <IntroText
                      intro={collection}
                      bengaliIntro={bengaliCollection}
                      className="mt-3"
                      label={
                        contentLanguage === "bn" ? "সংগ্রহের ভূমিকা" : "Collection introduction"
                      }
                    />
                    <ul className="mt-3 space-y-3">
                      {orderCollectionChapters(
                        (chapters.data ?? []).filter(
                          (chapter) => chapter.collection_id === collection.id,
                        ),
                      ).map((chapter) => (
                        <ChapterBlock
                          key={chapter.id}
                          chapter={chapter}
                          bengali={
                            bengaliChapters.get(chapter.id) ??
                            bengaliChapters.get(`sort:${chapter.sort_order}`)
                          }
                        />
                      ))}
                    </ul>
                  </Fold>
                </section>
              );
            })}

            {(chapters.data ?? []).some((chapter) => !chapter.collection_id) ? (
              <section className="rounded-lg border border-border bg-card p-5 web:rounded-2xl">
                <h2 className="text-lg font-semibold">
                  {contentLanguage === "bn" ? "অধ্যায়সমূহ" : "Chapters"}
                </h2>
                <ul className="mt-3 space-y-3">
                  {(chapters.data ?? [])
                    .filter((chapter) => !chapter.collection_id)
                    .map((chapter) => (
                      <ChapterBlock
                        key={chapter.id}
                        chapter={chapter}
                        bengali={
                          bengaliChapters.get(chapter.id) ??
                          bengaliChapters.get(`sort:${chapter.sort_order}`)
                        }
                      />
                    ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
