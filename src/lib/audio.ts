/**
 * Hadith narration: streamed per hadith on tap, or saved per book for offline listening.
 * Hadith files live at `${AUDIO_BASE}/<en|bn>/<hadith_number>.mp3` (written by scripts/tts-generate.mjs).
 * Chapter clips live at `${AUDIO_BASE}/chapters/<en|bn>/<chapter uuid>.mp3`.
 * The audio host must send CORS headers for this site, or saved copies can't be read back.
 */
import type { ContentLanguage } from "@/lib/language";
import {
  fetchChapterFirstHadith,
  fetchChapterNeighbours,
  fetchNeighbours,
} from "@/lib/library-api";

// Empty until the narration is uploaded; every audio control hides while it's unset.
export const AUDIO_BASE = String(import.meta.env["VITE_AUDIO_BASE"] ?? "").replace(/\/$/, "");
// Measured narration files are about 0.40 to 0.42 MB per hadith.
export const MB_PER_HADITH = 0.42;
export const MB_PER_CHAPTER = 0.14;
// ponytail: hadith numbers are 1..LAST_HADITH with no gaps; a hadith with no narration 404s and the player skips it.
export const LAST_HADITH = 16546;
const CACHE = "jk-audio";
const PARALLEL = 4;

export const audioUrl = (n: number, lang: ContentLanguage) => `${AUDIO_BASE}/${lang}/${n}.mp3`;
export const chapterAudioUrl = (id: string, lang: ContentLanguage) =>
  `${AUDIO_BASE}/chapters/${lang}/${id}.mp3`;

export type AudioTrack = {
  n: number;
  lang: ContentLanguage;
  dir: 1 | -1;
  chapter?: string;
};

export function nextTrack(track: AudioTrack, dir: 1 | -1): AudioTrack | null {
  const n = track.chapter ? (dir === 1 ? track.n : track.n - 1) : track.n + dir;
  if (n < 1 || n > LAST_HADITH) return null;
  return { n, lang: track.lang, dir };
}

/**
 * The next clip in the pages' reading order, so chapters are read out between hadiths.
 * ponytail: loads the whole book file (up to 14 MB, book 60); a small prebuilt index if that hurts.
 */
export async function adjacentTrack(track: AudioTrack, dir: 1 | -1): Promise<AudioTrack | null> {
  const { lang } = track;
  try {
    const { previous, next } = await (track.chapter
      ? fetchChapterNeighbours(track.chapter)
      : fetchNeighbours(track.n));
    const target = dir === 1 ? next : previous;
    if (!target) return null;
    if (target.kind === "hadith") return { n: target.number, lang, dir };
    const first = await fetchChapterFirstHadith(target.id);
    return { n: first ?? track.n, lang, dir, chapter: target.id };
  } catch {
    return nextTrack(track, dir); // content unreachable (offline): carry on by number
  }
}

const hasCache = () => typeof caches !== "undefined";
const savedKey = (book: number, lang: ContentLanguage) => `jk-audio-book-${book}-${lang}`;

// Saved copy when this clip's book was downloaded, otherwise the streaming URL.
export async function playableSrc(url: string): Promise<string> {
  if (!hasCache()) return url;
  const hit = await caches.match(url, { cacheName: CACHE });
  return hit ? URL.createObjectURL(await hit.blob()) : url;
}

const bookUrls = (numbers: number[], chapters: string[], lang: ContentLanguage) => [
  ...numbers.map((n) => audioUrl(n, lang)),
  ...chapters.map((id) => chapterAudioUrl(id, lang)),
];

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

/** Saves every hadith and chapter clip in the book. Already-saved files are skipped, so a retry resumes. */
export async function saveBook(
  book: number,
  numbers: number[],
  chapters: string[],
  lang: ContentLanguage,
  onProgress: (done: number, total: number) => void,
  signal: AbortSignal,
) {
  if (!hasCache()) throw new Error("This browser can't save audio for offline use.");
  const needed = (numbers.length * MB_PER_HADITH + chapters.length * MB_PER_CHAPTER) * 1e6;
  const est = await navigator.storage?.estimate?.();
  if (est?.quota != null && est.usage != null && est.quota - est.usage < needed) {
    throw new Error(`Not enough free space. This book needs about ${Math.ceil(needed / 1e6)} MB.`);
  }
  await navigator.storage?.persist?.(); // ask the browser not to clear it under storage pressure

  const cache = await caches.open(CACHE);
  const urls = bookUrls(numbers, chapters, lang);
  const queue = [...urls];
  let done = 0;
  const worker = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      signal.throwIfAborted();
      if (!(await cache.match(url))) {
        const res = await fetch(url, { signal });
        // 404 = no narration for this clip (empty text, or a chapter with no BN); anything else stops the download
        if (res.ok) await cache.put(url, res);
        else if (res.status !== 404) {
          throw new Error("Download stopped. Check your connection and tap again to resume.");
        }
      }
      onProgress(++done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  setBookSaved(book, lang, true);
}

export async function removeBook(
  book: number,
  numbers: number[],
  chapters: string[],
  lang: ContentLanguage,
) {
  if (hasCache()) {
    const cache = await caches.open(CACHE);
    await Promise.all(bookUrls(numbers, chapters, lang).map((url) => cache.delete(url)));
  }
  setBookSaved(book, lang, false);
}
