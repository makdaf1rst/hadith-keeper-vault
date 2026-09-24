import { createFileRoute, Link } from "@tanstack/react-router";

import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      { name: "description", content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library." },
      { property: "og:title", content: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      { property: "og:description", content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library." },
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
    en: "A comprehensive bilingual Arabic-English commentary on الجامع الكامل في الحديث الصحيح الشامل المرتب على أبواب الفقه by ضياء الرحمن الأعظمي. The work is intended to elucidate the meanings of the hadiths, clarify their legal and doctrinal implications, gather the benefits derived from them, and present the relevant discussions of the scholars in an organized and accessible form.",
    bn: "দিয়া আল-রহমান আল-আযমীর الجامع الكامل في الحديث الصحيح الشامل المرتب على أبواب الفقه গ্রন্থের একটি বিস্তৃত আরবি-ইংরেজি ব্যাখ্যাগ্রন্থ। এর উদ্দেশ্য হলো হাদীসগুলোর অর্থ ব্যাখ্যা করা, সেগুলোর ফিকহী ও আকীদাগত দিক স্পষ্ট করা, হাদীস থেকে প্রাপ্ত উপকারসমূহ একত্র করা এবং সংশ্লিষ্ট আলিমদের আলোচনা সুসংগঠিত ও সহজবোধ্যভাবে উপস্থাপন করা।",
  },
  {
    title: "الجامع الشامل في تأصيل علوم الحديث",
    href: "https://drive.google.com/drive/folders/1qvb9bxbhPJsi3N9Hw_OdTn8Se9EaJcTQ",
    en: "A systematic study of Uṣūl al-Ḥadīth and ʿUlūm al-Ḥadīth, devoted to establishing the foundational principles by which prophetic reports are transmitted, examined, classified, and understood. It will cover the terminology of the hadith scholars, the categories of accepted and rejected reports, narrator criticism, chains of transmission, hidden defects, corroboration, contradiction, and the principles needed for proper hadith evaluation and understanding.",
    bn: "উসূলে হাদীস ও উলূমুল হাদীসের একটি পদ্ধতিগত অধ্যয়ন, যেখানে নববী বর্ণনাসমূহ কীভাবে বর্ণিত, যাচাই, শ্রেণিবদ্ধ ও অনুধাবন করা হয়—তার মৌলিক নীতিমালা প্রতিষ্ঠা করা হবে। এতে মুহাদ্দিসদের পরিভাষা, গ্রহণযোগ্য ও অগ্রহণযোগ্য বর্ণনার শ্রেণি, রাবীদের যাচাই, সনদ, গোপন ত্রুটি, সমর্থক বর্ণনা, বিরোধ এবং সঠিকভাবে হাদীস মূল্যায়ন ও বোঝার জন্য প্রয়োজনীয় নীতিসমূহ আলোচিত হবে।",
  },
  {
    title: "الجامع الشامل في تأصيل أصول الفقه",
    href: "https://drive.google.com/drive/folders/1KDTctdQNZhQMSuD5jbt2VSIOHxxyncxo",
    en: "A comparative and evidence-based study of Uṣūl al-Fiqh, examining the foundational principles and methodologies of the major schools of Islamic jurisprudence. It will present the sources of law, methods of legal reasoning, principles of textual interpretation, analogy, consensus, abrogation, commands and prohibitions, and the evidences behind the differing methodological approaches of the schools.",
    bn: "উসূলে ফিকহের একটি তুলনামূলক ও দলিলভিত্তিক অধ্যয়ন, যেখানে ইসলামী ফিকহের প্রধান মাযহাবগুলোর মৌলিক নীতি ও পদ্ধতি বিশ্লেষণ করা হবে। এতে শরীয়তের উৎস, ফিকহী ইস্তিদলালের পদ্ধতি, নস ব্যাখ্যার নীতি, কিয়াস, ইজমা, নাসিখ-মানসুখ, আদেশ ও নিষেধ এবং বিভিন্ন মাযহাবের পদ্ধতিগত মতভেদের পেছনের দলিলসমূহ উপস্থাপন করা হবে।",
  },
] as const;

function ProjectsPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{bn ? "অন্যান্য প্রকল্প" : "Other Projects"}</h1>
        <p className="mt-2 text-muted-foreground">
          {bn ? "সংশ্লিষ্ট ইলমী কাজ ও গবেষণা প্রকল্পসমূহ।" : "Related scholarly works and research projects."}
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <section key={project.href} className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <a href={project.href} target="_blank" rel="noreferrer noopener" className="block text-2xl font-semibold leading-relaxed text-primary underline-offset-4 hover:underline" dir="rtl" lang="ar">
              {project.title}
            </a>
            <p className="mt-4 leading-7 text-foreground/90">{bn ? project.bn : project.en}</p>
          </section>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/" className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          {bn ? "← গ্রন্থাগারে ফিরে যান" : "← Back to the Library"}
        </Link>
      </div>
    </main>
  );
}
