/**
 * Saves the whole library on the device so it reads, searches, and (optionally) plays with no
 * network. Text, the search index, and app code go into the `jk-library` cache, which
 * public/sw.js serves when the network is gone. Audio reuses the per-book download in audio.ts,
 * book by book. The file list comes from /offline-manifest.json (scripts/build-offline-manifest.mjs).
 *
 * The reader's choice is remembered, so an unfinished download picks up again on the next
 * launch with a connection. Downloads only run while the app is open.
 */
import { useSyncExternalStore } from "react";

import type { ContentLanguage } from "@/lib/language";
import { AUDIO_BASE, MB_PER_CHAPTER, MB_PER_HADITH, isBookSaved, saveBook } from "@/lib/audio";

const LIBRARY = "jk-library"; // same name as public/sw.js
const PLAN_KEY = "jk-offline-plan";
const TEXT_KEY = "jk-offline-text"; // manifest version the saved text matches
const PROMPTED_KEY = "jk-offline-prompted";
const PAUSED_KEY = "jk-offline-paused";
const PARALLEL = 8;
const HASH_HEADER = "x-jk-hash";
// file list of the last completed save, so a later save can delete what a new build dropped
const SAVED_LIST = "/__offline-saved-files.json";

export type OfflinePlan = { audio: ContentLanguage | null };

type Manifest = {
  version: string;
  text: { bytes: number; files: string[]; hashes: Record<string, string> };
  audio: { books: { book: number; numbers: number[]; chapters: string[] }[] };
};

export type OfflineState =
  | { kind: "idle" }
  | { kind: "running"; stage: "text" | "audio"; done: number; total: number }
  | { kind: "paused"; stage: "text" | "audio" }
  | { kind: "done" }
  | { kind: "error"; message: string };

let state: OfflineState = { kind: "idle" };
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(next: OfflineState) {
  state = next;
  listeners.forEach((fn) => fn());
}

export function useOfflineLibrary(): OfflineState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
    () => state,
  );
}

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage blocked: the files still save, only the remembered choice is lost
  }
};

export const supportsOffline = () =>
  typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;

export function getPlan(): OfflinePlan | null {
  const raw = read(PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OfflinePlan;
  } catch {
    return null;
  }
}

export const wasPrompted = () => read(PROMPTED_KEY) === "1";
export const markPrompted = () => write(PROMPTED_KEY, "1");

let manifestPromise: Promise<Manifest> | null = null;
export function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch("/offline-manifest.json", { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error("The offline file list isn't available right now.");
    return res.json() as Promise<Manifest>;
  });
  manifestPromise.catch(() => (manifestPromise = null));
  return manifestPromise;
}

/** Rough sizes for the choice screen, in MB. */
export async function estimateSizes() {
  const manifest = await loadManifest();
  const hadiths = manifest.audio.books.reduce((sum, b) => sum + b.numbers.length, 0);
  const chapters = manifest.audio.books.reduce((sum, b) => sum + b.chapters.length, 0);
  return {
    textMb: Math.ceil(manifest.text.bytes / 1e6),
    audioMb: AUDIO_BASE ? Math.ceil(hadiths * MB_PER_HADITH + chapters * MB_PER_CHAPTER) : 0,
  };
}

export const isTextSaved = () => read(TEXT_KEY) !== null;

async function saveText(manifest: Manifest, signal: AbortSignal) {
  const cache = await caches.open(LIBRARY);
  // the home page is what the app opens on, so keep a copy of it with the library
  const urls = ["/", ...manifest.text.files];
  const queue = [...urls];
  let done = 0;
  setState({ kind: "running", stage: "text", done, total: urls.length });
  const worker = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      signal.throwIfAborted();
      const hash = manifest.text.hashes[url];
      const saved = url === "/" ? undefined : await cache.match(url);
      // hashed names never change content; the rest are re-fetched when their hash moves
      if (!saved || (hash && saved.headers.get(HASH_HEADER) !== hash)) {
        const res = await fetch(url, { signal, cache: "no-store" });
        if (res.ok) {
          const headers = new Headers(res.headers);
          if (hash) headers.set(HASH_HEADER, hash);
          await cache.put(url, new Response(await res.blob(), { status: res.status, headers }));
        } else if (res.status !== 404) {
          throw new Error("Download stopped. Check your connection.");
        }
      }
      done++;
      if (done % 25 === 0 || done === urls.length) {
        setState({ kind: "running", stage: "text", done, total: urls.length });
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));

  // Drop files from older builds (renamed app code, rebuilt search index) so space doesn't creep.
  // The previous file list is kept in the cache: cache.keys() over ~40k entries throws
  // "Operation too large" in Chrome, so the cache is never listed.
  const previous = await cache.match(SAVED_LIST);
  if (previous) {
    const keep = new Set(urls);
    const old = ((await previous.json()) as string[]).filter((url) => !keep.has(url));
    for (const url of old) await cache.delete(url);
  }
  await cache.put(SAVED_LIST, new Response(JSON.stringify(urls)));
  write(TEXT_KEY, manifest.version);
}

