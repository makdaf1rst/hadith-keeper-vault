/**
 * Keep the hosted library current inside iOS/Android Capacitor WebViews.
 * A newly activated service worker refreshes the page so cached page HTML
 * and in-memory hadith book data cannot survive a production deployment.
 * The offline library and downloaded audio caches are never cleared here.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const serviceWorker = navigator.serviceWorker;
  let hadController = Boolean(serviceWorker.controller);

  serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) {
      // A replacement worker now controls the page; use the newest app and text.
      window.location.reload();
    }
    hadController = true;
  });

  void serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
    const checkForUpdates = () => {
      if (navigator.onLine) void registration.update().catch(() => {});
    };
    checkForUpdates();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdates();
    });
    window.addEventListener("online", checkForUpdates);
  }).catch(() => {
    // Offline support is best-effort; failures must not break reading.
  });
}
