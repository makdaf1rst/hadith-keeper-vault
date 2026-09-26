import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { cleanNumberedTitle, formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import { fetchBooks, type Book, type Chapter, type Collection } from "@/lib/library-api";
import { useLanguage } from "@/lib/language";
import { containsArabic, normalizeArabic, normalizeEnglish, toBengaliDigits } from "@/lib/normalize";

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Subject Index — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Browse Al-Jāmiʿ al-Kāmil by subject using the existing Kitāb, Collection and Bāb titles, in Arabic and English.",
      },
      { property: "og:title", content: "Subject Index — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "A searchable index of every Kitāb, Collection and Bāb title in Al-Jāmiʿ al-Kāmil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TopicsPage,
});

type ChaptersFile = { collections: Collection[]; chapters: Chapter[] };

/** Read-only: titles come straight from the existing per-Kitāb structure files. */
async function loadStructure(bookNumber: number): Promise<ChaptersFile> {
  const response = await fetch(`/content/book-${bookNumber}/chapters.json`);
  if (!response.ok) return { collections: [], chapters: [] };
  return (await response.json()) as ChaptersFile;
}

type Entry =
  | { kind: "book"; book: Book; hay: string }
  | { kind: "collection"; book: Book; collection: Collection; hay: string }
  | { kind: "chapter"; book: Book; chapter: Chapter; hay: string };

function haystack(...values: (string | null | undefined)[]) {
  const joined = values.filter(Boolean).join(" ");
  return `${normalizeEnglish(joined)} ${normalizeArabic(joined)}`;
}

function matches(hay: string, raw: string) {
  const needle = containsArabic(raw) ? normalizeArabic(raw) : normalizeEnglish(raw);
  if (!needle) return false;
  return needle.split(" ").every((word) => hay.includes(word));
}

const RESULT_LIMIT = 150;

function TopicsPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const num = (n: number) => (bn ? toBengaliDigits(n) : String(n));
  const [input, setInput] = useState("");
  const query = useDeferredValue(input.trim());
  const [kind, setKind] = useState<"all" | "book" | "collection" | "chapter">("all");

  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const bookTitle = (book: Book) =>
    (bn ? getBengaliBookTitle(book.book_number) : null) ??
    formatBookTitle(book.book_number, book.title_en);

  const searching = query.length >= 2;
  const all = useQuery({
    queryKey: ["topics-structure", books.data?.length],
    enabled: searching && !!books.data,
    staleTime: Infinity,
    queryFn: async () => {
      const list = books.data ?? [];
      const out: Entry[] = [];
      const files = new Array<ChaptersFile>(list.length);
      let cursor = 0;
      await Promise.all(
        Array.from({ length: 6 }, async () => {
          while (cursor < list.length) {
            const i = cursor++;
            files[i] = await loadStructure(list[i]!.book_number);
          }
        }),
      );
      list.forEach((book, i) => {
        out.push({ kind: "book", book, hay: haystack(book.title_en, book.title_ar, getBengaliBookTitle(book.book_number)) });
        for (const collection of files[i]?.collections ?? []) {
          out.push({ kind: "collection", book, collection, hay: haystack(collection.title_en, collection.title_ar) });
        }
        for (const chapter of files[i]?.chapters ?? []) {
          out.push({ kind: "chapter", book, chapter, hay: haystack(chapter.title_en, chapter.title_ar) });
        }
      });
      return out;
    },
  });

  const results = useMemo(() => {
    if (!searching || !all.data) return [];
    return all.data.filter((e) => (kind === "all" || e.kind === kind) && matches(e.hay, query));
  }, [all.data, kind, query, searching]);

  const kindLabel = (k: Entry["kind"]) =>
    k === "book" ? (bn ? "কিতাব" : "Kitāb") : k === "collection" ? (bn ? "সংগ্রহ" : "Collection") : bn ? "বাব" : "Bāb";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> {bn ? "গ্রন্থাগার" : "Library"}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">{bn ? "বিষয়সূচি" : "Subject Index"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bn
              ? "গ্রন্থের বিদ্যমান কিতাব, সংগ্রহ ও বাবের শিরোনাম থেকে তৈরি — কোনো নতুন শ্রেণিবিন্যাস যোগ করা হয়নি।"
              : "Built only from the book's existing Kitāb, Collection and Bāb titles — no new classification is added."}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={bn ? "বিষয় খুঁজুন (যেমন: salah, الصلاة)…" : "Find a subject (e.g. prayer, fasting, الصلاة)…"}
              aria-label={bn ? "বিষয় খুঁজুন" : "Search subjects"}
              className="h-11 bg-card pl-9 text-base"
            />
          </div>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            aria-label={bn ? "শিরোনামের ধরন" : "Title type"}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground"
          >
            <option value="all">{bn ? "সব শিরোনাম" : "All titles"}</option>
            <option value="book">{bn ? "কিতাব" : "Kitābs"}</option>
            <option value="collection">{bn ? "সংগ্রহ" : "Collections"}</option>
            <option value="chapter">{bn ? "বাব" : "Bābs"}</option>
          </select>
        </div>

        {searching ? (
          all.isLoading ? (
            <p className="text-sm text-muted-foreground">{bn ? "সূচি লোড হচ্ছে…" : "Loading the index…"}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {bn ? `${num(results.length)}টি শিরোনাম মিলেছে` : `${results.length} matching titles`}
                {results.length > RESULT_LIMIT ? (bn ? ` — প্রথম ${num(RESULT_LIMIT)}টি দেখানো হচ্ছে` : ` — showing the first ${RESULT_LIMIT}`) : ""}
              </p>
              <ul className="space-y-2">
                {results.slice(0, RESULT_LIMIT).map((entry) => (
                  <li key={`${entry.kind}-${entry.kind === "book" ? entry.book.id : entry.kind === "collection" ? entry.collection.id : entry.chapter.id}`}>
                    <EntryLink entry={entry} bookTitle={bookTitle(entry.book)} kindLabel={kindLabel(entry.kind)} />
                  </li>
                ))}
              </ul>
            </>
          )
        ) : (
          <ul className="space-y-2">
            {(books.data ?? []).map((book) => (
              <BookRow key={book.id} book={book} title={bookTitle(book)} bn={bn} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

const linkClass =
  "block rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function EntryLink({ entry, bookTitle, kindLabel }: { entry: Entry; bookTitle: string; kindLabel: string }) {
  const body = (title: string, ar: string | null | undefined, sub?: string) => (
    <>
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{kindLabel}</span>
      <span className="block text-sm text-foreground">{title}</span>
      {ar ? <span className="arabic-text block text-base! leading-normal! text-muted-foreground">{ar}</span> : null}
      {sub ? <span className="block text-xs text-muted-foreground">{sub}</span> : null}
    </>
  );
  if (entry.kind === "chapter") {
    return (
      <Link to="/chapter/$id" params={{ id: entry.chapter.id }} className={linkClass}>
        {body(formatChapterTitle(entry.chapter.chapter_number, entry.chapter.title_en) || kindLabel, entry.chapter.title_ar, bookTitle)}
      </Link>
    );
  }
  if (entry.kind === "collection") {
    return (
      <Link to="/book/$number" params={{ number: String(entry.book.book_number) }} className={linkClass}>
        {body(entry.collection.title_en ?? kindLabel, entry.collection.title_ar, bookTitle)}
      </Link>
    );
  }
  return (
    <Link to="/book/$number" params={{ number: String(entry.book.book_number) }} className={linkClass}>
      {body(bookTitle, entry.book.title_ar ? cleanNumberedTitle(entry.book.title_ar, "book") : null)}
    </Link>
  );
}

function BookRow({ book, title, bn }: { book: Book; title: string; bn: boolean }) {
  const [open, setOpen] = useState(false);
  const structure = useQuery({
    queryKey: ["topics-book", book.book_number],
    queryFn: () => loadStructure(book.book_number),
    enabled: open,
    staleTime: Infinity,
  });
  const chaptersFor = (collectionId: string | null) =>
    (structure.data?.chapters ?? []).filter((c) => c.collection_id === collectionId);

  return (
    <li className="rounded-md border border-border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{title}</span>
          {book.title_ar ? (
            <span className="arabic-text block text-base! leading-normal! text-muted-foreground">{book.title_ar}</span>
          ) : null}
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <Link to="/book/$number" params={{ number: String(book.book_number) }} className="text-sm text-primary underline-offset-4 hover:underline">
            {bn ? "কিতাব খুলুন" : "Open this Kitāb"}
          </Link>
          {structure.isLoading ? <p className="text-xs text-muted-foreground">{bn ? "লোড হচ্ছে…" : "Loading…"}</p> : null}
          <ChapterList chapters={chaptersFor(null)} />
          {(structure.data?.collections ?? []).map((collection) => (
            <div key={collection.id}>
              <p className="text-sm font-semibold text-foreground">{collection.title_en}</p>
              {collection.title_ar ? <p className="arabic-text text-base! leading-normal! text-muted-foreground">{collection.title_ar}</p> : null}
              <ChapterList chapters={chaptersFor(collection.id)} />
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function ChapterList({ chapters }: { chapters: Chapter[] }) {
  if (!chapters.length) return null;
  return (
    <ul className="mt-1 space-y-1 border-l border-border pl-3">
      {chapters.map((chapter) => (
        <li key={chapter.id}>
          <Link to="/chapter/$id" params={{ id: chapter.id }} className="text-sm text-foreground hover:text-primary hover:underline">
            {formatChapterTitle(chapter.chapter_number, chapter.title_en) || chapter.title_ar}
          </Link>
        </li>
      ))}
    </ul>
  );
}
