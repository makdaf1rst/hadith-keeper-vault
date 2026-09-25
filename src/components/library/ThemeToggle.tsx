import { useLocation } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const STORAGE_KEY = "jami-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const location = useLocation();
  const isHadithPage = location.pathname.startsWith("/hadith/");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`fixed right-14 z-50 h-9 gap-2 rounded-md border-border bg-background/95 px-3 text-foreground shadow-md backdrop-blur transition-colors hover:bg-accent sm:right-16 ${
        isHadithPage ? "top-48" : "top-4 sm:top-6"
      }`}
      aria-label={nextLabel}
      title={nextLabel}
    >
      {theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      <span className="text-xs font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
    </Button>
  );
}
