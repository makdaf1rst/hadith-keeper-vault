/**
 * Keep the hosted library current inside iOS/Android Capacitor WebViews.
 * Checks for a new service worker on open and on return to the app.
 * The offline library and downloaded audio caches are never cleared here.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  // ponytail: no reload on controllerchange; a forced reload cuts off audio mid-play.
  // The new worker claims the page and serves fresh content on the next request.
  void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
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
