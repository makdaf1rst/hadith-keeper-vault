import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { fetchBookByNumber, fetchChapters, fetchCollections } from "@/lib/library-api";

export const Route = createFileRoute("/book/$number")({
  head: ({ params }) => {
    const title = `Book ${params.number} — Jāmiʿ al-Kāmil Hadith Library`;
    const description = `Collections and chapters of Book ${params.number} of Jāmiʿ al-Kāmil, with complete Arabic and English headings.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BookPage,
});

function BookPage() {
  const { number } = Route.useParams();
  const bookNumber = Number(number);

  const book = useQuery({
    queryKey: ["book", bookNumber],
    queryFn: () => fetchBookByNumber(bookNumber),
    enabled: Number.isFinite(bookNumber),
  });
  const collections = useQuery({
    queryKey: ["collections", book.data?.id],
    queryFn: () => fetchCollections(book.data!.id),
    enabled: !!book.data,
  });
  const chapters = useQuery({
    queryKey: ["chapters", book.data?.id],
    queryFn: () => fetchChapters(book.data!.id),
    enabled: !!book.data,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Library
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {book.isLoading ? <p className="text-muted-foreground">Loading book…</p> : null}
        {!book.isLoading && !book.data ? (
          <p className="text-muted-foreground">Book {number} has not been imported yet.</p>
        ) : null}
        {book.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Book {book.data.book_number}
                {book.data.title_en ? ` — ${book.data.title_en}` : ""}
              </h1>
              {book.data.title_ar ? <p className="arabic-text">{book.data.title_ar}</p> : null}
            </div>

            {(collections.data ?? []).map((collection) => (
              <section key={collection.id} className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">{collection.title_en ?? "Collection"}</h2>
                {collection.title_ar ? (
                  <p className="arabic-text">{collection.title_ar}</p>
                ) : null}
                <ul className="mt-3 space-y-2">
                  {(chapters.data ?? [])
                    .filter((chapter) => chapter.collection_id === collection.id)
                    .map((chapter) => (
                      <li key={chapter.id} className="border-l-2 border-border pl-3">
                        <p className="text-sm font-medium">
                          {chapter.chapter_number ? `Chapter ${chapter.chapter_number}` : "Chapter"}
                          {chapter.title_en ? ` — ${chapter.title_en}` : ""}
                        </p>
                        {chapter.title_ar ? (
                          <p className="arabic-text text-lg! leading-relaxed!">{chapter.title_ar}</p>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </>
        ) : null}
      </main>
    </div>
  );
}
