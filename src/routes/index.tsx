// Production rebuild marker: author-translator credits
// Production rebuild marker: Library Menu
// Deployment sync marker: home language toggle
// Lovable sync marker: Book 43 QC deployment
// Lovable sync marker: Book 66 QC deployment
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark as BookmarkIcon,
  BookOpen,
  Download,
  Menu,
  FolderKanban,
  Mail,
  ShieldCheck,
  Languages,
  Settings,
  HelpCircle,
  Search,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ContinueReading } from "@/components/library/ContinueReading";
import { IntroText } from "@/components/library/IntroText";
import { LibraryTree } from "@/components/library/LibraryTree";
import { SearchPanel } from "@/components/library/SearchPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import { getBookIntroDisplayOverride } from "@/lib/book-intro-overrides";
import { fetchBengaliChapterTranslation } from "@/lib/bengali-translations";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import {
  fetchChapterHadiths,
  fetchChapters,
  fetchLibraryStats,
  type Book,
  type Chapter,
} from "@/lib/library-api";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { toArabicIndicDigits, toBengaliDigits } from "@/lib/normalize";

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
  if (getBookIntroDisplayOverride(book.book_number)) return true;
  return [
    book.intro_ar_display,
    book.intro_ar_source,
    book.intro_en_display,
    book.intro_en_source,
  ].some((value) => value && value.trim().length > 0);
}

