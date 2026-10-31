import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DAILY_EXCLUDED_NUMBERS,
  DAILY_EXCLUSION_RE,
  DAILY_GRADE_BN_RE,
  DAILY_GRADE_EN_RE,
  DAILY_SAYING_BN_RE,
  DAILY_SAYING_EN_RE,
  DAILY_THEME_RE,
} from "./daily-hadith-rules.mjs";

const content = join(process.cwd(), ".output", "public", "content");
const output = join(process.cwd(), "ios", "App", "DailyHadithWidget", "daily-hadith.json");
const directories = (await readdir(content, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^book-\d+$/.test(entry.name))
  .sort((a, b) => Number(a.name.slice(5)) - Number(b.name.slice(5)));

// Whole hadith text with the number prefix and closing grade line removed; "" when ungraded.
function hadithText(value, gradeRe) {
  if (typeof value !== "string") return "";
  const lines = value.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const grade = lines.findIndex((line, index) => index > 0 && gradeRe.test(line));
  if (grade < 0) return "";
  return lines
    .slice(0, grade)
    .join(" ")
    .replace(/^[০-৯0-9]+\s*[—–-]\s*/u, "")
    .trim();
}

const books = [];
for (const directory of directories) {
  const bookNumber = Number(directory.name.slice(5));
  const english = JSON.parse(await readFile(join(content, directory.name, "hadiths.json"), "utf8"));
  let bengali;
  try {
    bengali = JSON.parse(await readFile(join(content, "bengali", directory.name, "hadiths.json"), "utf8"));
  } catch {
    continue;
  }
  const candidates = english.flatMap((hadith) => {
    const bnRecord = bengali[String(hadith.hadith_number)];
    const en = hadithText(hadith.english_display ?? hadith.english_source, DAILY_GRADE_EN_RE);
    const bn = hadithText(bnRecord?.text, DAILY_GRADE_BN_RE);
    if (DAILY_EXCLUDED_NUMBERS.has(hadith.hadith_number)) return [];
    if (!bn || en.length < 40 || en.length > 240 || bn.length > 320) return [];
    if (!DAILY_SAYING_EN_RE.test(en) || !DAILY_SAYING_BN_RE.test(bn)) return [];
    if (!DAILY_THEME_RE.test(en) || DAILY_EXCLUSION_RE.test(`${en}\n${bn}`)) return [];
    return [{ n: hadith.hadith_number, en, bn, bookNumber }];
  });
  if (candidates.length) books.push(candidates);
}

function sayingWords(en) {
  const words = en.slice(en.indexOf("“")).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().match(/\p{L}+/gu);
  return new Set(words);
}

// The same saying through another narrator, often reworded, would repeat on a later day.
function repeatsSaying(words, seen) {
  return seen.some((other) => {
    const shared = [...words].filter((word) => other.has(word)).length;
    return shared / Math.min(words.size, other.size) >= 0.7;
  });
}

const selected = [];
const seen = [];
for (let row = 0; selected.length < 366; row += 1) {
  let reachedAny = false;
  for (const candidates of books) {
    const item = candidates[row];
    if (!item) continue;
    reachedAny = true;
    const words = sayingWords(item.en);
    if (repeatsSaying(words, seen)) continue;
    seen.push(words);
    selected.push(item);
    if (selected.length === 366) break;
  }
  if (!reachedAny) break;
}
if (selected.length !== 366) throw new Error(`Only ${selected.length} suitable daily hadiths found`);
await mkdir(join(process.cwd(), "ios", "App", "DailyHadithWidget"), { recursive: true });
await writeFile(output, `${JSON.stringify(selected.map(({ n, en, bn }) => ({ n, en, bn })), null, 2)}\n`);
console.log(`Wrote ${selected.length} daily hadiths across ${books.length} books.`);
