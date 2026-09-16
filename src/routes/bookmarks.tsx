import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookmarkX, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { toArabicIndicDigits } from "@/lib/normalize";

export const Route = createFileRoute("/bookmarks")({
  head: () => {
    const title = "Saved Hadiths — Al-Jāmiʿ al-Kāmil";
    const description =
      "Your bookmarked hadiths from Al-Jāmiʿ al-Kāmil, saved on this device with their Book, Collection and Chapter context.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BookmarksPage,
});

function BookmarksPage() {
  const { bookmarks, remove } = useBookmarks();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">Al-Jāmiʿ al-Kāmil</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold text-foreground">Bookmarks</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Hadiths you saved are kept on this device. No account is needed.
        </p>

        {bookmarks.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-medium text-foreground">No saved hadiths yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Open any hadith and tap “Bookmark” beside its number. Saved hadiths appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {bookmarks.map((b) => (
              <li
                key={b.number}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link
                    to="/hadith/$number"
                    params={{ number: String(b.number) }}
                    className="min-w-0 flex-1"
                  >
                    <span className="flex items-baseline gap-2 text-base font-semibold text-primary">
                      Hadith {b.number}
                      <span className="arabic-text text-base! leading-none! text-muted-foreground">
                        {toArabicIndicDigits(b.number)}
                      </span>
                    </span>
                    <span className="mt-1 block space-y-0.5 text-sm text-muted-foreground">
                      {b.bookTitle ? <span className="block">{b.bookTitle}</span> : null}
                      {b.collectionTitle ? <span className="block">{b.collectionTitle}</span> : null}
                      {b.chapterTitle ? <span className="block">{b.chapterTitle}</span> : null}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(b.number)}
                    aria-label={`Remove hadith ${b.number} from bookmarks`}
                  >
                    <BookmarkX aria-hidden /> Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="outline" className="mt-10">
          <Link to="/">
            <ArrowLeft aria-hidden /> Back to the library
          </Link>
        </Button>
      </main>
    </div>
  );
}
