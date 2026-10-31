/**
 * Hadith narration: streamed per hadith on tap, or saved per book for offline listening.
 * Files live at `${AUDIO_BASE}/<en|bn>/<hadith_number>.mp3` (written by scripts/tts-generate.mjs).
 * The audio host must send CORS headers for this site, or saved copies can't be read back.
 */
import type { ContentLanguage } from "@/lib/language";

// Empty until the narration is uploaded; every audio control hides while it's unset.
export const AUDIO_BASE = String(import.meta.env["VITE_AUDIO_BASE"] ?? "").replace(/\/$/, "");
// ~700 characters per hadith ≈ 0.7 min of speech ≈ 0.35 MB at 64 kbps mono.
export const MB_PER_HADITH = 0.35;
// ponytail: hadith numbers are 1..LAST_HADITH with no gaps; a hadith with no narration 404s and the player skips it.
export const LAST_HADITH = 16546;
const CACHE = "jk-audio";
const PARALLEL = 4;

export const audioUrl = (n: number, lang: ContentLanguage) => `${AUDIO_BASE}/${lang}/${n}.mp3`;
const hasCache = () => typeof caches !== "undefined";
const savedKey = (book: number, lang: ContentLanguage) => `jk-audio-book-${book}-${lang}`;

// Saved copy when this hadith's book was downloaded, otherwise the streaming URL.
export async function playableSrc(n: number, lang: ContentLanguage): Promise<string> {
  if (!hasCache()) return audioUrl(n, lang);
  const hit = await caches.match(audioUrl(n, lang), { cacheName: CACHE });
  return hit ? URL.createObjectURL(await hit.blob()) : audioUrl(n, lang);
}

// ponytail: a flag, not a cache scan; if the browser evicts the files, playback just streams.
export function isBookSaved(book: number, lang: ContentLanguage) {
  try {
    return localStorage.getItem(savedKey(book, lang)) === "1";
  } catch {
    return false;
  }
}

function setBookSaved(book: number, lang: ContentLanguage, saved: boolean) {
  try {
    if (saved) localStorage.setItem(savedKey(book, lang), "1");
    else localStorage.removeItem(savedKey(book, lang));
  } catch {
    // storage blocked: the files are still saved, only the label resets
  }
}

/** Saves every hadith in the book. Already-saved files are skipped, so a retry resumes. */
export async function saveBook(
  book: number,
  numbers: number[],
  lang: ContentLanguage,
  onProgress: (done: number, total: number) => void,
  signal: AbortSignal,
) {
  if (!hasCache()) throw new Error("This browser can't save audio for offline use.");
  const needed = numbers.length * MB_PER_HADITH * 1e6;
  const est = await navigator.storage?.estimate?.();
  if (est?.quota != null && est.usage != null && est.quota - est.usage < needed) {
    throw new Error(`Not enough free space. This book needs about ${Math.ceil(needed / 1e6)} MB.`);
  }
  await navigator.storage?.persist?.(); // ask the browser not to clear it under storage pressure

  const cache = await caches.open(CACHE);
  const queue = [...numbers];
  let done = 0;
  const worker = async () => {
    for (let n = queue.shift(); n !== undefined; n = queue.shift()) {
      signal.throwIfAborted();
      const url = audioUrl(n, lang);
      if (!(await cache.match(url))) {
        const res = await fetch(url, { signal });
        // 404 = no narration for this hadith (empty text); anything else stops the download
        if (res.ok) await cache.put(url, res);
        else if (res.status !== 404) {
          throw new Error(
            `Download stopped at hadith ${n}. Check your connection and tap again to resume.`,
          );
        }
      }
      onProgress(++done, numbers.length);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  setBookSaved(book, lang, true);
}

export async function removeBook(book: number, numbers: number[], lang: ContentLanguage) {
  if (hasCache()) {
    const cache = await caches.open(CACHE);
    await Promise.all(numbers.map((n) => cache.delete(audioUrl(n, lang))));
  }
  setBookSaved(book, lang, false);
}
