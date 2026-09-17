import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Library } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:title", content: "Announcements — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">Al-Jāmiʿ al-Kāmil</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold text-foreground">Announcements</h1>

        <article className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">A Sincere Request</h2>

          <div className="mt-5 space-y-5 text-base leading-7 text-muted-foreground">
            <p>
              Please use this library to <strong className="text-foreground">study the Sunnah, benefit from it, teach it, and spread this knowledge to others</strong>.
            </p>

            <p>
              But we sincerely ask you, <strong className="text-foreground">for the sake of Allah, not to use this work as a means of business or worldly profit</strong>. This project was prepared as a humble effort to serve the knowledge of the Messenger of Allah ﷺ and to make it accessible to people seeking guidance.
            </p>

            <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
              <p className="font-medium text-foreground">
                “And do not exchange My signs for a small price, and fear Me alone.”
              </p>
              <p className="mt-2 text-sm">Qur’an 2:41</p>
            </div>

            <p>And the Messenger of Allah ﷺ warned:</p>

            <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
              <p className="font-medium text-foreground">
                “Whoever acquires knowledge by which the pleasure of Allah is sought, but acquires it only to gain some worldly advantage, will not smell the fragrance of Paradise on the Day of Resurrection.”
              </p>
              <p className="mt-2 text-sm">Sunan Abī Dāwūd 3664</p>
            </div>

            <p>
              So please <strong className="text-foreground">read it, study it, share it, teach from it, and spread it freely</strong>, but do not turn this effort into a means of worldly business or personal profit.
            </p>

            <p>
              May Allah make this work sincerely for His sake, allow it to benefit the Ummah, reward everyone who helps spread authentic knowledge, and protect us from seeking the Hereafter through the gains of this world. <strong className="text-foreground">Āmīn.</strong>
            </p>
          </div>
        </article>

        <Button asChild variant="outline" className="mt-8">
          <Link to="/">
            <ArrowLeft aria-hidden />
            Back to the library
          </Link>
        </Button>
      </main>
    </div>
  );
}
