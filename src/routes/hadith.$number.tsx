import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";

import { IntroText } from "@/components/library/IntroText";
import { LanguageSettingsDialog } from "@/components/library/LanguageSettingsDialog";
import { HadithView } from "@/components/library/HadithView";
import { Button } from "@/components/ui/button";
import { fetchHadithByNumber, fetchHadithContext, fetchNeighbours } from "@/lib/library-api";
import { useInterfaceText } from "@/lib/language";

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
  const t = useInterfaceText();
  const [languageSettingsOpen, setLanguageSettingsOpen] = useState(false);
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
            <ArrowLeft className="size-4" /> {t.library}
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
        {hadith.isLoading ? <p className="text-muted-foreground">{t.loadingHadith}</p> : null}
        {hadith.error ? (
          <p className="text-destructive">{t.hadithLoadFailed}</p>
        ) : null}
        {!hadith.isLoading && !hadith.data ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="text-lg font-semibold">{t.hadith} {number} {t.hadithNotImported}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.hadithNumberRange}
            </p>
          </div>
        ) : null}
        {hadith.data ? (
          <div className="space-y-4">
            <IntroText intro={context.data?.chapter} label={t.chapterIntroduction} />
            <HadithView hadith={hadith.data} context={context.data} />
            <nav
              aria-label={t.hadithNavigation}
              className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              {neighbours.data?.previous ? (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link
                    to="/hadith/$number"
                    params={{ number: String(neighbours.data.previous) }}
                  >
                    <ChevronLeft /> {t.previousHadith} {neighbours.data.previous}
                  </Link>
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              {neighbours.data?.next ? (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/hadith/$number" params={{ number: String(neighbours.data.next) }}>
                    {t.nextHadith} {neighbours.data.next} <ChevronRight />
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
