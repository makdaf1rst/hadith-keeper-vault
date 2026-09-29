import { useLocation } from "@tanstack/react-router";
import { BookOpen, Check, Circle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "sepia" | "dark" | "black";

const STORAGE_KEY = "jami-theme";

const THEMES: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "sepia", label: "Sepia" },
  { value: "dark", label: "Dark" },
  { value: "black", label: "Black" },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "sepia", "black");
  if (theme === "dark") root.classList.add("dark");
  if (theme === "sepia") root.classList.add("sepia");
  if (theme === "black") root.classList.add("dark", "black");
}

function detectTheme(): Theme {
  const root = document.documentElement;
  if (root.classList.contains("black")) return "black";
  if (root.classList.contains("sepia")) return "sepia";
  if (root.classList.contains("dark")) return "dark";
  return "light";
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") return <Sun className="size-4" aria-hidden />;
  if (theme === "sepia") return <BookOpen className="size-4" aria-hidden />;
  if (theme === "dark") return <Moon className="size-4" aria-hidden />;
  return <Circle className="size-4 fill-current" aria-hidden />;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const location = useLocation();
  const isHadithPage = location.pathname.startsWith("/hadith/");

  useEffect(() => {
    setTheme(detectTheme());
  }, []);

  const selectTheme = (nextTheme: Theme) => {
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`absolute z-50 h-9 gap-2 rounded-md border-border bg-background/95 px-3 text-foreground shadow-md backdrop-blur transition-colors hover:bg-accent ${
            isHadithPage
              ? "top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
              : "top-4 right-14 sm:top-6 sm:right-16"
          }`}
          aria-label="Choose reading color theme"
          title="Choose reading color theme"
        >
          <ThemeIcon theme={theme} />
          <span className="text-xs font-medium">{THEMES.find((item) => item.value === theme)?.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-36">
        {THEMES.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onSelect={() => selectTheme(item.value)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <ThemeIcon theme={item.value} />
              {item.label}
            </span>
            {theme === item.value ? <Check className="size-4" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
