import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { IntroText } from "@/components/library/IntroText";
import { HadithView } from "@/components/library/HadithView";
import { Button } from "@/components/ui/button";
import { fetchHadithByNumber, fetchHadithContext, fetchNeighbours } from "@/lib/library-api";

export const Route = createFileRoute("/hadith/$number")({
  head: ({ params }) => {
    const title = `Hadith ${params.number} — Al-Jāmiʿ al-Kāmil`;
    const description = `Read hadith number ${params.number} of Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil in full: complete Arabic text, English translation, references, grading and commentary.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: HadithPage,
});

function HadithPage() {
  const { number } = Route.useParams();
  const hadithNumber = Number(number);

  const hadith = useQuery({
    queryKey: ["hadith", hadithNumber],
    queryFn: () => fetchHadithByNumber(hadithNumber),
    enabled: Number.isFinite(hadithNumber),
  });

  const context = useQuery({
    queryKey: ["hadith-context", hadith.data?.id],
    queryFn: () => fetchHadithContext(hadith.data!),
    enabled: !!hadith.data,
  });

  const neighbours = useQuery({
    queryKey: ["hadith-neighbours", hadithNumber],
    queryFn: () => fetchNeighbours(hadithNumber),
    enabled: Number.isFinite(hadithNumber),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Library
          </Link>
          <div className="flex items-center gap-2">
            {neighbours.data?.previous ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/hadith/$number" params={{ number: String(neighbours.data.previous) }}>
                  <ChevronLeft /> {neighbours.data.previous}
                </Link>
              </Button>
            ) : null}
            {neighbours.data?.next ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/hadith/$number" params={{ number: String(neighbours.data.next) }}>
                  {neighbours.data.next} <ChevronRight />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {hadith.isLoading ? <p className="text-muted-foreground">Loading hadith…</p> : null}
        {hadith.error ? (
          <p className="text-destructive">This hadith could not be loaded.</p>
        ) : null}
        {!hadith.isLoading && !hadith.data ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="text-lg font-semibold">Hadith {number} has not been imported yet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hadith numbers run from 1 to 16,546. This number is not yet present in the library.
            </p>
          </div>
        ) : null}
        {hadith.data ? (
          <div className="space-y-4">
            <IntroText intro={context.data?.chapter} label="Chapter introduction" />
            <HadithView hadith={hadith.data} context={context.data} />
            <nav
              aria-label="Hadith navigation"
              className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              {neighbours.data?.previous ? (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link
                    to="/hadith/$number"
                    params={{ number: String(neighbours.data.previous) }}
                  >
                    <ChevronLeft /> Previous hadith {neighbours.data.previous}
                  </Link>
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              {neighbours.data?.next ? (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/hadith/$number" params={{ number: String(neighbours.data.next) }}>
                    Next hadith {neighbours.data.next} <ChevronRight />
                  </Link>
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
            </nav>
          </div>
        ) : null}
      </main>
    </div>
  );
}
