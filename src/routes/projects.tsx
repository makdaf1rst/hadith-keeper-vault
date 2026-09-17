import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library.",
      },
      { property: "og:title", content: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

const projects = [
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
] as const;

function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Other Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Related scholarly works and research projects.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <section
            key={project.href}
            className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"
          >
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer noopener"
              className="block text-2xl font-semibold leading-relaxed text-primary underline-offset-4 hover:underline"
              dir="rtl"
              lang="ar"
            >
              {project.title}
            </a>
            <p className="mt-4 leading-7 text-foreground/90">
              {project.description}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
