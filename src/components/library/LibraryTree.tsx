import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  fetchBookHadiths,
  fetchBooks,
  fetchChapterHadiths,
  fetchChapters,
  fetchCollections,
  type Book as BookRow,
  type Chapter,
  type Collection,
  type HadithStub,
} from "@/lib/library-api";
import { IntroText } from "@/components/library/IntroText";
import { formatBookTitle, formatChapterTitle, orderCollectionChapters } from "@/lib/display-titles";
import { useInterfaceText, useLanguage } from "@/lib/language";
import {
  fetchBengaliChapterTranslation,
  fetchBengaliCollectionTranslation,
} from "@/lib/bengali-translations";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import { toArabicIndicDigits, toBengaliDigits } from "@/lib/normalize";
import { cn } from "@/lib/utils";

function formatArabicBookTitle(number: number, title: string | null) {
  if (!title) return null;
  const clean = title
    .trim()
    .replace(/^[0-9٠-٩]+\s*(?:[-–—.:|])\s*/, "")
    .trim();
  return `${toArabicIndicDigits(number)}. ${clean}`;
}

function Title({ ar, en }: { ar: string | null; en: string | null }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
      {en ? <span className="text-sm leading-snug font-medium">{en}</span> : null}
      {ar ? (
        <span className="arabic-text text-base! leading-relaxed! text-muted-foreground">{ar}</span>
      ) : null}
      {!ar && !en ? <span className="text-sm text-muted-foreground italic">Untitled</span> : null}
    </span>
  );
}

function Toggle({
  open,
  onClick,
  children,
  className,
}: {
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
        className,
      )}
    >
      {open ? (
        <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      )}
      {children}
    </button>
  );
}

