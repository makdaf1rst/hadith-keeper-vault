import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  fetchBooks,
  fetchChapterHadiths,
  fetchChapters,
  fetchCollections,
  type Chapter,
} from "@/lib/library-api";
import { toArabicIndicDigits } from "@/lib/normalize";
import { cn } from "@/lib/utils";

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

function HadithList({ chapterId }: { chapterId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["chapter-hadiths", chapterId],
    queryFn: () => fetchChapterHadiths(chapterId),
  });

  if (isLoading) return <p className="px-2 py-1 text-xs text-muted-foreground">Loading…</p>;
  if (!data?.length)
    return <p className="px-2 py-1 text-xs text-muted-foreground">No hadiths imported yet.</p>;

  return (
    <ul className="flex flex-wrap gap-1.5 px-2 py-2">
      {data.map((h) => (
        <li key={h.id}>
          <Link
            to="/hadith/$number"
            params={{ number: String(h.hadith_number) }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {h.hadith_number}
            <span className="arabic-text text-sm! leading-none! text-muted-foreground">
              {toArabicIndicDigits(h.hadith_number)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ChapterNode({ chapter }: { chapter: Chapter }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-l border-border pl-2">
      <Toggle open={open} onClick={() => setOpen((v) => !v)}>
        <Title
          ar={chapter.title_ar}
          en={
            chapter.title_en
              ? chapter.chapter_number
                ? `Chapter ${chapter.chapter_number} — ${chapter.title_en}`
                : chapter.title_en
              : chapter.chapter_number
                ? `Chapter ${chapter.chapter_number}`
                : null
          }
        />
      </Toggle>
      {open ? <HadithList chapterId={chapter.id} /> : null}
    </li>
  );
}

function BookNode({
  book,
}: {
  book: { id: string; book_number: number; title_ar: string | null; title_en: string | null };
}) {
  const [open, setOpen] = useState(false);
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

  return (
    <li className="rounded-md">
      <Toggle open={open} onClick={() => setOpen((v) => !v)} className="items-center">
        <Title
          ar={book.title_ar}
          en={
            book.title_en ? `Book ${book.book_number} — ${book.title_en}` : `Book ${book.book_number}`
          }
        />
      </Toggle>
      {open ? (
        <div className="pl-4">
          {collections.isLoading || chapters.isLoading ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">Loading…</p>
          ) : null}
          <ul className="space-y-0.5">
            {(collections.data ?? []).map((collection) => {
              const own = (chapters.data ?? []).filter((c) => c.collection_id === collection.id);
              return (
                <CollectionNode
                  key={collection.id}
                  collection={collection}
                  chapters={own}
                />
              );
            })}
            {loose.map((chapter) => (
              <ChapterNode key={chapter.id} chapter={chapter} />
            ))}
          </ul>
          {!collections.isLoading &&
          !chapters.isLoading &&
          !(collections.data ?? []).length &&
          !loose.length ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              Nothing imported under this book yet.
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function CollectionNode({
  collection,
  chapters,
}: {
  collection: { id: string; title_ar: string | null; title_en: string | null };
  chapters: Chapter[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-l border-border pl-2">
      <Toggle open={open} onClick={() => setOpen((v) => !v)}>
        <Title ar={collection.title_ar} en={collection.title_en} />
      </Toggle>
      {open ? (
        <ul className="space-y-0.5 pl-4">
          {chapters.length ? (
            chapters.map((chapter) => <ChapterNode key={chapter.id} chapter={chapter} />)
          ) : (
            <li className="px-2 py-1 text-xs text-muted-foreground">No chapters yet.</li>
          )}
        </ul>
      ) : null}
    </li>
  );
}

export function LibraryTree() {
  const { data, isLoading, error } = useQuery({ queryKey: ["books"], queryFn: fetchBooks });

  if (isLoading) return <p className="px-2 py-3 text-sm text-muted-foreground">Loading books…</p>;
  if (error)
    return <p className="px-2 py-3 text-sm text-destructive">The library could not be loaded.</p>;
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
        <BookNode key={book.id} book={book} />
      ))}
    </ul>
  );
}
