import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useInterfaceText, useLanguage } from "@/lib/language";
import { BOOKS_USED_URL, NARRATORS_URL, shareApp } from "@/lib/links";
import { THEMES, useTheme, type Theme } from "@/lib/theme";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:underline focus-visible:outline-none";
const selectClass =
  "h-9 rounded-full border border-border bg-card px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 font-sans text-xs font-semibold tracking-wider text-foreground uppercase">
        {title}
      </h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

// Website-only footer; the app has the Settings tab instead.
export function SiteFooter() {
  const t = useInterfaceText();
  const { interfaceLanguage, contentLanguage, setInterfaceLanguage } = useLanguage();
  const [theme, setTheme] = useTheme();
  const bn = interfaceLanguage === "bn";
  const docLang = contentLanguage === "bn" ? "bn" : "en";
  const external = (href: string, label: string) => (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {label}
      </a>
    </li>
  );

  return (
    <footer className="mt-20 border-t border-border bg-accent/30 font-sans [.app_&]:hidden">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="arabic-text text-3xl leading-tight text-foreground" dir="rtl" lang="ar">
              الجامع الكامل
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {bn ? "গ্রন্থকার: দিয়াউর রহমান আল-আযমী" : "Author: Ḍiyāʾ al-Raḥmān al-Aʿẓamī"}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {bn ? "অনুবাদ: সাদমান জারিফ তালহা" : "Translated by Sadman Zarif Talha"}
            </p>
          </div>
          <Column title={t.library}>
            <li>
              <Link to="/downloads" className={linkClass}>
                {bn ? "ডাউনলোড" : "Downloads"}
              </Link>
            </li>
            {external(BOOKS_USED_URL[docLang], bn ? "ব্যবহৃত গ্রন্থসমূহ" : "Books Used")}
            {external(NARRATORS_URL[docLang], bn ? "সাহাবী বর্ণনাকারীগণ" : "Sahabah Narrators")}
          </Column>
          <Column title={bn ? "সম্পর্কে" : "About"}>
            <li>
              <Link to="/" hash="about" className={linkClass}>
                {bn ? "এই লাইব্রেরি সম্পর্কে" : "About this library"}
              </Link>
            </li>
            <li>
              <Link to="/announcements" className={linkClass}>
                {t.announcements}
              </Link>
            </li>
            <li>
              <Link to="/projects" className={linkClass}>
                {t.otherProjects}
              </Link>
            </li>
          </Column>
          <Column title={bn ? "সহায়তা" : "Support"}>
            <li>
              <button type="button" className={linkClass} onClick={() => void shareApp(bn)}>
                {bn ? "শেয়ার করুন" : "Share"}
              </button>
            </li>
            <li>
              <Link to="/contact" className={linkClass}>
                {t.contact}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={linkClass}>
                {t.privacy}
              </Link>
            </li>
          </Column>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">© Al-Jāmiʿ al-Kāmil</p>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label={bn ? "ভাষা" : "Language"}
              className={selectClass}
              value={interfaceLanguage}
              onChange={(e) => setInterfaceLanguage(e.target.value as "en" | "bn")}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
            <select
              aria-label={bn ? "রং" : "Color"}
              className={selectClass}
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {THEMES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
