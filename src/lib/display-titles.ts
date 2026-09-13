type NumberedTitleKind = "book" | "chapter";

const SEPARATOR = String.raw`\s*(?:[-–—.:]|\|)\s*`;

/**
 * Removes only an obvious, leading display label or number. Stored titles are
 * never changed; this helper is exclusively for presentation.
 */
export function cleanNumberedTitle(
  title: string | null | undefined,
  kind: NumberedTitleKind,
): string {
  if (!title) return "";

  let clean = title.trim();
  const label = kind === "book" ? String.raw`(?:the\s+)?book` : "chapter";

  // Handles labels carrying simple or compound numbers: "Chapter 1-1 — ...".
  const labeledNumber = new RegExp(
    String.raw`^${label}\s+(?:no\.?\s*)?\d+(?:\s*[-–—./]\s*\d+)*${SEPARATOR}?`,
    "i",
  );
  const hadLabeledNumber = labeledNumber.test(clean);
  clean = clean.replace(
    labeledNumber,
    "",
  );

  // Handles one or more numeric prefixes: "1 — ..." or "1 — 1. ...".
  clean = clean.replace(new RegExp(String.raw`^(?:\d+${SEPARATOR})+`), "");

  // Chapter titles commonly retain a redundant "Chapter:" after their number.
  if (kind === "chapter") {
    clean = hadLabeledNumber
      ? clean.replace(/^chapter\s*(?::|[-–—])?\s+/i, "")
      : clean.replace(/^chapter\s*(?::|[-–—])\s*/i, "");
  } else {
    clean = clean.replace(/^book\s*(?::|[-–—])\s*/i, "");
  }

  return clean.trim();
}

function formatNumberedTitle(
  number: number | null | undefined,
  title: string | null | undefined,
  kind: NumberedTitleKind,
) {
  const clean = cleanNumberedTitle(title, kind);
  if (number == null) return clean;
  return clean ? `${number}. ${clean}` : `${number}.`;
}

export function formatBookTitle(number: number, title: string | null | undefined) {
  return formatNumberedTitle(number, title, "book");
}

export function formatChapterTitle(
  number: number | null | undefined,
  title: string | null | undefined,
) {
  return formatNumberedTitle(number, title, "chapter");
}