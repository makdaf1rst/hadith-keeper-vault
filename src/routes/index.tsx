import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark as BookmarkIcon,
  BookOpen,
  EllipsisVertical,
  FolderKanban,
  Mail,
  Settings,
} from "lucide-react";
import { useState } from "react";

import { IntroText } from "@/components/library/IntroText";
import { LanguageSettingsDialog } from "@/components/library/LanguageSettingsDialog";
import { LibraryTree } from "@/components/library/LibraryTree";
import { SearchPanel } from "@/components/library/SearchPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import {
  fetchChapterHadiths,
  fetchChapters,
  fetchLibraryStats,
  type Book,
  type Chapter,
} from "@/lib/library-api";
import { useInterfaceText } from "@/lib/language";
import { toArabicIndicDigits } from "@/lib/normalize";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil — Ḍiyāʾ al-Raḥmān al-Aʿẓamī",
      },
      {
        name: "description",
        content:
          "The Complete Comprehensive Collection of Authentic Hadith, Arranged According to the Chapters of Fiqh, by Ḍiyāʾ al-Raḥmān al-Aʿẓamī. Browse and search 66 Books and 16,546 numbered hadiths with complete Arabic text, English translation, references, grades and commentary.",
      },
      {
        property: "og:title",
        content: "Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil — Ḍiyāʾ al-Raḥmān al-Aʿẓamī",
      },
      {
        property: "og:description",
        content:
          "The Complete Comprehensive Collection of Authentic Hadith, Arranged According to the Chapters of Fiqh — a scholarly bilingual Arabic–English hadith library by Ḍiyāʾ al-Raḥmān al-Aʿẓamī.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function hasIntro(book: Book | null): book is Book {
  if (!book) return false;
  return [
    book.intro_ar_display,
    book.intro_ar_source,
    book.intro_en_display,
    book.intro_en_source,
  ].some((value) => value && value.trim().length > 0);
}


