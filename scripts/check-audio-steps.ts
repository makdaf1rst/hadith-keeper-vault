import assert from "node:assert/strict";

import { LAST_HADITH, nextTrack, type AudioTrack } from "../src/lib/audio";

const hadith: AudioTrack = { n: 12, lang: "en", dir: 1 };
const chapter: AudioTrack = { n: 12, lang: "bn", dir: 1, chapter: "chapter-id" };

assert.deepEqual(nextTrack(hadith, 1), { n: 13, lang: "en", dir: 1 });
assert.equal(nextTrack({ ...hadith, n: 1 }, -1), null);
assert.equal(nextTrack({ ...hadith, n: LAST_HADITH }, 1), null);
assert.deepEqual(nextTrack(chapter, 1), { n: 12, lang: "bn", dir: 1 });
assert.deepEqual(nextTrack(chapter, -1), { n: 11, lang: "bn", dir: -1 });
assert.equal(nextTrack({ ...chapter, n: 1 }, -1), null);

console.log("Audio step checks passed.");
