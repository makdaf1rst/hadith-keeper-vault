import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DAILY_EXCLUDED_NUMBERS, DAILY_EXCLUSION_RE, DAILY_SAYING_BN_RE, DAILY_SAYING_EN_RE, DAILY_THEME_RE } from "./daily-hadith-rules.mjs";
import { CONTENT_PATH_RE } from "../src/lib/content-path.mjs";

const root = process.cwd();
const config = readFileSync(join(root, "capacitor.config.ts"), "utf8");
assert.match(config, /webDir:\s*["']dist-ios["']/);
assert.doesNotMatch(config, /\bserver\s*:/);
for (const path of ["index.html", "content/manifest.json", "pagefind/pagefind.js", "daily-hadith.json"]) {
  assert.ok(existsSync(join(root, "dist-ios", path)), `Missing dist-ios/${path}`);
}
for (const path of ["sw.js", "robots.txt", "llms.txt", "manifest.webmanifest"]) {
  assert.ok(!existsSync(join(root, "dist-ios", path)), `Web-only file in dist-ios/${path}`);
}
assert.doesNotMatch(readFileSync(join(root, "dist-ios", "index.html"), "utf8"), /fonts\.googleapis/);
for (const name of readdirSync(join(root, "dist-ios", "assets"))) {
  if (!name.endsWith(".js")) continue;
  const source = readFileSync(join(root, "dist-ios", "assets", name), "utf8");
  assert.doesNotMatch(source, /reserved for a future gifting option|The future Send Gift page/, `Send Gift page in ${name}`);
}
const daily = JSON.parse(readFileSync(join(root, "dist-ios", "daily-hadith.json"), "utf8"));
assert.equal(daily.length, 366);
assert.equal(new Set(daily.map((item) => item.n)).size, 366);
for (const item of daily) {
  assert.ok(!DAILY_EXCLUDED_NUMBERS.has(item.n));
  assert.ok(item.en.length >= 40 && item.en.length <= 240);
  assert.ok(item.bn.length <= 320 && item.bn.length > 0);
  assert.match(item.en, DAILY_SAYING_EN_RE);
  assert.match(item.bn, DAILY_SAYING_BN_RE);
  assert.match(item.en, DAILY_THEME_RE);
  assert.doesNotMatch(`${item.en}\n${item.bn}`, DAILY_EXCLUSION_RE);
}
for (const rejected of ["../x.json", "https://x/y.json", "a.js"]) assert.equal(CONTENT_PATH_RE.test(rejected), false);
assert.equal(CONTENT_PATH_RE.test("book-1/hadiths.json"), true);
console.log("iOS bundle checks passed.");
