// TypeScript does not associate declarations with an explicitly imported .mjs sibling.
// @ts-expect-error runtime module is shared with the Node bundle checker
import { CONTENT_PATH_RE } from "./content-path.mjs";

const CONTENT_ORIGIN = "https://jami-al-kamil.com";
const LAST_CHECK_KEY = "jami-content-refresh-last-check";
const MANIFEST_KEY = "jami-content-refresh-manifest";
const DAY_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "jami-content-overlay";
const STORE_NAME = "files";

type Manifest = Record<string, string>;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readContentOverlay(path: string): Promise<unknown | undefined> {
  if (!CONTENT_PATH_RE.test(path)) return undefined;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(path);
    request.onsuccess = () => {
      try {
        resolve(typeof request.result === "string" ? JSON.parse(request.result) : undefined);
      } catch {
        resolve(undefined);
      }
    };
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

async function writeOverlays(files: Array<[string, string]>) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const [path, text] of files) store.put(text, path);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }).finally(() => db.close());
}

function validManifest(value: unknown): value is Manifest {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    Object.entries(value as Record<string, unknown>).every(
      ([path, hash]) => CONTENT_PATH_RE.test(path) && typeof hash === "string",
    );
}

// ponytail: Pagefind is a bundled snapshot and does not refresh with corrected JSON.
export async function refreshNativeContent() {
  try {
    const previousCheck = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (Date.now() - previousCheck < DAY_MS) return;

    const { CapacitorHttp } = await import("@capacitor/core");
    const response = await CapacitorHttp.get({ url: `${CONTENT_ORIGIN}/content/manifest.json` });
    if (response.status !== 200 || !validManifest(response.data)) return;
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
    const next = response.data;

    let current: Manifest;
    const stored = localStorage.getItem(MANIFEST_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (!validManifest(parsed)) return;
      current = parsed;
    } else {
      const bundled = await fetch("/content/manifest.json").then((item) => item.json());
      if (!validManifest(bundled)) return;
      current = bundled;
    }

    const changed = Object.keys(next).filter((path) => next[path] !== current[path]);
    // ponytail: a corrections sweep over 500 files waits for the next App Store build
    if (changed.length > 500) return;
    const downloads: Array<[string, string]> = [];
    for (const path of changed) {
      if (!CONTENT_PATH_RE.test(path)) return;
      const item = await CapacitorHttp.get({ url: `${CONTENT_ORIGIN}/content/${path}` });
      if (item.status !== 200) return;
      const text = typeof item.data === "string" ? item.data : JSON.stringify(item.data);
      JSON.parse(text);
      downloads.push([path, text]);
    }
    await writeOverlays(downloads);
    localStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
  } catch {
    // Updates are best-effort; the immutable bundled snapshot remains authoritative on failure.
  }
}
