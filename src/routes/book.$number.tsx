import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { IntroText } from "@/components/library/IntroText";
import { KitabDownloadMenu } from "@/components/library/KitabDownloadMenu";
import {
  fetchBengaliStructure,
  type BengaliChapterTranslation,
} from "@/lib/bengali-translations";
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

export const Route = createFileRoute("/book/$number")({
  head: ({ params }) => {
    const title = `Book ${params.number} — Al-Jāmiʿ al-Kāmil`;
    const description = `Collections and chapters of Book ${params.number} of Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil, with complete Arabic and English headings.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
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
    return <p className="mt-2 text-xs text-muted-foreground">No numbered hadiths in this chapter.</p>;
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

function ChapterBlock({
  chapter,
  bengali,
}: {
  chapter: Chapter;
  bengali?: BengaliChapterTranslation | null;
}) {
  const { contentLanguage } = useLanguage();
  const title =
    contentLanguage === "bn" && bengali?.title_bn
      ? bengali.title_bn
      : formatChapterTitle(chapter.chapter_number, chapter.title_en) || "Chapter";

  return (
    <li className="border-l-2 border-border pl-3">
      <p className="text-sm font-medium">{title}</p>
      {chapter.title_ar ? <p className="arabic-text text-lg! leading-relaxed!">{chapter.title_ar}</p> : null}
      <IntroText
        intro={chapter}
        bengaliIntro={bengali}
        className="mt-2"
        label={contentLanguage === "bn" ? "অধ্যায়ের ভূমিকা" : "Chapter introduction"}
      />
      <ChapterHadiths chapter={chapter} />
    </li>
  );
}

function BookPage() {
  const { number } = Route.useParams();
  const { contentLanguage } = useLanguage();
  const bookNumber = Number(number);

  const book = useQuery({
    queryKey: ["book", bookNumber],
    queryFn: () => fetchBookByNumber(bookNumber),
    enabled: Number.isFinite(bookNumber),
  });
  const collections = useQuery({
    queryKey: ["collections", book.data?.id],
    queryFn: () => fetchCollections(book.data!.id),
    enabled: !!book.data,
  });
  const chapters = useQuery({
    queryKey: ["chapters", book.data?.id],
    queryFn: () => fetchChapters(book.data!.id),
    enabled: !!book.data,
  });
  const bengaliStructure = useQuery({
    queryKey: ["bengali-structure", bookNumber],
    queryFn: () => fetchBengaliStructure(bookNumber),
    enabled: contentLanguage === "bn" && Number.isFinite(bookNumber),
  });

  const bengaliCollections = new Map(
    (bengaliStructure.data?.collections ?? []).map((item) => [item.id, item]),
  );
  const bengaliChapters = new Map(
    (bengaliStructure.data?.chapters ?? []).map((item) => [item.id, item]),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
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
                  {formatBookTitle(book.data.book_number, book.data.title_en)}
                </h1>
                <KitabDownloadMenu
                  book={book.data}
                  collections={collections.data ?? []}
                  chapters={chapters.data ?? []}
                />
              </div>
              {book.data.title_ar ? <p className="arabic-text">{book.data.title_ar}</p> : null}
              <IntroText intro={book.data} className="mt-4" label="Book introduction" />
            </div>

            {(collections.data ?? []).map((collection) => {
              const bengaliCollection = bengaliCollections.get(collection.id);
              return (
                <section key={collection.id} className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold">
                    {contentLanguage === "bn" && bengaliCollection?.title_bn
                      ? bengaliCollection.title_bn
                      : collection.title_en ?? "Collection"}
                  </h2>
                  {collection.title_ar ? <p className="arabic-text">{collection.title_ar}</p> : null}
                  <IntroText
                    intro={collection}
                    bengaliIntro={bengaliCollection}
                    className="mt-3"
                    label={contentLanguage === "bn" ? "সংগ্রহের ভূমিকা" : "Collection introduction"}
                  />
                  <ul className="mt-3 space-y-3">
                    {orderCollectionChapters(
                      (chapters.data ?? []).filter((chapter) => chapter.collection_id === collection.id),
                    ).map((chapter) => (
                      <ChapterBlock
                        key={chapter.id}
                        chapter={chapter}
                        bengali={bengaliChapters.get(chapter.id)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}

            {(chapters.data ?? []).some((chapter) => !chapter.collection_id) ? (
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">{contentLanguage === "bn" ? "অধ্যায়সমূহ" : "Chapters"}</h2>
                <ul className="mt-3 space-y-3">
                  {(chapters.data ?? [])
                    .filter((chapter) => !chapter.collection_id)
                    .map((chapter) => (
                      <ChapterBlock
                        key={chapter.id}
                        chapter={chapter}
                        bengali={bengaliChapters.get(chapter.id)}
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
