#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(repoRoot, "public", "content");
const defaultOutput = [".output/public", "dist"].find((directory) =>
  existsSync(path.join(repoRoot, directory)),
);
const outputDir = path.resolve(
  process.env.OUTPUT_DIR ?? path.join(repoRoot, defaultOutput ?? ".output/public"),
);
const chunksDir = path.join(outputDir, "content", "hadith-chunks");
const chunkSize = 50;

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

await rm(chunksDir, { recursive: true, force: true });
await mkdir(chunksDir, { recursive: true });

const books = await readJson(path.join(contentDir, "books.json"));
let hadithCount = 0;

for (const book of books) {
  const bookDir = path.join(contentDir, `book-${book.book_number}`);
  const hadiths = await readJson(path.join(bookDir, "hadiths.json"));
  let overrides = {};

  try {
    overrides = await readJson(path.join(bookDir, "qc-overrides.json"));
  } catch {
    // Most books do not have reviewed overrides.
  }

  const grouped = new Map();
  for (const sourceHadith of hadiths) {
    const override = overrides[String(sourceHadith.hadith_number)];
    const hadith = override ? { ...sourceHadith, ...override } : sourceHadith;
    const chunkNumber = Math.floor((hadith.hadith_number - 1) / chunkSize);
    const chunk = grouped.get(chunkNumber) ?? [];
    chunk.push(hadith);
    grouped.set(chunkNumber, chunk);
    hadithCount += 1;
  }

  for (const [chunkNumber, bookChunk] of grouped) {
    const outputFile = path.join(chunksDir, `${chunkNumber}.json`);
    let existing = [];
    if (existsSync(outputFile)) existing = await readJson(outputFile);

    const merged = new Map(
      [...existing, ...bookChunk].map((hadith) => [hadith.hadith_number, hadith]),
    );
    const chunk = [...merged.values()].sort((a, b) => a.hadith_number - b.hadith_number);
    if (chunk.length > chunkSize) {
      throw new Error(`Hadith chunk ${chunkNumber} exceeds ${chunkSize} records`);
    }
    await writeFile(outputFile, JSON.stringify(chunk), "utf8");
  }
}

const expectedCount = Number((await readJson(path.join(contentDir, "stats.json"))).hadiths);
if (hadithCount !== expectedCount) {
  throw new Error(`Chunked ${hadithCount} hadiths; expected ${expectedCount}`);
}

const chunkCount = Math.ceil(hadithCount / chunkSize);
let largestChunkBytes = 0;
for (let chunkNumber = 0; chunkNumber < chunkCount; chunkNumber += 1) {
  const file = path.join(chunksDir, `${chunkNumber}.json`);
  if (!existsSync(file)) throw new Error(`Missing hadith chunk ${chunkNumber}`);
  largestChunkBytes = Math.max(largestChunkBytes, (await stat(file)).size);
}

console.log(
  `hadith chunks: ${hadithCount} records in ${chunkCount} files (max ${largestChunkBytes} bytes) -> ${chunksDir}`,
);
