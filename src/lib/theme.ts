import { useEffect, useState } from "react";

export type Theme = "light" | "sepia" | "soft-gray" | "green" | "dark" | "warm-night" | "black";

const STORAGE_KEY = "jami-theme";
const EVENT = "jami-theme-change";

// swatch = the theme's --background in styles.css, so the picker previews the real page color
export const THEMES: Array<{ value: Theme; label: string; swatch: string }> = [
  { value: "light", label: "Light", swatch: "oklch(0.978 0.011 85)" },
  { value: "sepia", label: "Sepia", swatch: "oklch(0.94 0.03 82)" },
  { value: "soft-gray", label: "Soft Gray", swatch: "oklch(0.94 0.006 250)" },
  { value: "green", label: "Green", swatch: "oklch(0.945 0.018 145)" },
  { value: "dark", label: "Dark", swatch: "oklch(0.19 0.014 60)" },
  { value: "warm-night", label: "Warm Night", swatch: "oklch(0.16 0.025 55)" },
  { value: "black", label: "Black", swatch: "oklch(0.08 0 0)" },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "sepia", "soft-gray", "green", "warm-night", "black");

  if (theme === "dark") root.classList.add("dark");
  if (theme === "sepia") root.classList.add("sepia");
  if (theme === "soft-gray") root.classList.add("soft-gray");
  if (theme === "green") root.classList.add("green");
  if (theme === "warm-night") root.classList.add("dark", "warm-night");
  if (theme === "black") root.classList.add("dark", "black");
}

function detectTheme(): Theme {
  const root = document.documentElement;
  if (root.classList.contains("black")) return "black";
  if (root.classList.contains("warm-night")) return "warm-night";
  if (root.classList.contains("green")) return "green";
  if (root.classList.contains("soft-gray")) return "soft-gray";
  if (root.classList.contains("sepia")) return "sepia";
  if (root.classList.contains("dark")) return "dark";
  return "light";
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // header popover + footer select both hold a copy; keep them in sync
    const sync = () => setTheme(detectTheme());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const selectTheme = (next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode: theme still applies for this session
    }
    setTheme(next);
    window.dispatchEvent(new Event(EVENT));
  };

  return [theme, selectTheme];
}
