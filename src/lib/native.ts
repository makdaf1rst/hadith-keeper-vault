import type { AnyRouter } from "@tanstack/react-router";

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
  }
}

export function isNative() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.() === true;
}

export function canonicalUrl(value: string | URL = window.location.href) {
  const url = new URL(String(value), window.location.href);
  return isNative() ? `https://jami-al-kamil.com${url.pathname}${url.search}${url.hash}` : url.href;
}

// Closing the share sheet rejects: AbortError on the web, a "Share canceled" message from the plugin.
export function isShareCancelled(error: unknown) {
  if (error instanceof DOMException) return error.name === "AbortError";
  return error instanceof Error && error.message.toLowerCase().includes("cancel");
}

function hadithFromDeepLink(value: string) {
  try {
    const url = new URL(value);
    const match = url.protocol === "jamialkamil:" && url.hostname === "hadith"
      ? url.pathname.match(/^\/(\d+)$/)
      : null;
    const number = match ? Number(match[1]) : 0;
    return Number.isSafeInteger(number) && number > 0 ? number : null;
  } catch {
    return null;
  }
}

export async function openExternal(url: string) {
  if (!isNative()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  window.open(url, "_system");
}

// Each step is isolated: one failed plugin must never leave the user behind the splash.
export function startNativeApp(router: AnyRouter) {
  if (!isNative()) return;

  document.addEventListener("click", (event) => {
    const anchor = (event.target as Element | null)?.closest("a");
    if (!anchor) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin === "https://jami-al-kamil.com") {
      event.preventDefault();
      void router.navigate({ to: `${url.pathname}${url.search}${url.hash}` });
    } else if (anchor.target === "_blank" || url.protocol === "mailto:") {
      event.preventDefault();
      void openExternal(url.href);
    }
  });

  void import("@capacitor/splash-screen")
    .then(({ SplashScreen }) => SplashScreen.hide())
    .catch(() => undefined);

  const navigateDeepLink = (url: string) => {
    const number = hadithFromDeepLink(url);
    if (number) void router.navigate({ to: "/hadith/$number", params: { number: String(number) } });
  };
  void import("@capacitor/app")
    .then(async ({ App }) => {
      await App.addListener("appUrlOpen", ({ url }) => navigateDeepLink(url));
      const launch = await App.getLaunchUrl();
      if (launch?.url) navigateDeepLink(launch.url);
    })
    .catch(() => undefined);

  void import("./daily-notifications")
    .then(({ initializeDailyNotifications }) => initializeDailyNotifications(router))
    .catch(() => undefined);

  const idle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1));
  idle(() => {
    void import("./content-refresh")
      .then(({ refreshNativeContent }) => refreshNativeContent())
      .catch(() => undefined);
  });
}
