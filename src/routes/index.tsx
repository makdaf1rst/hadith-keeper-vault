import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark as BookmarkIcon,
  BookOpen,
  EllipsisVertical,
  FolderKanban,
  Mail,
} from "lucide-react";

import { LibraryTree } from "@/components/library/LibraryTree";
import { SearchPanel } from "@/components/library/SearchPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchLibraryStats } from "@/lib/library-api";

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

function Index() {
  const stats = useQuery({ queryKey: ["library-stats"], queryFn: fetchLibraryStats });

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
                      Bookmarks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/announcements" className="cursor-pointer">
                      <Bell aria-hidden />
                      Announcements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="cursor-pointer">
                      <FolderKanban aria-hidden />
                      Other Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contact" className="cursor-pointer">
                      <Mail aria-hidden />
                      Contact
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
              <BookOpen className="size-4" aria-hidden /> Contents
            </h2>
            <LibraryTree />
          </aside>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="border-b border-border pb-4">
              <p className="english-text text-base font-medium text-foreground">
                Ḍiyāʾ al-Raḥmān al-Aʿẓamī
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.data
                  ? `${stats.data.books} Books · ${stats.data.hadiths} hadiths imported of 16,546`
                  : "Bilingual Arabic–English collection"}
              </p>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">About this library</h2>
            <div className="english-text mt-3 space-y-4 leading-7 text-muted-foreground">
              <p>
                Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī (ضياء الرحمن الأعظمي) was a distinguished scholar of Ḥadīth and a professor at the Islamic University of Madinah. Among his greatest scholarly achievements is <em>Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil al-Murattab ʿalā Abwāb al-Fiqh</em>, a monumental effort to gather the reliable Sunnah of the Messenger of Allah ﷺ into one comprehensive and systematically arranged collection.
              </p>
              <p>
                In preparing this work, Shaykh al-Aʿẓamī drew upon more than 200 books of Ḥadīth and surveyed a vast body of narrations that he estimated at approximately 60,000 distinct hadith texts after repetitions were removed. Through extensive research, comparison, verification, and grading, he compiled 16,546 numbered narrations in the final collection. One of the defining features of the work is its focus on accepted narrations — Ṣaḥīḥ (Authentic) and Ḥasan (Good) hadiths — arranged according to the books and chapters of Islamic jurisprudence.
              </p>
              <p>
                This English translation is a humble effort to make this great work more accessible to English-speaking readers and to contribute, in whatever small measure we can, to the preservation and spread of the Sunnah of the Messenger of Allah ﷺ.
              </p>
              <p>
                We ask Allah to overlook our mistakes and shortcomings, place sincerity and benefit in this effort, reward Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī abundantly for his service to the Sunnah, and accept this deed from us solely for His sake. Āmīn.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
