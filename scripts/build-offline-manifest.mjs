#!/usr/bin/env node
// Writes offline-manifest.json into the build output: every file the app needs to read and
// search with no network (app code, content JSON, pagefind index), plus the hadith numbers and
// chapter ids per book that the "save all audio" download walks. Run after the other postbuild
// steps so the hadith chunks and pagefind index are already in place.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(repoRoot, "public", "content");
const defaultOutput = [".output/public", "dist"].find((d) => existsSync(path.join(repoRoot, d)));
const outputDir = path.resolve(
  process.env.OUTPUT_DIR ?? path.join(repoRoot, defaultOutput ?? ".output/public"),
);

// Folders saved whole. Top-level icons and the web manifest are added below.
const FOLDERS = ["assets", "content", "pagefind"];
const TOP_LEVEL = /\.(?:png|ico|webmanifest)$/i;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && !entry.name.startsWith(".")) out.push(full);
  }
  return out;
}

// Build tools put a content hash in these names, so a saved copy never goes stale.
// Every other file gets a hash here, and the app re-downloads it only when the hash changes.
const HASHED_NAME =
  /^\/(?:assets\/|pagefind\/(?:fragment|index|filter)\/|pagefind\/[^/]+\.pf_meta$)/;

const files = [];
const hashes = {};
let bytes = 0;
const add = async (full) => {
  const url = "/" + path.relative(outputDir, full).split(path.sep).join("/");
  files.push(url);
  bytes += (await stat(full)).size;
  if (!HASHED_NAME.test(url)) {
    hashes[url] = createHash("sha1")
      .update(await readFile(full))
      .digest("hex")
      .slice(0, 12);
  }
};

for (const folder of FOLDERS) {
  const dir = path.join(outputDir, folder);
  if (!existsSync(dir)) {
    console.error(`offline manifest: missing ${dir}; run the other postbuild steps first`);
    process.exit(1);
  }
  for (const full of await walk(dir)) await add(full);
}
for (const entry of await readdir(outputDir, { withFileTypes: true })) {
  if (entry.isFile() && TOP_LEVEL.test(entry.name)) await add(path.join(outputDir, entry.name));
}
files.sort();

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const books = await readJson(path.join(contentDir, "books.json"));
const audioBooks = [];
for (const book of [...books].sort((a, b) => a.book_number - b.book_number)) {
  const dir = path.join(contentDir, `book-${book.book_number}`);
  const hadiths = await readJson(path.join(dir, "hadiths.json"));
  const hasIntro = (x) => !!x.intro_en_display?.trim();
  // book + collection introductions are read aloud too and share the chapter clip path;
  // the book id is always listed (some books have a Bangla intro only, a missing clip is skipped)
  let chapters = [book.id];
  try {
    const file = await readJson(path.join(dir, "chapters.json"));
    chapters = [
      ...chapters,
      ...(file.collections ?? []).filter(hasIntro).map((c) => c.id),
      ...file.chapters.map((c) => c.id),
    ];
  } catch {
    // a book with no chapters file has no chapter clips
  }
  audioBooks.push({
    book: book.book_number,
    numbers: hadiths.map((h) => h.hadith_number).sort((a, b) => a - b),
    chapters,
  });
}

const manifest = {
  version: new Date().toISOString(),
  text: { bytes, files, hashes },
  audio: { books: audioBooks },
};
await writeFile(path.join(outputDir, "offline-manifest.json"), JSON.stringify(manifest));
console.log(
  `offline manifest: ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB, ` +
    `${audioBooks.length} books of audio -> ${path.join(outputDir, "offline-manifest.json")}`,
);