async function saveAudio(manifest: Manifest, lang: ContentLanguage, signal: AbortSignal) {
  const books = manifest.audio.books;
  const size = (b: (typeof books)[number]) => b.numbers.length + b.chapters.length;
  const total = books.reduce((sum, b) => sum + size(b), 0);
  let before = 0;

  const remaining = books.filter((b) => !isBookSaved(b.book, lang));
  const neededMb = remaining.reduce(
    (sum, b) => sum + b.numbers.length * MB_PER_HADITH + b.chapters.length * MB_PER_CHAPTER,
    0,
  );
  const est = await navigator.storage?.estimate?.();
  if (est?.quota != null && est.usage != null && est.quota - est.usage < neededMb * 1e6) {
    const gb = (neededMb / 1000).toFixed(1);
    throw new Error(`Not enough free space for all audio. It needs about ${gb} GB.`);
  }

  for (const b of books) {
    signal.throwIfAborted();
    if (!isBookSaved(b.book, lang)) {
      await saveBook(
        b.book,
        b.numbers,
        b.chapters,
        lang,
        (done) => {
          if (done % 10 === 0) {
            setState({ kind: "running", stage: "audio", done: before + done, total });
          }
        },
        signal,
      );
    }
    before += size(b);
    setState({ kind: "running", stage: "audio", done: before, total });
  }
}

/** Starts or resumes the saved plan. Files already on the device are skipped. */
export async function startOfflineDownload(plan: OfflinePlan) {
  if (!supportsOffline() || state.kind === "running") return;
  write(PLAN_KEY, JSON.stringify(plan));
  write(PAUSED_KEY, null);
  markPrompted();
  controller = new AbortController();
  const { signal } = controller;
  let stage: "text" | "audio" = "text";
  try {
    await navigator.storage?.persist?.(); // ask the browser not to clear it under storage pressure
    const manifest = await loadManifest();
    if (read(TEXT_KEY) !== manifest.version) await saveText(manifest, signal);
    if (plan.audio && AUDIO_BASE) {
      stage = "audio";
      await saveAudio(manifest, plan.audio, signal);
    }
    setState({ kind: "done" });
  } catch (error) {
    if (signal.aborted) setState(getPlan() ? { kind: "paused", stage } : { kind: "idle" });
    else
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Download stopped. Tap to try again.",
      });
  } finally {
    controller = null;
  }
}

export function pauseOfflineDownload() {
  write(PAUSED_KEY, "1"); // stays paused across launches until the reader resumes
  controller?.abort();
}

/** Forgets the choice and frees the saved text. Saved audio stays, removable per book. */
export async function removeOfflineText() {
  write(PLAN_KEY, null);
  write(PAUSED_KEY, null);
  controller?.abort();
  write(TEXT_KEY, null);
  if (supportsOffline()) await caches.delete(LIBRARY);
  setState({ kind: "idle" });
}

/** Called once per launch: picks an unfinished download back up when there's a connection. */
export function resumeOfflineDownload() {
  const plan = getPlan();
  if (!plan || !supportsOffline() || !navigator.onLine) return;
  if (read(PAUSED_KEY) === "1") {
    if (state.kind === "idle")
      setState({ kind: "paused", stage: isTextSaved() ? "audio" : "text" });
    return;
  }
  void startOfflineDownload(plan);
}
