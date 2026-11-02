import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { LAST_HADITH, adjacentTrack, nextTrack, type AudioTrack } from "../src/lib/audio";

// Serves /content/* from public/, so the real reading order is what gets walked.
globalThis.fetch = (async (url: string | URL) => {
  const file = `public${String(url).replace(/^https?:\/\/[^/]+/, "")}`;
  return existsSync(file) ? new Response(readFileSync(file)) : new Response("", { status: 404 });
}) as typeof fetch;

const hadith: AudioTrack = { n: 12, lang: "en", dir: 1 };
const chapter: AudioTrack = { n: 12, lang: "bn", dir: 1, chapter: "chapter-id" };

assert.deepEqual(nextTrack(hadith, 1), { n: 13, lang: "en", dir: 1 });
assert.equal(nextTrack({ ...hadith, n: 1 }, -1), null);
assert.equal(nextTrack({ ...hadith, n: LAST_HADITH }, 1), null);
assert.deepEqual(nextTrack(chapter, 1), { n: 12, lang: "bn", dir: 1 });
assert.deepEqual(nextTrack(chapter, -1), { n: 11, lang: "bn", dir: -1 });
assert.equal(nextTrack({ ...chapter, n: 1 }, -1), null);

// Hadith 2 opens a chapter: its clip plays between 1 and 2, in both directions.
const OPENS_2 = "2ed12fe7-5183-4495-a625-aedd56fdf4d2";
const intoChapter = await adjacentTrack({ n: 1, lang: "en", dir: 1 }, 1);
assert.deepEqual(intoChapter, { n: 2, lang: "en", dir: 1, chapter: OPENS_2 });
assert.deepEqual(await adjacentTrack(intoChapter!, 1), { n: 2, lang: "en", dir: 1 });
assert.deepEqual(await adjacentTrack({ n: 2, lang: "en", dir: 1 }, -1), {
  n: 2,
  lang: "en",
  dir: -1,
  chapter: OPENS_2,
});
assert.deepEqual(await adjacentTrack({ ...intoChapter!, dir: -1 }, -1), {
  n: 1,
  lang: "en",
  dir: -1,
});
assert.equal(await adjacentTrack({ n: LAST_HADITH, lang: "en", dir: 1 }, 1), null);

console.log("Audio step checks passed.");
