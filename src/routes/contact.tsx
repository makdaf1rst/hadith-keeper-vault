import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Contact the Al-Jāmiʿ al-Kāmil project to report genuine database corrections or discuss contributing to future scholarly projects.",
      },
      { property: "og:title", content: "Contact — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content:
          "Report genuine corrections, make duʿāʾ for the project, or get in touch about contributing to future work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Mail className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">Al-Jāmiʿ al-Kāmil</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-foreground">Contact</h1>

          <div className="mt-6 space-y-5 english-text text-base leading-8 text-foreground/90">
            <p>
              This project was undertaken solely for the sake of Allah. We ask Allah, Most High, to
              accept it, to place sincerity and benefit in it, and to make every effort connected to
              it a means of reward. May Allah accept from all of us every deed that is done sincerely
              for His sake.
            </p>

            <p>
              Although great care has been taken in preparing and reviewing this database, human work
              is never free from the possibility of error. If you find a genuine mistake, missing
              material, incorrect wording, broken reference, display problem, or any other issue that
              truly requires correction, we would be grateful if you could inform us. Please send a
              clear screenshot of the issue together with enough detail to identify the exact Book,
              Chapter, hadith number, and the nature of the problem. This will help us investigate the
              matter carefully and make only corrections that are properly verified.
            </p>

            <p>
              We do not accept personal donations for this project. If you sincerely wish to give in
              support of the effort, then please give charity on our behalf to a trustworthy cause and
              remember us in your duʿāʾ. Ask Allah to forgive us, accept this work, protect it from
              error, allow it to benefit people, and grant everyone involved in it sincerity and a
              good end.
            </p>

            <p>
              If, however, you genuinely wish to take part in the development of our future projects —
              whether through research, technical development, scholarly assistance, proofreading,
              design, or financial support directed toward the actual development of those projects —
              you are welcome to contact us. We are especially interested in sincere collaboration
              that helps strengthen the quality, accuracy, accessibility, and long-term benefit of the
              work.
            </p>

            <p>
              For correction reports, collaboration, or enquiries regarding future projects, please
              contact us at:
            </p>

            <p>
              <a
                href="mailto:Aljamiushshamil@gmail.com"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Aljamiushshamil@gmail.com
              </a>
            </p>

            <p className="italic text-muted-foreground">
              May Allah accept what is correct, forgive what is deficient, and make this work a source
              of lasting benefit.
            </p>
          </div>
        </div>

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
