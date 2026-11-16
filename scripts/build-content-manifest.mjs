import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = join(process.cwd(), ".output", "public", "content");
const output = join(root, "manifest.json");

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") && path !== output ? [path] : [];
  }));
  return nested.flat();
}

const files = (await jsonFiles(root)).sort();
const manifest = {};
for (const file of files) {
  const path = relative(root, file).split(sep).join("/");
  manifest[path] = createHash("sha256").update(await readFile(file)).digest("hex").slice(0, 16);
}
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote content manifest with ${files.length} JSON files.`);
