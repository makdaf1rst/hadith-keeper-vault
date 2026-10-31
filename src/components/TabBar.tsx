import { Link, useLocation } from "@tanstack/react-router";
import { Bookmark, Library, Search, Settings } from "lucide-react";

import { useInterfaceText } from "@/lib/language";

const TABS = [
  { to: "/", icon: Library, label: "library" },
  { to: "/bookmarks", icon: Bookmark, label: "bookmarks" },
  { to: "/search", icon: Search, label: "search" },
  { to: "/settings", icon: Settings, label: "settings" },
] as const;

export function TabBar() {
  const t = useInterfaceText();
  const { pathname } = useLocation();
  // ponytail: "/" only matches exactly; reader routes (/book, /chapter, /hadith) leave no tab active
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 hidden justify-center [.app_&]:flex px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <ul className="glass flex w-full max-w-md items-center justify-around rounded-full p-1.5 font-sans">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden strokeWidth={active ? 2.25 : 1.75} />
                {t[label]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