function HadithChips({ hadiths }: { hadiths: HadithStub[] }) {
  const { contentLanguage } = useLanguage();
  const isBengali = contentLanguage === "bn";
  return (
    <ul className="flex flex-wrap gap-1.5 px-2 py-2">
      {hadiths.map((h) => (
        <li key={h.id}>
          <Link
            to="/hadith/$number"
            params={{ number: String(h.hadith_number) }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {isBengali ? toBengaliDigits(h.hadith_number) : h.hadith_number}
            <span className="arabic-text text-sm! leading-none! text-muted-foreground">
              {toArabicIndicDigits(h.hadith_number)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function HadithList({ chapterId }: { chapterId: string }) {
  const t = useInterfaceText();
  const { data, isLoading } = useQuery({
    queryKey: ["chapter-hadiths", chapterId],
    queryFn: () => fetchChapterHadiths(chapterId),
  });

  if (isLoading) return <p className="px-2 py-1 text-xs text-muted-foreground">{t.loading}</p>;
  if (!data?.length)
    return <p className="px-2 py-1 text-xs text-muted-foreground">{t.noHadithsImported}</p>;

  return <HadithChips hadiths={data} />;
}

/**
 * Hadiths of a book that has no collections or chapters. Their chapter_id
 * values are orphans, so they are grouped by chapter_id into neutral
 * "Section N" labels (ordered by each group's first hadith number); a book
 * whose hadiths all share one orphan id renders as a flat list.
 */
function BookHadiths({ bookId }: { bookId: string }) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const isBengali = contentLanguage === "bn";
  const { data, isLoading } = useQuery({
    queryKey: ["book-hadiths", bookId],
    queryFn: () => fetchBookHadiths(bookId),
  });

  if (isLoading) return <p className="px-2 py-1 text-xs text-muted-foreground">{t.loading}</p>;
  if (!data?.length)
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        {t.nothingInBook}
      </p>
    );

  const byChapter = new Map<string, HadithStub[]>();
  for (const h of data) {
    const key = h.chapter_id ?? "";
    const group = byChapter.get(key);
    const stub = { id: h.id, hadith_number: h.hadith_number, chapter_id: h.chapter_id };
    if (group) group.push(stub);
    else byChapter.set(key, [stub]);
  }
  const sections = [...byChapter.values()]
    .map((group) => group.sort((a, b) => a.hadith_number - b.hadith_number))
    .sort((a, b) => a[0]!.hadith_number - b[0]!.hadith_number);

  if (sections.length === 1) return <HadithChips hadiths={sections[0]!} />;

  return (
    <ul className="space-y-0.5">
      {sections.map((section, i) => (
        <li key={section[0]!.id} className="border-l border-border pl-2">
          <p className="px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t.section} {isBengali ? toBengaliDigits(i + 1) : i + 1}
          </p>
          <HadithChips hadiths={section} />
        </li>
      ))}
    </ul>
  );
}

function ChapterNode({ chapter, bookNumber }: { chapter: Chapter; bookNumber: number }) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const bengali = useQuery({
    queryKey: ["bengali-chapter", bookNumber, chapter.id],
    queryFn: () =>
      fetchBengaliChapterTranslation(
        bookNumber,
        chapter.id,
        chapter.sort_order,
        chapter.chapter_number,
      ),
    enabled: contentLanguage === "bn",
  });
  const bn = contentLanguage === "bn" ? bengali.data : null;
  return (
    <li className="border-l border-border pl-2">
      <Toggle open={open} onClick={() => setOpen((v) => !v)}>
        <Title
          ar={chapter.title_ar}
          en={bn?.title_bn ?? (formatChapterTitle(chapter.chapter_number, chapter.title_en) || null)}
        />
      </Toggle>
      {open ? (
        <>
          <IntroText
            intro={chapter}
            bengaliIntro={bn}
            className="mx-2 my-2"
            label={t.chapterIntroduction}
          />
          <HadithList chapterId={chapter.id} />
        </>
      ) : null}
    </li>
  );
}

function BookNode({
  book,
  open,
  onToggle,
}: {
  book: BookRow;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const collections = useQuery({
    queryKey: ["collections", book.id],
    queryFn: () => fetchCollections(book.id),
    enabled: open,
  });
  const chapters = useQuery({
    queryKey: ["chapters", book.id],
    queryFn: () => fetchChapters(book.id),
    enabled: open,
  });

  const loose = (chapters.data ?? []).filter((c) => !c.collection_id);
  const headingsLoaded = !collections.isLoading && !chapters.isLoading;
  const noHeadings = headingsLoaded && !(collections.data ?? []).length && !loose.length;

  return (
    <li className="rounded-md">
      <Toggle open={open} onClick={onToggle} className="items-center">
        <Title
          ar={formatArabicBookTitle(book.book_number, book.title_ar)}
          en={
            contentLanguage === "bn"
              ? getBengaliBookTitle(book.book_number) ?? formatBookTitle(book.book_number, book.title_en)
              : formatBookTitle(book.book_number, book.title_en)
          }
        />
      </Toggle>
      {open ? (
        <div className="pl-4">
          <IntroText
            intro={book}
            bengaliIntro={contentLanguage === "bn" ? getBengaliBookIntro(book.book_number) : null}
            className="mx-2 my-2"
            label={t.bookIntroduction}
          />
          {headingsLoaded ? null : (
            <p className="px-2 py-1 text-xs text-muted-foreground">{t.loading}</p>
          )}
          <ul className="space-y-0.5">
            {(collections.data ?? []).map((collection) => {
              const own = orderCollectionChapters((chapters.data ?? []).filter((c) => c.collection_id === collection.id));
              return (
                <CollectionNode
                  key={collection.id}
                  collection={collection}
                  chapters={own}
                  bookNumber={book.book_number}
                />
              );
            })}
            {loose.map((chapter) => (
              <ChapterNode key={chapter.id} chapter={chapter} bookNumber={book.book_number} />
            ))}
          </ul>
          {noHeadings ? <BookHadiths bookId={book.id} /> : null}
        </div>
      ) : null}
    </li>
  );
}

function CollectionNode({
  collection,
  chapters,
  bookNumber,
}: {
  collection: Collection;
  chapters: Chapter[];
  bookNumber: number;
}) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const bengali = useQuery({
    queryKey: ["bengali-collection", bookNumber, collection.id],
    queryFn: () =>
      fetchBengaliCollectionTranslation(bookNumber, collection.id, collection.sort_order),
    enabled: contentLanguage === "bn",
  });
  const bn = contentLanguage === "bn" ? bengali.data : null;
  return (
    <li className="border-l border-border pl-2">
      <Toggle open={open} onClick={() => setOpen((v) => !v)}>
        <Title ar={collection.title_ar} en={bn?.title_bn ?? collection.title_en} />
      </Toggle>
      {open ? (
        <>
          <IntroText
            intro={collection}
            bengaliIntro={bn}
            className="mx-2 my-2"
            label={t.collectionIntroduction}
          />
          <ul className="space-y-0.5 pl-4">
            {chapters.length ? (
              chapters.map((chapter) => (
                <ChapterNode key={chapter.id} chapter={chapter} bookNumber={bookNumber} />
              ))
            ) : (
              <li className="px-2 py-1 text-xs text-muted-foreground">{t.noChaptersYet}</li>
            )}
          </ul>
        </>
      ) : null}
    </li>
  );
}

export function LibraryTree({
  selectedBookId,
  onSelectBook,
}: {
  selectedBookId: string | null;
  onSelectBook: (book: BookRow | null) => void;
}) {
  const t = useInterfaceText();
  const { data, isLoading, error } = useQuery({ queryKey: ["books"], queryFn: fetchBooks });

  if (isLoading) return <p className="px-2 py-3 text-sm text-muted-foreground">{t.loadingBooks}</p>;
  if (error)
    return <p className="px-2 py-3 text-sm text-destructive">{t.libraryLoadFailed}</p>;
  if (!data?.length)
    return (
      <p className="px-2 py-3 text-sm text-muted-foreground">
        No documents have been imported yet. Books, collections, chapters and hadiths appear here as
        each source document is imported.
      </p>
    );

  return (
    <ul className="space-y-0.5">
      {data.map((book) => (
        <BookNode
          key={book.id}
          book={book}
          open={book.id === selectedBookId}
          onToggle={() => onSelectBook(book.id === selectedBookId ? null : book)}
        />
      ))}
    </ul>
  );
}
