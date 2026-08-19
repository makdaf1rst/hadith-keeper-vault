/**
 * Normalization helpers used ONLY for search indexing and query matching.
 * Displayed text is never altered by these functions.
 */

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;

export function normalizeArabic(input: string): string {
  return input
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673]/g, "\u0627") // alif variants -> alif
    .replace(/\u0649/g, "\u064A") // alif maqsura -> ya
    .replace(/\u0629/g, "\u0647") // ta marbuta -> ha
    .replace(/\u0624/g, "\u0648") // waw hamza -> waw
    .replace(/\u0626/g, "\u064A") // ya hamza -> ya
    .replace(/[\u0621]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEnglish(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin diacritics (Bukhārī -> Bukhari)
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bb\u02bc'`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function containsArabic(input: string): boolean {
  return /[\u0600-\u06FF]/.test(input);
}

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}
