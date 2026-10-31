import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Check,
  ChevronRight,
  ExternalLink,
  Languages,
  Menu,
  Palette,
  Search,
  Settings2,
  Share2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Stepper } from "@/components/library/ReaderControls";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { BOOKS_USED_URL, NARRATORS_URL, shareApp } from "@/lib/links";
import { useReaderSettings } from "@/lib/reader-settings";
import { THEMES, useTheme } from "@/lib/theme";

const iconBtn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-accent";

const LANGUAGES = [
  ["en", "English", "EN"],
  ["bn", "বাংলা", "বাং"],
] as const;

// Website-only top bar (Quran.com style). Language + Color stay one click away on every route (Sadman's rule).
export function SiteHeader() {
  const { interfaceLanguage, setInterfaceLanguage } = useLanguage();
  const [theme, setTheme] = useTheme();
  const bn = interfaceLanguage === "bn";
  const current = THEMES.find((item) => item.value === theme) ?? THEMES[0]!;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 font-sans backdrop-blur-md supports-[backdrop-filter]:bg-background/70 [.app_&]:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <img src="/jami-al-kamil-logo.png" alt="" className="h-8 w-auto" />
          <span className="hidden truncate text-[15px] font-semibold tracking-tight text-foreground sm:block">
            Al-Jāmiʿ al-Kāmil
          </span>
        </Link>

        <nav aria-label={bn ? "সাইট" : "Site"} className="ml-auto flex items-center gap-0.5">
          <Link to="/search" className={iconBtn} aria-label={bn ? "অনুসন্ধান" : "Search"}>
            <Search className="size-[18px]" aria-hidden />
          </Link>

          <Popover>
            <PopoverTrigger
              id="language-switch-guide"
              className={iconBtn}
              aria-label={bn ? "ভাষা পরিবর্তন" : "Change language"}
            >
              <Languages className="size-[18px]" aria-hidden />
              <span className="text-xs font-semibold">{bn ? "বাং" : "EN"}</span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1 font-sans">
              {LANGUAGES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={interfaceLanguage === value}
                  onClick={() => setInterfaceLanguage(value)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  {label}
                  {interfaceLanguage === value ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className={iconBtn} aria-label={bn ? "রং পরিবর্তন" : "Change color theme"}>
              <Palette className="size-[18px]" aria-hidden />
              <span
                className="size-3.5 rounded-full border border-foreground/25"
                style={{ background: current.swatch }}
                aria-hidden
              />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-3 font-sans">
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {bn ? "রং" : "Color"}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    aria-pressed={theme === item.value}
                    onClick={() => setTheme(item.value)}
                    className="group flex flex-col items-center gap-1 rounded-lg p-1 text-[10px] text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full border shadow-inner ${
                        theme === item.value ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                      style={{ background: item.swatch }}
                    >
                      {theme === item.value ? (
                        <Check className="size-4 text-primary mix-blend-difference" />
                      ) : null}
                    </span>
                    <span className="max-w-full truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <SettingsSheet bn={bn} />
          <MenuSheet bn={bn} />
        </nav>
      </div>
    </header>
  );
}

function SettingsSheet({ bn }: { bn: boolean }) {
  const [settings, update] = useReaderSettings();
  return (
    <Sheet>
      <SheetTrigger className={iconBtn} aria-label={bn ? "পড়ার সেটিংস" : "Reading settings"}>
        <Settings2 className="size-[18px]" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-80 font-sans">
        <SheetHeader>
          <SheetTitle className="font-sans">{bn ? "পড়ার সেটিংস" : "Reading settings"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4">
          <Stepper
            label={bn ? "আরবি লেখা" : "Arabic text"}
            value={settings.arabicScale}
            onChange={(arabicScale) => update({ arabicScale })}
          />
          <Stepper
            label={bn ? "অনুবাদ" : "Translation"}
            value={settings.translationScale}
            onChange={(translationScale) => update({ translationScale })}
          />
          <label className="flex items-center justify-between gap-3 text-sm">
            {bn ? "রিডার মোড" : "Reader mode"}
            <Switch
              checked={settings.readerMode}
              onCheckedChange={(readerMode) => update({ readerMode })}
            />
          </label>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const rowClass =
  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

function MenuGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <ul>{children}</ul>
    </section>
  );
}

function MenuSheet({ bn }: { bn: boolean }) {
  const t = useInterfaceText();
  const { contentLanguage } = useLanguage();
  const docLang = contentLanguage === "bn" ? "bn" : "en";
  const route = (to: string, label: string) => (
    <li key={to}>
      <Link to={to} className={rowClass}>
        {label}
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
  const external = (href: string, label: string) => (
    <li key={href}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {label}
        <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
      </a>
    </li>
  );

  return (
    <Sheet>
      <SheetTrigger id="library-menu-guide" className={iconBtn} aria-label={bn ? "মেনু" : "Menu"}>
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto font-sans">
        <SheetHeader>
          <SheetTitle className="font-sans">{t.library}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-1 pb-6">
          <MenuGroup title={t.library}>
            <li>
              <Link to="/bookmarks" className={rowClass}>
                <span className="flex items-center gap-2">
                  <Bookmark className="size-4 text-primary" aria-hidden />
                  {bn ? "বুকমার্ক" : "Bookmarks"}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
            {route("/downloads", bn ? "ডাউনলোড" : "Downloads")}
            {external(BOOKS_USED_URL[docLang], bn ? "ব্যবহৃত গ্রন্থসমূহ" : "Books Used")}
            {external(NARRATORS_URL[docLang], bn ? "সাহাবী বর্ণনাকারীগণ" : "Sahabah Narrators")}
          </MenuGroup>
          <MenuGroup title={bn ? "সম্পর্কে" : "About"}>
            {route("/announcements", t.announcements)}
            {route("/projects", t.otherProjects)}
          </MenuGroup>
          <MenuGroup title={bn ? "সহায়তা" : "Support"}>
            <li>
              <button type="button" className={rowClass} onClick={() => void shareApp(bn)}>
                {bn ? "শেয়ার করুন" : "Share"}
                <Share2 className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </li>
            {route("/contact", t.contact)}
            {route("/privacy", t.privacy)}
          </MenuGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
}
