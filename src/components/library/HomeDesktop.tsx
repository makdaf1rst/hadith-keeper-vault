// Website-only home sections (Quran.com-style). The app keeps its own header + LibraryTree in index.tsx.
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, Bookmark, ChevronRight, HelpCircle, List, Search } from "lucide-react";
import { useState } from "react";

import { AboutLibrary } from "@/components/library/AboutLibrary";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { cleanNumberedTitle } from "@/lib/display-titles";
import { fetchBooks, fetchLibraryStats } from "@/lib/library-api";
import { toArabicIndicDigits, toBengaliDigits } from "@/lib/normalize";
import { useReadingHistory } from "@/lib/reading-history";

const pill =
  "inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-primary/50 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function HomeHero({ bn, onGuide }: { bn: boolean; onGuide: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden border-b border-border bg-parchment font-sans [.app_&]:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklch,var(--gold)_18%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 pt-14 pb-12 text-center sm:pt-20 sm:pb-16">
        <p
          lang="ar"
          dir="rtl"
          className="arabic-text text-center! text-5xl leading-[1.3]! text-primary/85 sm:text-8xl"
        >
          الجامع الكامل
        </p>
        <h1 className="mt-4 font-sans text-sm font-semibold tracking-[0.18em] text-foreground uppercase">
          {bn ? "আল-জামি‘ আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {bn
            ? "সহীহ হাদীসের পূর্ণাঙ্গ ও সর্বব্যাপী সংকলন, ফিকহের অধ্যায় অনুযায়ী বিন্যস্ত"
            : "The Complete Comprehensive Collection of Authentic Hadith, Arranged According to the Chapters of Fiqh"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {bn ? "দিয়াউর রহমান আল-আযমী" : "Ḍiyāʾ al-Raḥmān al-Aʿẓamī"}
          <span className="mx-2 text-gold">◆</span>
          {bn ? "অনুবাদ: " : "Translated by "}
          <span className="font-medium text-foreground">
            {bn ? "সাদমান জারিফ তালহা" : "Sadman Zarif Talha"}
          </span>
        </p>

        <form
          id="site-search-guide"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} });
          }}
          className="group relative mx-auto mt-8 max-w-2xl rounded-full"
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            type="search"
            enterKeyHint="search"
            aria-label={bn ? "হাদীস অনুসন্ধান" : "Search hadith"}
            placeholder={
              bn ? "নম্বর, শব্দ বা বিষয় দিয়ে খুঁজুন…" : "Search by number, word or topic…"
            }
            className="h-14 w-full rounded-full border border-border bg-card pr-28 pl-13 text-base text-foreground shadow-sm transition-shadow outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-md"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 h-10 -translate-y-1/2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {bn ? "খুঁজুন" : "Search"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href="#collection" className={pill}>
            <List className="size-4 text-primary" aria-hidden />
            {bn ? "কিতাবের তালিকা" : "Book List"}
          </a>
          <Link to="/bookmarks" className={pill}>
            <Bookmark className="size-4 text-primary" aria-hidden />
            {bn ? "বুকমার্ক" : "Bookmarks"}
          </Link>
          <button type="button" onClick={onGuide} className={pill}>
            <HelpCircle className="size-4 text-primary" aria-hidden />
            {bn ? "ওয়েবসাইট গাইড" : "Website guide"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ContinueCard({ bn }: { bn: boolean }) {
  const latest = useReadingHistory()[0];
  const number = latest?.number ?? 1;
  const num = bn ? toBengaliDigits(number) : String(number);
  const where = latest?.chapterTitle ?? latest?.bookTitle;

  return (
    <Link
      to="/hadith/$number"
      params={{ number: String(number) }}
      className="group flex items-center gap-5 rounded-2xl border border-border bg-card px-5 py-4 font-sans shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-7 sm:py-5"
    >
      <span
        lang="ar"
        dir="rtl"
        className="arabic-text hidden w-20 shrink-0 text-center text-3xl! leading-none! text-primary sm:block"
      >
        {toArabicIndicDigits(number)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {latest
            ? bn
              ? "পড়া চালিয়ে যান"
              : "Continue reading"
            : bn
              ? "এখান থেকে শুরু করুন"
              : "Start reading"}
        </span>
        <span className="mt-1 block truncate text-lg font-semibold text-foreground">
          {bn ? "হাদীস" : "Hadith"} {num}
          {where ? <span className="font-normal text-muted-foreground"> · {where}</span> : null}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
        {latest ? (bn ? "চালিয়ে যান" : "Continue") : bn ? "শুরু করুন" : "Begin"}
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function BookGrid({ bn }: { bn: boolean }) {
  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const [desc, setDesc] = useState(false);
  const list = desc ? [...(books.data ?? [])].reverse() : (books.data ?? []);
  const digits = (n: number) => (bn ? toBengaliDigits(n) : String(n));

  return (
    <section
      id="collection"
      aria-labelledby="collection-heading"
      className="scroll-mt-20 font-sans"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="collection-heading"
          className="font-sans text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
        >
          {bn ? "সংকলন" : "The Collection"}
          {books.data ? (
            <span className="ml-2 font-normal tracking-normal">· {digits(books.data.length)}</span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setDesc((d) => !d)}
          aria-pressed={desc}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowDownUp className="size-3.5" aria-hidden />
          {desc ? (bn ? "অবরোহী" : "Descending") : bn ? "আরোহী" : "Ascending"}
        </button>
      </div>

      {books.isLoading ? (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <li key={i} className="h-[76px] animate-pulse rounded-xl bg-accent/60" />
          ))}
        </ul>
      ) : null}
      {books.error ? (
        <p className="text-sm text-destructive">
          {bn ? "কিতাবগুলো লোড করা যায়নি।" : "Could not load the books."}
        </p>
      ) : null}

      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((book) => {
          const title = bn
            ? (getBengaliBookTitle(book.book_number) ?? cleanNumberedTitle(book.title_en, "book"))
            : cleanNumberedTitle(book.title_en, "book");
          return (
            <li key={book.id}>
              <Link
                to="/book/$number"
                params={{ number: String(book.book_number) }}
                className="group flex h-full items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-primary/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid size-10 shrink-0 place-items-center">
                  <span className="grid size-8 rotate-45 place-items-center rounded-md bg-accent transition-colors group-hover:bg-primary">
                    <span className="-rotate-45 text-sm font-semibold text-foreground group-hover:text-primary-foreground">
                      {digits(book.book_number)}
                    </span>
                  </span>
                </span>
                <span
                  className="min-w-0 flex-1 text-[15px] leading-snug font-semibold text-foreground"
                  lang={bn ? "bn" : "en"}
                >
                  {title || book.title_ar}
                </span>
                {book.title_ar ? (
                  <span
                    lang="ar"
                    dir="rtl"
                    className="arabic-text line-clamp-2 max-w-[42%] text-right text-base! leading-snug! text-muted-foreground"
                  >
                    {book.title_ar}
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

export function AboutSection({ bn }: { bn: boolean }) {
  const stats = useQuery({ queryKey: ["library-stats"], queryFn: fetchLibraryStats });
  const digits = (n: number) => (bn ? toBengaliDigits(n) : n.toLocaleString("en-US"));
  const items: [string, string][] = [
    [stats.data ? digits(stats.data.books) : "66", bn ? "কিতাব" : "Books"],
    [stats.data ? digits(stats.data.hadiths) : "16,546", bn ? "হাদীস" : "Hadiths"],
    [bn ? "২০০+" : "200+", bn ? "উৎস গ্রন্থ" : "Source works"],
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="grid scroll-mt-20 gap-10 border-t border-border pt-14 lg:grid-cols-[1fr_18rem]"
    >
      <div>
        <h2
          id="about-heading"
          className="font-sans text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
        >
          {bn ? "এই গ্রন্থাগার সম্পর্কে" : "About this library"}
        </h2>
        <AboutLibrary bn={bn} className="mt-4 max-w-3xl text-[15px]" />
      </div>
      <dl className="grid grid-cols-3 gap-4 self-start font-sans lg:grid-cols-1">
        {items.map(([value, label]) => (
          <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-primary tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
