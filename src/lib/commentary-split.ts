// Hadith text ends with a grading line ("Authentic: Narrated by al-Bukhārī (2924).").
// Any explanation the editors added follows it in the same string. Split there so the
// reader can show a gap between the hadith and its explanation.
// ponytail: line-start heuristic measured on all 16.5k hadiths (EN/AR/BN); a hadith whose
// grading line doesn't match just renders as before, no gap.
const GRADING_LINE = [
  /^\s*[^:\n]{2,40}: ?(narrated|reported|recorded|related|transmitted)/i,
  /^\s*agreed upon/i,
  /^\s*[^:\n]{2,30}: ?(رواه|أخرجه|متفق)/,
  /^\s*متفق عليه/,
  /^\s*(সহীহ|হাসান|মুত্তাফাকুন|সমর্থক|দুর্বল|যঈফ)[^:\n]{0,30}:/,
  /^\s*মুত্তাফাকুন আলাইহ/,
];

export function splitCommentary(text: string | null): [string | null, string | null] {
  if (!text) return [text, null];
  const lines = text.split("\n");
  const i = lines.findIndex((line) => GRADING_LINE.some((re) => re.test(line)));
  if (i < 0) return [text, null];
  const commentary = lines.slice(i + 1).join("\n").trim();
  if (!commentary) return [text, null];
  return [lines.slice(0, i + 1).join("\n").trimEnd(), commentary];
}
