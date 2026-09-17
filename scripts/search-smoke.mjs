// In-process search harness for a built pagefind index.
// Usage: node scripts/search-smoke.mjs [indexDir]
// Patches global fetch so pagefind.js can load its file:// fragments in Node.
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const indexDir = path.resolve(process.argv[2] ?? path.join(".output", "public", "pagefind"));

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith("file://")) {
    const buf = await readFile(fileURLToPath(url));
    return new Response(buf, { status: 200 });
  }
  return realFetch(input, init);
};

const pagefind = await import(pathToFileURL(path.join(indexDir, "pagefind.js")).href);

await pagefind.init();

async function run(label, term, options) {
  const res = await pagefind.search(term, options);
  const hits = [];
  for (const r of res.results.slice(0, 5)) {
    const data = await r.data();
    hits.push({ url: data.url, meta: data.meta });
  }
  console.log(`\n== ${label}: "${term}" ${options ? JSON.stringify(options) : ""}`);
  console.log(`   total results: ${res.results.length}`);
  for (const h of hits) console.log("  ", h.url, JSON.stringify(h.meta));
  return res.results.length;
}

const mode = process.argv[3] ?? "all";
if (mode === "all" || mode === "smoke") {
  await run("english", "intentions");
  await run("arabic", "الأعمال بالنيات");
  await run("arabic-diacritics", "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ");
  await run("filtered-book-9", "prayer", { filters: { book: ["9"] } });
  await run("heading", "Revelation");
}
if (mode === "dupcheck") {
  await run("dup-ar", "النيات");
  await run("dup-en", "intentions");
  await run("dup-en2", "prayer");
}
