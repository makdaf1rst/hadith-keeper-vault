import { useEffect, useState } from "react";

export type Theme =
  "system" | "light" | "sepia" | "soft-gray" | "green" | "dark" | "warm-night" | "black";

const STORAGE_KEY = "jami-theme";
const EVENT = "jami-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// swatch = the theme's --background in styles.css, so the picker previews the real page color
export const THEMES: Array<{ value: Theme; label: string; swatch: string }> = [
  {
    value: "system",
    label: "System",
    swatch: "linear-gradient(135deg, oklch(0.978 0.011 85) 50%, oklch(0.19 0.014 60) 50%)",
  },
  { value: "light", label: "Light", swatch: "oklch(0.978 0.011 85)" },
  { value: "sepia", label: "Sepia", swatch: "oklch(0.94 0.03 82)" },
  { value: "soft-gray", label: "Soft Gray", swatch: "oklch(0.94 0.006 250)" },
  { value: "green", label: "Green", swatch: "oklch(0.945 0.018 145)" },
  { value: "dark", label: "Dark", swatch: "oklch(0.19 0.014 60)" },
  { value: "warm-night", label: "Warm Night", swatch: "oklch(0.16 0.025 55)" },
  { value: "black", label: "Black", swatch: "oklch(0.08 0 0)" },
];

function isTheme(value: string | null): value is Theme {
  return THEMES.some((item) => item.value === value);
}

// no stored choice = follow the device, same as the pre-paint script in __root.tsx
function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const resolved =
    theme === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : theme;
  const root = document.documentElement;
  root.classList.remove("dark", "sepia", "soft-gray", "green", "warm-night", "black");

  if (resolved === "dark") root.classList.add("dark");
  if (resolved === "sepia") root.classList.add("sepia");
  if (resolved === "soft-gray") root.classList.add("soft-gray");
  if (resolved === "green") root.classList.add("green");
  if (resolved === "warm-night") root.classList.add("dark", "warm-night");
  if (resolved === "black") root.classList.add("dark", "black");
  if (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.()) {
    // Capacitor Style names the background: Style.Dark = light text for a dark page
    void import("@capacitor/status-bar")
      .then(({ StatusBar, Style }) =>
        StatusBar.setStyle({
          style: ["dark", "warm-night", "black"].includes(resolved) ? Style.Dark : Style.Light,
        }),
      )
      .catch(() => undefined);
  }
}

export function applyStoredTheme() {
  applyTheme(readStoredTheme());
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // header popover + footer select both hold a copy; keep them in sync
    const sync = () => setTheme(readStoredTheme());
    sync();
    window.addEventListener(EVENT, sync);

    // device flips light/dark while the app is open: follow it if the user chose System
    const media = window.matchMedia(DARK_QUERY);
    const onDeviceChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", onDeviceChange);

    return () => {
      window.removeEventListener(EVENT, sync);
      media.removeEventListener("change", onDeviceChange);
    };
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
