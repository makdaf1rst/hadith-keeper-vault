import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { AboutLibrary } from "@/components/library/AboutLibrary";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { THEMES, useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Al-Jāmiʿ al-Kāmil" }] }),
  component: SettingsPage,
});

const BOOKS_USED_URL = {
  en: "https://drive.google.com/file/d/10_ZkVs3B4kIlxTnMSYy982FwMmAxSSFY/view",
  bn: "https://drive.google.com/file/d/1c5KMFNUTWDgYVqAGU1hKgU6fv9EgsFen/view",
};
const NARRATORS_URL = {
  en: "https://drive.google.com/file/d/19C5NU_lLYtPqTSS-h1PhVxxaWQXdQq49/view",
  bn: "https://drive.google.com/file/d/1UVM6aDTx6YNbOZP8uvP4bNghx7dwxJUI/view",
};

const rowClass =
  "flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      {title ? (
        <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {children}
      </ul>
    </section>
  );
}

function RouteRow({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link to={to} className={rowClass}>
        {label}
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}

function ExternalRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {label}
        <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
      </a>
    </li>
  );
}

function SettingsPage() {
  const t = useInterfaceText();
  const { interfaceLanguage, contentLanguage, setInterfaceLanguage } = useLanguage();
  const [theme, setTheme] = useTheme();
  const bn = interfaceLanguage === "bn";
  const docLang = contentLanguage === "bn" ? "bn" : "en";

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-[calc(1.5rem+env(safe-area-inset-top))] font-sans sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">{t.settings}</h1>

      <Group title={bn ? "চেহারা" : "Appearance"}>
        {THEMES.map((item) => (
          <li key={item.value}>
            <button
              type="button"
              className={rowClass}
              aria-pressed={theme === item.value}
              onClick={() => setTheme(item.value)}
            >
              <span className="flex items-center gap-3">
                <span
                  className="size-5 rounded-full border border-border shadow-inner"
                  style={{ background: item.swatch }}
                  aria-hidden
                />
                {item.label}
              </span>
              {theme === item.value ? <Check className="size-4 text-primary" aria-hidden /> : null}
            </button>
          </li>
        ))}
      </Group>

      {/* the home page header (with its language button) is hidden in the app, so language lives here */}
      <Group title={bn ? "ভাষা" : "Language"}>
        {(
          [
            ["en", "English"],
            ["bn", "বাংলা"],
          ] as const
        ).map(([value, label]) => (
          <li key={value}>
            <button
              type="button"
              className={rowClass}
              aria-pressed={interfaceLanguage === value}
              onClick={() => setInterfaceLanguage(value)}
            >
              {label}
              {interfaceLanguage === value ? <Check className="size-4 text-primary" aria-hidden /> : null}
            </button>
          </li>
        ))}
      </Group>

      <Group title={t.library}>
        <RouteRow to="/downloads" label={bn ? "ডাউনলোড" : "Downloads"} />
        <ExternalRow
          href={BOOKS_USED_URL[docLang]}
          label={bn ? "আল-জামি‘ আল-কামিলে ব্যবহৃত গ্রন্থসমূহ" : "Books Used in al-Jāmiʿ al-Kāmil"}
        />
        <ExternalRow
          href={NARRATORS_URL[docLang]}
          label={bn ? "আল-জামি‘ আল-কামিলের সাহাবী বর্ণনাকারীগণ" : "Sahabah Narrators in al-Jāmiʿ al-Kāmil"}
        />
      </Group>

      <Group title={bn ? "সম্পর্কে" : "About"}>
        <li>
          <details className="group">
            <summary className={`${rowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
              {bn ? "এই লাইব্রেরি সম্পর্কে" : "About this library"}
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <AboutLibrary bn={bn} className="px-4 pb-4 text-sm" />
          </details>
        </li>
        <RouteRow to="/announcements" label={t.announcements} />
        <RouteRow to="/projects" label={t.otherProjects} />
      </Group>

      <Group title={bn ? "সহায়তা" : "Support"}>
        <RouteRow to="/send-gift" label={bn ? "উপহার পাঠান" : "Send Gift"} />
        <RouteRow to="/contact" label={t.contact} />
        <RouteRow to="/privacy" label={t.privacy} />
      </Group>
    </main>
  );
}
