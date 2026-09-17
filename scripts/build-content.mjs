#!/usr/bin/env node
/**
 * Builds static content files from the Supabase export into public/content/.
 *
 * Input (EXPORT_DIR env var, default ../hadith-export):
 *   books.json, collections.json, chapters.json, hadiths.json, import_documents.json
 *
 * Output (public/content/):
 *   books.json                         all books, Book shape, sorted
 *   book-<n>/chapters.json             { collections, chapters } for book <n>, sorted
 *   book-<n>/hadiths.json              all hadiths of book <n>, HadithFull shape
 *   hadith-index.json                  [{ n: hadith_number, b: book_number }]
 *   stats.json                         { books, hadiths, chapters, collections, documents }
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportDir = path.resolve(
  process.env.EXPORT_DIR ?? path.join(repoRoot, "..", "hadith-export"),
);
const outDir = path.join(repoRoot, "public", "content");

const INTRO_KEYS = ["intro_ar_source", "intro_ar_display", "intro_en_source", "intro_en_display"];

function pick(row, keys) {
  const out = {};
  for (const key of keys) out[key] = row[key] ?? null;
  return out;
}

async function readExport(name) {
  return JSON.parse(await readFile(path.join(exportDir, name), "utf8"));
}

const [booksRaw, collectionsRaw, chaptersRaw, hadithsRaw, documentsRaw] = await Promise.all([
  readExport("books.json"),
  readExport("collections.json"),
  readExport("chapters.json"),
  readExport("hadiths.json"),
  readExport("import_documents.json").catch(() => []),
]);

const documents = Array.isArray(documentsRaw) ? documentsRaw : [];
if (!Array.isArray(documentsRaw)) {
  console.warn(
    "WARNING: import_documents.json is not an array (export error?); documents count set to 0.",
  );
}

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

const books = booksRaw
  .map((b) => ({
    ...pick(b, INTRO_KEYS),
    id: b.id,
    book_number: b.book_number,
    title_ar: b.title_ar ?? null,
    title_en: b.title_en ?? null,
    sort_order: b.sort_order ?? 0,
  }))
  .sort((a, b) => bySortOrder(a, b) || a.book_number - b.book_number);

const bookNumberById = new Map(booksRaw.map((b) => [b.id, b.book_number]));

const collections = collectionsRaw.map((c) => ({
  ...pick(c, INTRO_KEYS),
  id: c.id,
  book_id: c.book_id ?? null,
  title_ar: c.title_ar ?? null,
  title_en: c.title_en ?? null,
  sort_order: c.sort_order ?? 0,
}));

const chapters = chaptersRaw.map((c) => ({
  ...pick(c, INTRO_KEYS),
  id: c.id,
  book_id: c.book_id ?? null,
  collection_id: c.collection_id ?? null,
  chapter_number: c.chapter_number ?? null,
  title_ar: c.title_ar ?? null,
  title_en: c.title_en ?? null,
  sort_order: c.sort_order ?? 0,
}));

let orphans = 0;
const hadiths = hadithsRaw.map((h) => {
  let bookNumber = h.book_id ? bookNumberById.get(h.book_id) : undefined;
  if (bookNumber === undefined) {
    orphans += 1;
    bookNumber = 0;
  }
  return {
    row: {
      id: h.id,
      hadith_number: h.hadith_number,
      book_id: h.book_id ?? null,
      collection_id: h.collection_id ?? null,
      chapter_id: h.chapter_id ?? null,
      arabic_source: h.arabic_source ?? null,
      arabic_display: h.arabic_display ?? null,
      english_source: h.english_source ?? null,
      english_display: h.english_display ?? null,
      full_source_content: h.full_source_content ?? null,
      full_display_content: h.full_display_content ?? null,
      sort_order: h.sort_order ?? 0,
      source_document_id: h.source_document_id ?? null,
    },
    bookNumber,
  };
});

await mkdir(outDir, { recursive: true });

let totalBytes = 0;
let largest = { file: "", bytes: 0 };

async function emit(relPath, data) {
  const filePath = path.join(outDir, relPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(data);
  await writeFile(filePath, json);
  const bytes = Buffer.byteLength(json);
  totalBytes += bytes;
  if (bytes > largest.bytes) largest = { file: relPath, bytes };
}

await emit("books.json", books);

const bookNumbers = [...new Set([...books.map((b) => b.book_number), 0])];
const perBookCounts = [];

for (const bookNumber of bookNumbers) {
  const bookIds = new Set(booksRaw.filter((b) => b.book_number === bookNumber).map((b) => b.id));
  const bookCollections = collections.filter((c) => bookIds.has(c.book_id)).sort(bySortOrder);
  const bookChapters = chapters.filter((c) => bookIds.has(c.book_id)).sort(bySortOrder);
  const bookHadiths = hadiths
    .filter((h) => h.bookNumber === bookNumber)
    .map((h) => h.row)
    .sort((a, b) => a.sort_order - b.sort_order || a.hadith_number - b.hadith_number);

  if (bookNumber === 0 && !bookHadiths.length && !bookChapters.length) continue;

  await emit(`book-${bookNumber}/chapters.json`, {
    collections: bookCollections,
    chapters: bookChapters,
  });
  await emit(`book-${bookNumber}/hadiths.json`, bookHadiths);
  perBookCounts.push([bookNumber, bookHadiths.length]);
}

const hadithIndex = hadiths
  .map((h) => ({ n: h.row.hadith_number, b: h.bookNumber }))
  .sort((a, b) => a.n - b.n);
await emit("hadith-index.json", hadithIndex);

await emit("stats.json", {
  books: books.length,
  hadiths: hadiths.length,
  chapters: chapters.length,
  collections: collections.length,
  documents: documents.length,
});

if (orphans > 0) {
  console.warn(`\n!!! WARNING: ${orphans} hadiths had a missing or unresolvable book_id;`);
  console.warn("!!! they were written to public/content/book-0/ with book_number 0.\n");
}

const fmt = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;

console.log("Content build complete.");
console.log(
  `  books: ${books.length}, collections: ${collections.length}, chapters: ${chapters.length}, hadiths: ${hadiths.length}`,
);
console.log("\nPer-book hadith counts:");
console.log(
  perBookCounts.map(([n, count]) => `  book ${String(n).padStart(2)}: ${count}`).join("\n"),
);
console.log(`\nTotal written: ${fmt(totalBytes)}`);
console.log(`Largest file: ${largest.file} (${fmt(largest.bytes)})`);
