import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Library } from "lucide-react";

import { LibraryTree } from "@/components/library/LibraryTree";
import { SearchPanel } from "@/components/library/SearchPanel";
import { fetchLibraryStats } from "@/lib/library-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jāmiʿ al-Kāmil Hadith Library — Bilingual Arabic & English" },
      {
        name: "description",
        content:
          "Browse and search Jāmiʿ al-Kāmil: 66 Books and 16,546 numbered hadiths with complete Arabic text, English translation, references, grades and commentary.",
      },
      { property: "og:title", content: "Jāmiʿ al-Kāmil Hadith Library" },
      {
        property: "og:description",
        content:
          "A scholarly bilingual hadith library — collapsible Books, Collections, Chapters and full, unabridged hadith texts.",
      },
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
            <div className="flex items-center gap-3">
              <Library className="size-6 text-primary" aria-hidden />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Jāmiʿ al-Kāmil Hadith Library
                </h1>
                <p className="arabic-text text-2xl! leading-tight! text-muted-foreground">
                  جامع الكامل
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Admin
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.data
              ? `${stats.data.books} Books · ${stats.data.hadiths} hadiths imported of 16,546`
              : "Bilingual Arabic–English collection"}
          </p>
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
            <h2 className="text-lg font-semibold text-foreground">About this library</h2>
            <p className="mt-3 english-text text-muted-foreground">
              Every hadith in this library is stored exactly as it appears in the source documents.
              Nothing is summarised, shortened, or truncated: the Arabic text, the English
              translation, the Qurʾanic verses, references, gradings and commentary are all preserved
              in full and in their original order. Search previews are the only shortened text in the
              app, and opening any result always shows the complete entry.
            </p>
            <p className="mt-4 english-text text-muted-foreground">
              Use the contents panel to open a Book, then its Collections, Chapters, and hadiths.
              Hadith numbering is global across the whole collection, from 1 to 16,546, and every
              hadith has a permanent link of the form <code>/hadith/&lt;number&gt;</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
