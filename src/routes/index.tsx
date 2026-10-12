// Production rebuild marker: author-translator credits
// Production rebuild marker: Library Menu
// Deployment sync marker: home language toggle
// Lovable sync marker: Book 43 QC deployment
// Lovable sync marker: Book 66 QC deployment
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bookmark as BookmarkIcon,
  BookOpen,
  Download,
  Languages,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { RecentChips } from "@/components/library/ContinueReading";
import { AboutSection, BookGrid, ContinueCard, HomeHero } from "@/components/library/HomeDesktop";
import { LibraryTree } from "@/components/library/LibraryTree";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/library-api";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";

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
    links: [{ rel: "canonical", href: "https://jami-al-kamil.com/" }],
  }),
  component: Index,
});

// Bengali library summary and numerals follow the selected interface language.
function Index() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const t = useInterfaceText();
  const { interfaceLanguage } = useLanguage();
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
    if (tourStep === null) return;
    const target = tourSteps[tourStep]?.target;
    if (!target) return;
    const el = document.getElementById(target);
    const ring = ["ring-4", "ring-primary", "ring-offset-4", "ring-offset-background"];
    el?.classList.add(...ring);
    const timer = window.setTimeout(() => {
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => {
      window.clearTimeout(timer);
      el?.classList.remove(...ring);
    };
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
      <header className="hidden px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] font-sans [.app_&]:block">
        <img
          src="/jami-al-kamil-logo.png"
          alt="Al-Jami al-Kamil — الجامع الكامل"
          className="mx-auto h-24 w-auto max-w-[80%] object-contain"
        />
        <h1 className="mt-4 font-sans text-3xl font-bold text-foreground">{t.library}</h1>
      </header>
      <HomeHero bn={isBengali} onGuide={() => setGuideOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 [.app_&]:pt-4">
        <RecentChips />
        <div className="mx-auto max-w-6xl space-y-14 pt-4 [.app_&]:hidden">
          <ContinueCard bn={isBengali} />
          <BookGrid bn={isBengali} />
          <AboutSection bn={isBengali} />
        </div>

        {/* app only: the website uses BookGrid above */}
        <div className="hidden [.app_&]:mt-6 [.app_&]:block">
          <aside className="rounded-lg border border-border bg-sidebar p-3 [.app_&]:border-0 [.app_&]:bg-transparent [.app_&]:p-0">
            <h2 className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold tracking-wide text-sidebar-foreground uppercase [.app_&]:px-4 [.app_&]:font-sans [.app_&]:text-xs [.app_&]:text-muted-foreground">
              <BookOpen className="size-4" aria-hidden /> {t.contents}
            </h2>
            <LibraryTree selectedBookId={selectedBook?.id ?? null} onSelectBook={setSelectedBook} />
          </aside>
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
