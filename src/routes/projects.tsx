import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, FolderKanban, Library } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Companion scholarly projects connected with the Al-Jāmiʿ al-Kāmil library: a bilingual commentary, a study of Uṣūl al-Ḥadīth, and a study of Uṣūl al-Fiqh.",
      },
      { property: "og:title", content: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content:
          "Companion scholarly projects connected with the Al-Jāmiʿ al-Kāmil library: a bilingual commentary, a study of Uṣūl al-Ḥadīth, and a study of Uṣūl al-Fiqh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

interface ProjectEntry {
  title: string;
  href: string;
  description: string;
}

const projects: ProjectEntry[] = [
  {
    title: "الجامع الشامل في شرح جامع الكامل",
    href: "https://drive.google.com/drive/folders/1OaReDuIDY3NV1OlvaTb0RTrvCywfKkeA",
    description:
      "A comprehensive bilingual Arabic-English commentary on الجامع الكامل في الحديث الصحيح الشامل المرتب على أبواب الفقه by ضياء الرحمن الأعظمي. The work is intended to elucidate the meanings of the hadiths, clarify their legal and doctrinal implications, gather the benefits derived from them, and present the relevant discussions of the scholars in an organized and accessible form.",
  },
  {
    title: "الجامع الشامل في تأصيل علوم الحديث",
    href: "https://drive.google.com/drive/folders/1qvb9bxbhPJsi3N9Hw_OdTn8Se9EaJcTQ",
    description:
      "A systematic study of Uṣūl al-Ḥadīth and ʿUlūm al-Ḥadīth, devoted to establishing the foundational principles by which prophetic reports are transmitted, examined, classified, and understood. It will cover the terminology of the hadith scholars, the categories of accepted and rejected reports, narrator criticism, chains of transmission, hidden defects, corroboration, contradiction, and the principles needed for proper hadith evaluation and understanding.",
  },
  {
    title: "الجامع الشامل في تأصيل أصول الفقه",
    href: "https://drive.google.com/drive/folders/1KDTctdQNZhQMSuD5jbt2VSIOHxxyncxo",
    description:
      "A comparative and evidence-based study of Uṣūl al-Fiqh, examining the foundational principles and methodologies of the major schools of Islamic jurisprudence. It will present the sources of law, methods of legal reasoning, principles of textual interpretation, analogy, consensus, abrogation, commands and prohibitions, and the evidences behind the differing methodological approaches of the schools.",
  },
];

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">Al-Jāmiʿ al-Kāmil</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-5 text-primary" aria-hidden />
          <h1 className="text-3xl font-semibold text-foreground">Other Projects</h1>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Companion scholarly projects connected with the Al-Jāmiʿ al-Kāmil library. Each title
          opens its source folder on Google Drive in a new tab.
        </p>

        <ol className="mt-10 space-y-8">
          {projects.map((project, index) => (
            <li
              key={project.href}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 text-sm font-semibold text-muted-foreground tabular-nums">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arabic-text group inline-flex items-center gap-1.5 text-right text-xl! font-semibold leading-snug! text-primary underline-offset-4 hover:underline"
                    dir="rtl"
                    lang="ar"
                  >
                    {project.title}
                    <ExternalLink
                      className="size-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary"
                      aria-hidden
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  <p className="english-text mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <Button asChild variant="outline" className="mt-10">
          <Link to="/">
            <ArrowLeft aria-hidden />
            Back to the library
          </Link>
        </Button>
      </main>
    </div>
  );
}
