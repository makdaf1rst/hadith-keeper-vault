#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(repoRoot, "public", "content");
const defaultOutput = [".output/public", "dist"].find((d) =>
  existsSync(path.join(repoRoot, d)),
);
const outputDir = path.resolve(
  process.env.OUTPUT_DIR ?? path.join(repoRoot, defaultOutput ?? ".output/public"),
);

const baseUrl = "https://jami-al-kamil.com";

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const books = await readJson(path.join(contentDir, "books.json"));
const hadithIndex = await readJson(path.join(contentDir, "hadith-index.json"));

const urls = new Set([
  `${baseUrl}/`,
  `${baseUrl}/announcements`,
  `${baseUrl}/contact`,
  `${baseUrl}/projects`,
]);

for (const book of books) {
  urls.add(`${baseUrl}/book/${book.book_number}`);

  try {
    const structure = await readJson(
      path.join(contentDir, `book-${book.book_number}`, "chapters.json"),
    );
    for (const chapter of structure.chapters ?? []) {
      if (chapter.id) urls.add(`${baseUrl}/chapter/${chapter.id}`);
    }
  } catch {
    // Keep generating the sitemap even if a book has no chapter file.
  }
}

for (const hadith of hadithIndex) {
  if (hadith.n != null) urls.add(`${baseUrl}/hadith/${hadith.n}`);
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [...urls]
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n") +
  "\n</urlset>\n";

await writeFile(path.join(outputDir, "sitemap.xml"), xml, "utf8");
console.log(`sitemap: ${urls.size} URLs -> ${path.join(outputDir, "sitemap.xml")}`);