function SelectedChapter({ chapter, bookNumber }: { chapter: Chapter; bookNumber: number }) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const bengali = useQuery({
    queryKey: ["bengali-selected-chapter", bookNumber, chapter.id],
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
  const hadiths = useQuery({
    queryKey: ["selected-book-chapter-hadiths", chapter.id],
    queryFn: () => fetchChapterHadiths(chapter.id),
  });

  return (
    <li className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-semibold text-foreground">
        {bn?.title_bn ??
          (formatChapterTitle(chapter.chapter_number, chapter.title_en) || t.chapter)}
      </p>
      {chapter.title_ar ? (
        <p className="arabic-text mt-1 text-base! leading-relaxed! text-muted-foreground">
          {chapter.title_ar}
        </p>
      ) : null}
      <IntroText intro={chapter} bengaliIntro={bn} className="mt-2" label={t.chapterIntroduction} />
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
                {contentLanguage === "bn"
                  ? toBengaliDigits(hadith.hadith_number)
                  : hadith.hadith_number}
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
  const { contentLanguage } = useLanguage();
  const chapters = useQuery({
    queryKey: ["selected-book-chapters", book.id, "v2"],
    queryFn: () => fetchChapters(book.id),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {contentLanguage === "bn"
          ? (getBengaliBookTitle(book.book_number) ??
            formatBookTitle(book.book_number, book.title_en))
          : formatBookTitle(book.book_number, book.title_en)}
      </h2>
      {book.title_ar ? (
        <p className="arabic-text mt-1 text-base! leading-relaxed! text-muted-foreground">
          {toArabicIndicDigits(book.book_number)}. {book.title_ar}
        </p>
      ) : null}
      {hasIntro(book) ? (
        <IntroText
          intro={book}
          bengaliIntro={contentLanguage === "bn" ? getBengaliBookIntro(book.book_number) : null}
          className="mt-3"
          label={t.bookIntroduction}
        />
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-base font-semibold text-foreground">
          {t.babs}{" "}
          {chapters.data
            ? `(${contentLanguage === "bn" ? toBengaliDigits(chapters.data.length) : chapters.data.length})`
            : ""}
        </h3>
        {chapters.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.loading}</p>
        ) : chapters.data?.length ? (
          <ul className="mt-3 space-y-3">
            {chapters.data
              .filter((chapter) => !chapter.collection_id)
              .map((chapter) => (
                <SelectedChapter key={chapter.id} chapter={chapter} bookNumber={book.book_number} />
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t.noChaptersYet}</p>
        )}
      </div>
    </>
  );
}

// Bengali library summary and numerals follow the selected interface language.
function Index() {
  const stats = useQuery({ queryKey: ["library-stats"], queryFn: fetchLibraryStats });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const t = useInterfaceText();
  const { interfaceLanguage, contentLanguage, setInterfaceLanguage, setContentLanguage } =
    useLanguage();
  const isBengali = interfaceLanguage === "bn";

  const tourSteps = isBengali
    ? [
        {
          title: "দ্রুত অনুসন্ধান",
          text: "হাদীস নম্বর, ইংরেজি বা বাংলা শব্দ দিয়ে পুরো গ্রন্থাগারে অনুসন্ধান করুন।",
          target: "site-search-guide",
        },
        {
          title: "ভাষা পরিবর্তন",
          text: "এক ট্যাপে ইংরেজি ও বাংলা ইন্টারফেস এবং অনুবাদের মধ্যে পরিবর্তন করুন।",
          target: "language-switch-guide",
        },
        {
          title: "লাইব্রেরি মেনু",
          text: "বুকমার্ক, ডাউনলোড, ব্যবহৃত গ্রন্থ, সাহাবী বর্ণনাকারী, ঘোষণা, অন্যান্য প্রকল্প ও যোগাযোগ এখানে পাবেন।",
          target: "library-menu-guide",
        },
        {
          title: "বুকমার্ক",
          text: "যেকোনো হাদীস ডিভাইসে সংরক্ষণ করুন। My Bookmarks থেকে ব্যাকআপ ফাইল তৈরি করে অন্য ডিভাইসে পুনরুদ্ধার করতে পারবেন।",
          target: null,
        },
        {
          title: "আগের ও পরের হাদীস",
          text: "হাদীস পড়ার সময় Previous ও Next ব্যবহার করে ধারাবাহিকভাবে পুরো সংগ্রহে এগিয়ে যান।",
          target: null,
        },
      ]
    : [
        {
          title: "Search quickly",
          text: "Search the entire library by hadith number or by English or Bangla words.",
          target: "site-search-guide",
        },
        {
          title: "Switch language",
          text: "Change between the English and Bangla interface and translations with one tap.",
          target: "language-switch-guide",
        },
        {
          title: "Library Menu",
          text: "Find bookmarks, downloads, books used, Sahabah narrators, announcements, other projects, and contact here.",
          target: "library-menu-guide",
        },
        {
          title: "Bookmarks",
          text: "Save any hadith on your device. From My Bookmarks you can create a backup file and restore it on another device.",
          target: null,
        },
        {
          title: "Previous and Next",
          text: "While reading a hadith, use Previous and Next to move continuously through the collection.",
          target: null,
        },
      ];

  useEffect(() => {
    try {
      if (!window.localStorage.getItem("jami-al-kamil-website-guide-seen-v1")) {
        setGuideOpen(true);
      }
    } catch {
      // The guide still remains available from Library Menu.
    }
  }, []);

  useEffect(() => {
    if (tourStep === null) return;
    const target = tourSteps[tourStep]?.target;
    if (!target) return;
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [tourStep, isBengali]);

  function markGuideSeen() {
    try {
      window.localStorage.setItem("jami-al-kamil-website-guide-seen-v1", "1");
    } catch {
      // Ignore storage failures.
    }
  }

  function closeGuide() {
    markGuideSeen();
    setGuideOpen(false);
  }

  function startTour() {
    markGuideSeen();
    setGuideOpen(false);
    setTourStep(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative border-b border-border bg-parchment">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = isBengali ? "en" : "bn";
            setInterfaceLanguage(next);
            setContentLanguage(next);
          }}
          id="language-switch-guide"
          className={`absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-10 h-9 rounded-full border-gold/40 bg-background/90 px-3 shadow-sm backdrop-blur hover:bg-accent sm:left-6 ${tourStep === 1 ? "ring-4 ring-primary ring-offset-4 ring-offset-background" : ""}`}
          aria-label={isBengali ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          title={isBengali ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
        >
          <Languages className="size-4" aria-hidden />
          <span className="font-medium">{isBengali ? "English" : "বাংলা"}</span>
        </Button>
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pt-16 pb-6 sm:px-6 sm:pt-6 lg:px-8">
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
                <p className="mt-1 text-base font-medium text-foreground">
                  {isBengali
                    ? "সহীহ হাদীসের পূর্ণাঙ্গ ও সর্বব্যাপী সংকলন, ফিকহের অধ্যায় অনুযায়ী বিন্যস্ত"
                    : "The Complete Comprehensive Collection of Authentic Hadith, Arranged According to the Chapters of Fiqh"}
                </p>
                <div className="mt-3 space-y-2 text-center text-muted-foreground">
                  <div>
                    <p className="arabic-text text-center! text-base! leading-snug!">
                      المصنِّف: ضياء الرحمن الأعظمي
                    </p>
                    <p className="mt-0.5 text-sm font-medium">
                      {isBengali
                        ? "গ্রন্থকার: দিয়াউর রহমান আল-আযমী"
                        : "Author: Ḍiyāʾ al-Raḥmān al-Aʿẓamī"}
                    </p>
                  </div>
                  <div>
                    <p className="arabic-text text-center! text-base! leading-snug!">
                      ترجمة: سدمان ظريف طلحة
                    </p>
                    <p className="mt-0.5 text-sm font-medium">
                      {isBengali
                        ? "অনুবাদ: সাদমান জারিফ তালহা"
                        : "Translated by: Sadman Zarif Talha"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    id="library-menu-guide"
                    className={`h-9 gap-2 rounded-full border-gold/40 bg-background/90 px-3 text-foreground shadow-sm backdrop-blur hover:bg-accent ${tourStep === 2 ? "ring-4 ring-primary ring-offset-4 ring-offset-background" : ""}`}
                    aria-label={
                      interfaceLanguage === "bn" ? "লাইব্রেরি মেনু খুলুন" : "Open Library Menu"
                    }
                    title={interfaceLanguage === "bn" ? "লাইব্রেরি মেনু" : "Library Menu"}
                  >
                    <Menu className="size-4" aria-hidden />
                    <span className="font-medium">
                      {interfaceLanguage === "bn" ? "লাইব্রেরি মেনু" : "Library Menu"}
                    </span>
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
                    <Link to="/downloads" className="cursor-pointer">
                      <Download aria-hidden />
                      {interfaceLanguage === "bn" ? "ডাউনলোড" : "Downloads"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={
                        contentLanguage === "bn"
                          ? "https://drive.google.com/file/d/1c5KMFNUTWDgYVqAGU1hKgU6fv9EgsFen/view"
                          : "https://drive.google.com/file/d/10_ZkVs3B4kIlxTnMSYy982FwMmAxSSFY/view"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <BookOpen aria-hidden />
                      {interfaceLanguage === "bn"
                        ? "আল-জামি‘ আল-কামিলে ব্যবহৃত গ্রন্থসমূহ"
                        : "Books Used in al-Jāmiʿ al-Kāmil"}
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={
                        contentLanguage === "bn"
                          ? "https://drive.google.com/file/d/1UVM6aDTx6YNbOZP8uvP4bNghx7dwxJUI/view"
                          : "https://drive.google.com/file/d/19C5NU_lLYtPqTSS-h1PhVxxaWQXdQq49/view"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <BookOpen aria-hidden />
                      {interfaceLanguage === "bn"
                        ? "আল-জামি‘ আল-কামিলের সাহাবী বর্ণনাকারীগণ"
                        : "Sahabah Narrators in al-Jāmiʿ al-Kāmil"}
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Settings aria-hidden />
                      {interfaceLanguage === "bn" ? "ভাষা" : "Language"}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-parchment">
                      <DropdownMenuRadioGroup
                        value={contentLanguage}
                        onValueChange={(value) => {
                          const language = value === "bn" ? "bn" : "en";
                          setInterfaceLanguage(language);
                          setContentLanguage(language);
                        }}
                      >
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bn">বাংলা</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
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
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => setGuideOpen(true)}>
                    <HelpCircle aria-hidden />
                    {isBengali ? "ওয়েবসাইট গাইড" : "Website Guide"}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contact" className="cursor-pointer">
                      <Mail aria-hidden />
                      {t.contact}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/privacy" className="cursor-pointer">
                      <ShieldCheck aria-hidden />
                      {t.privacy}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ContinueReading />
        <div
          id="site-search-guide"
          className={
            tourStep === 0
              ? "rounded-xl ring-4 ring-primary ring-offset-4 ring-offset-background"
              : ""
          }
        >
          <SearchPanel />
        </div>

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
                  ? isBengali
                    ? `${toBengaliDigits(stats.data.books)} কিতাব · মোট ${toBengaliDigits(stats.data.hadiths)} হাদিস`
                    : `${stats.data.books} ${t.booksLabel} · ${stats.data.hadiths} ${t.importedStats}`
                  : t.bilingualCollection}
              </p>
            </div>
            {selectedBook ? (
              <SelectedBookContents book={selectedBook} />
            ) : (
              <>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {isBengali ? "এই গ্রন্থাগার সম্পর্কে" : "About this library"}
                </h2>
                <div className="mt-3 space-y-4 leading-7 text-muted-foreground">
                  {isBengali ? (
                    <>
                      <p>
                        শাইখ দিয়া আল-রহমান আল-আযমী (ضياء الرحمن الأعظمي) ছিলেন হাদীসের একজন বিশিষ্ট
                        আলিম এবং মদিনা ইসলামী বিশ্ববিদ্যালয়ের অধ্যাপক। তাঁর অন্যতম শ্রেষ্ঠ ইলমী
                        কীর্তি হলো{" "}
                        <em>
                          আল-জামি‘ আল-কামিল ফি আল-হাদীস আস-সহীহ আশ-শামিল আল-মুরাত্তাব ‘আলা আবওয়াব
                          আল-ফিকহ
                        </em>
                        — রাসূলুল্লাহ ﷺ-এর নির্ভরযোগ্য সুন্নাহকে এক সুবিস্তৃত ও সুসংগঠিত সংকলনে
                        একত্র করার এক মহৎ প্রচেষ্টা।
                      </p>
                      <p>
                        এই গ্রন্থ প্রস্তুত করতে শাইখ আল-আযমী ২০০টিরও বেশি হাদীসগ্রন্থ থেকে উপকরণ
                        গ্রহণ করেন এবং পুনরাবৃত্তি বাদ দিয়ে আনুমানিক ৬০,০০০ স্বতন্ত্র হাদীসের বিশাল
                        ভাণ্ডার পর্যালোচনা করেন। ব্যাপক গবেষণা, তুলনা, যাচাই ও হাদীসের মান
                        নির্ধারণের মাধ্যমে তিনি চূড়ান্ত সংকলনে ১৬,৫৪৬টি নম্বরযুক্ত বর্ণনা
                        অন্তর্ভুক্ত করেন। এই গ্রন্থের অন্যতম বৈশিষ্ট্য হলো গ্রহণযোগ্য বর্ণনা—সহীহ ও
                        হাসান হাদীস—এর ওপর গুরুত্ব, যা ইসলামী ফিকহের কিতাব ও অধ্যায় অনুযায়ী
                        বিন্যস্ত।
                      </p>
                      <p>
                        এই বাংলা অনুবাদ মহান এই গ্রন্থকে বাংলা ভাষাভাষী পাঠকদের জন্য আরও সহজলভ্য
                        করার এবং রাসূলুল্লাহ ﷺ-এর সুন্নাহ সংরক্ষণ ও প্রচারে আমাদের সামর্থ্য অনুযায়ী
                        ক্ষুদ্র অবদান রাখার একটি বিনীত প্রচেষ্টা।
                      </p>
                      <p>
                        আমরা আল্লাহর কাছে প্রার্থনা করি, তিনি আমাদের ভুল ও ত্রুটি ক্ষমা করুন, এই
                        প্রচেষ্টায় ইখলাস ও উপকার দান করুন, সুন্নাহর খেদমতের জন্য শাইখ দিয়া
                        আল-রহমান আল-আযমীকে অফুরন্ত প্রতিদান দিন এবং এই কাজটি কেবল তাঁর সন্তুষ্টির
                        জন্য আমাদের পক্ষ থেকে কবুল করুন। আমীন।
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī (ضياء الرحمن الأعظمي) was a distinguished
                        scholar of Ḥadīth and a professor at the Islamic University of Madinah.
                        Among his greatest scholarly achievements is{" "}
                        <em>
                          Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil al-Murattab ʿalā Abwāb
                          al-Fiqh
                        </em>
                        , a monumental effort to gather the reliable Sunnah of the Messenger of
                        Allah ﷺ into one comprehensive and systematically arranged collection.
                      </p>
                      <p>
                        In preparing this work, Shaykh al-Aʿẓamī drew upon more than 200 books of
                        Ḥadīth and surveyed a vast body of narrations that he estimated at
                        approximately 60,000 distinct hadith texts after repetitions were removed.
                        Through extensive research, comparison, verification, and grading, he
                        compiled 16,546 numbered narrations in the final collection. One of the
                        defining features of the work is its focus on accepted narrations — Ṣaḥīḥ
                        (Authentic) and Ḥasan (Good) hadiths — arranged according to the books and
                        chapters of Islamic jurisprudence.
                      </p>
                      <p>
                        This English translation is a humble effort to make this great work more
                        accessible to English-speaking readers and to contribute, in whatever small
                        measure we can, to the preservation and spread of the Sunnah of the
                        Messenger of Allah ﷺ.
                      </p>
                      <p>
                        We ask Allah to overlook our mistakes and shortcomings, place sincerity and
                        benefit in this effort, reward Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī abundantly
                        for his service to the Sunnah, and accept this deed from us solely for His
                        sake. Āmīn.
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {guideOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="website-guide-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="website-guide-title" className="text-2xl font-semibold text-foreground">
                  {isBengali ? "আল-জামি‘ আল-কামিলে স্বাগতম" : "Welcome to Al-Jāmiʿ al-Kāmil"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isBengali
                    ? "কয়েক সেকেন্ডে গুরুত্বপূর্ণ সুবিধাগুলো জেনে নিন, যাতে এই হাদীস গ্রন্থাগার থেকে সর্বোচ্চ উপকার নিতে পারেন।"
                    : "Learn the most useful features in a few seconds so you can benefit from the hadith library immediately."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeGuide}
                aria-label="Close guide"
              >
                <X aria-hidden />
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [
                  Search,
                  isBengali ? "অনুসন্ধান" : "Search",
                  isBengali
                    ? "নম্বর বা শব্দ দিয়ে হাদীস খুঁজুন।"
                    : "Find hadiths by number or words.",
                ],
                [
                  Languages,
                  isBengali ? "ভাষা" : "Language",
                  isBengali
                    ? "ইংরেজি ও বাংলার মধ্যে পরিবর্তন করুন।"
                    : "Switch between English and Bangla.",
                ],
                [
                  BookmarkIcon,
                  isBengali ? "বুকমার্ক" : "Bookmarks",
                  isBengali
                    ? "ডিভাইসে সংরক্ষণ, ব্যাকআপ ও পুনরুদ্ধার করুন।"
                    : "Save on your device, then backup and restore.",
                ],
                [
                  Download,
                  isBengali ? "ডাউনলোড" : "Downloads",
                  isBengali
                    ? "অফলাইনে পড়ার জন্য উপলভ্য কনটেন্ট নিন।"
                    : "Get available content for offline study.",
                ],
                [
                  Menu,
                  isBengali ? "লাইব্রেরি মেনু" : "Library Menu",
                  isBengali
                    ? "গুরুত্বপূর্ণ সব টুল এক জায়গায়।"
                    : "All important library tools in one place.",
                ],
                [
                  ArrowLeftRight,
                  isBengali ? "আগের / পরের" : "Previous / Next",
                  isBengali
                    ? "হাদীস থেকে হাদীসে ধারাবাহিকভাবে যান।"
                    : "Move continuously from hadith to hadith.",
                ],
              ].map(([Icon, title, text], index) => {
                const FeatureIcon = Icon as typeof Search;
                return (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <FeatureIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">{title as string}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {text as string}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeGuide}>
                {isBengali ? "পড়া শুরু করুন" : "Start Reading"}
              </Button>
              <Button type="button" onClick={startTour}>
                {isBengali ? "আমাকে দেখিয়ে দিন" : "Show Me Around"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {tourStep !== null ? (
        <div className="pointer-events-none fixed inset-0 z-[90] bg-black/20">
          <div className="pointer-events-auto absolute right-4 bottom-4 left-4 mx-auto max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl sm:right-6 sm:bottom-6 sm:left-auto">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">
                {isBengali
                  ? `${toBengaliDigits(tourStep + 1)} / ${toBengaliDigits(tourSteps.length)}`
                  : `${tourStep + 1} / ${tourSteps.length}`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setTourStep(null)}
                aria-label="End tour"
              >
                <X aria-hidden />
              </Button>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {tourSteps[tourStep]?.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tourSteps[tourStep]?.text}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={tourStep === 0}
                onClick={() => setTourStep((step) => (step === null ? 0 : Math.max(0, step - 1)))}
              >
                {isBengali ? "পেছনে" : "Back"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (tourStep >= tourSteps.length - 1) {
                    setTourStep(null);
                  } else {
                    setTourStep(tourStep + 1);
                  }
                }}
              >
                {tourStep >= tourSteps.length - 1
                  ? isBengali
                    ? "শেষ"
                    : "Finish"
                  : isBengali
                    ? "পরবর্তী"
                    : "Next"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