function SelectedChapter({ chapter }: { chapter: Chapter }) {
  const t = useInterfaceText();
  const hadiths = useQuery({
    queryKey: ["selected-book-chapter-hadiths", chapter.id],
    queryFn: () => fetchChapterHadiths(chapter.id),
  });

  return (
    <li className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-semibold text-foreground">
        {formatChapterTitle(chapter.chapter_number, chapter.title_en) || t.chapter}
      </p>
      {chapter.title_ar ? (
        <p className="arabic-text mt-1 text-base! leading-relaxed! text-muted-foreground">
          {chapter.title_ar}
        </p>
      ) : null}
      <IntroText intro={chapter} className="mt-2" label={t.chapterIntroduction} />
      {hadiths.isLoading ? (
        <p className="mt-2 text-xs text-muted-foreground">{t.loadingHadiths}</p>
      ) : hadiths.data?.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {hadiths.data.map((hadith) => (
            <li key={hadith.id}>
              <Link
                to="/hadith/$number"
                params={{ number: String(hadith.hadith_number) }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {hadith.hadith_number}
                <span className="arabic-text text-sm! leading-none! text-muted-foreground">
                  {toArabicIndicDigits(hadith.hadith_number)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{t.noNumberedHadiths}</p>
      )}
    </li>
  );
}

function SelectedBookContents({ book }: { book: Book }) {
  const t = useInterfaceText();
  const chapters = useQuery({
    queryKey: ["selected-book-chapters", book.id, "v2"],
    queryFn: () => fetchChapters(book.id),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {formatBookTitle(book.book_number, book.title_en)}
      </h2>
      {book.title_ar ? (
        <p className="arabic-text mt-1 text-base! leading-relaxed! text-muted-foreground">
          {toArabicIndicDigits(book.book_number)}. {book.title_ar}
        </p>
      ) : null}
      {hasIntro(book) ? <IntroText intro={book} className="mt-3" label={t.bookIntroduction} /> : null}

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-base font-semibold text-foreground">
          {t.babs} {chapters.data ? `(${chapters.data.length})` : ""}
        </h3>
        {chapters.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.loading}</p>
        ) : chapters.data?.length ? (
          <ul className="mt-3 space-y-3">
            {chapters.data
              .filter((chapter) => !chapter.collection_id)
              .map((chapter) => (
                <SelectedChapter key={chapter.id} chapter={chapter} />
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t.noChaptersYet}</p>
        )}
      </div>
    </>
  );
}

function Index() {
  const stats = useQuery({ queryKey: ["library-stats"], queryFn: fetchLibraryStats });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [languageSettingsOpen, setLanguageSettingsOpen] = useState(false);
  const t = useInterfaceText();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-1 sm:flex-row sm:gap-8">
              <img
                src="/jami-al-kamil-logo.png"
                alt="Al-Jami al-Kamil — الجامع الكامل"
                className="h-20 w-auto shrink-0 sm:h-24"
              />
              <div className="min-w-0 flex-1 text-center">
                <h1 className="arabic-text text-center! text-2xl! font-semibold leading-tight! text-foreground">
                  الجامع الكامل في الحديث الصحيح الشامل المرتب على أبواب الفقه
                </h1>
                <p className="english-text mt-1 text-base font-medium text-foreground">
                  The Complete Comprehensive Collection of Authentic Hadith, Arranged According to
                  the Chapters of Fiqh
                </p>
                <p className="arabic-text mt-2 text-center! text-lg! leading-snug! text-muted-foreground">
                  ضياء الرحمن الأعظمي
                </p>
                <p className="english-text mt-1 text-center text-sm font-medium text-muted-foreground">
                  Ḍiyāʾ al-Raḥmān al-Aʿẓamī
                </p>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Open library menu"
                    title="Library menu"
                  >
                    <EllipsisVertical aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-parchment">
                  <DropdownMenuItem asChild>
                    <Link to="/bookmarks" className="cursor-pointer">
                      <BookmarkIcon aria-hidden />
                      {t.bookmarks}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/announcements" className="cursor-pointer">
                      <Bell aria-hidden />
                      {t.announcements}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="cursor-pointer">
                      <FolderKanban aria-hidden />
                      {t.otherProjects}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contact" className="cursor-pointer">
                      <Mail aria-hidden />
                      {t.contact}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SearchPanel />

        <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
          <aside className="rounded-lg border border-border bg-sidebar p-3">
            <h2 className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold tracking-wide text-sidebar-foreground uppercase">
              <BookOpen className="size-4" aria-hidden /> {t.contents}
            </h2>
            <LibraryTree selectedBookId={selectedBook?.id ?? null} onSelectBook={setSelectedBook} />
          </aside>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {stats.data
                  ? `${stats.data.books} ${t.booksLabel} · ${stats.data.hadiths} ${t.importedStats}`
                  : t.bilingualCollection}
              </p>
            </div>
            {selectedBook ? (
              <SelectedBookContents book={selectedBook} />
            ) : (
              <>
                <h2 className="mt-4 text-lg font-semibold text-foreground">About this library</h2>
                <div className="english-text mt-3 space-y-4 leading-7 text-muted-foreground">
                  <p>
                    Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī (ضياء الرحمن الأعظمي) was a distinguished
                    scholar of Ḥadīth and a professor at the Islamic University of Madinah. Among
                    his greatest scholarly achievements is{" "}
                    <em>
                      Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil al-Murattab ʿalā Abwāb
                      al-Fiqh
                    </em>
                    , a monumental effort to gather the reliable Sunnah of the Messenger of Allah ﷺ
                    into one comprehensive and systematically arranged collection.
                  </p>
                  <p>
                    In preparing this work, Shaykh al-Aʿẓamī drew upon more than 200 books of Ḥadīth
                    and surveyed a vast body of narrations that he estimated at approximately 60,000
                    distinct hadith texts after repetitions were removed. Through extensive
                    research, comparison, verification, and grading, he compiled 16,546 numbered
                    narrations in the final collection. One of the defining features of the work is
                    its focus on accepted narrations — Ṣaḥīḥ (Authentic) and Ḥasan (Good) hadiths —
                    arranged according to the books and chapters of Islamic jurisprudence.
                  </p>
                  <p>
                    This English translation is a humble effort to make this great work more
                    accessible to English-speaking readers and to contribute, in whatever small
                    measure we can, to the preservation and spread of the Sunnah of the Messenger of
                    Allah ﷺ.
                  </p>
                  <p>
                    We ask Allah to overlook our mistakes and shortcomings, place sincerity and
                    benefit in this effort, reward Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī abundantly for
                    his service to the Sunnah, and accept this deed from us solely for His sake.
                    Āmīn.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
