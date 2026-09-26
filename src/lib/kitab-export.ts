import { formatBookTitle, formatChapterTitle, orderCollectionChapters } from "@/lib/display-titles";
import type { BengaliStructuralTranslation } from "@/lib/bengali-translations";
import type { Book, Chapter, Collection, HadithFull, Intro } from "@/lib/library-api";

/**
 * Builds a deterministic, display-only export model for one Kitāb.
 * It reads exactly what the database stores and never rewrites scholarly text.
 */

export type ExportLang = "en" | "bn";

export type ExportBlock =
  | { kind: "kitab"; en: string; ar: string | null }
  | { kind: "collection"; en: string | null; ar: string | null }
  | { kind: "chapter"; anchor: string; en: string; ar: string | null }
  | { kind: "intro"; label: string; ar: string | null; en: string | null }
  | {
      kind: "hadith";
      number: number;
      ar: string | null;
      en: string | null;
      extra: string | null;
    };

export type TocEntry = { anchor: string; label: string; ar: string | null };

export type KitabExport = {
  title: string;
  titleAr: string | null;
  lang: ExportLang;
  toc: TocEntry[];
  blocks: ExportBlock[];
};

/** Optional Bengali material, read from the site's current Bengali content files. */
export type BengaliExportData = {
  bookTitle: string | null;
  bookIntro: string | null;
  collections: Map<string, BengaliStructuralTranslation>;
  chapters: Map<string, BengaliStructuralTranslation>;
  hadiths: Record<string, { text: string }>;
};

export type ExportOptions = {
  lang?: ExportLang;
  /** When set, only this Collection (Majmūʿ) is exported. */
  collectionId?: string;
  bengali?: BengaliExportData | null;
};

function pick(display: string | null | undefined, source: string | null | undefined) {
  const value = display ?? source;
  return value && value.trim().length > 0 ? value : null;
}

function introBlock(
  intro: Partial<Intro>,
  label: string,
  bn?: { intro_bn_display?: string | null; intro_bn_source?: string | null } | string | null,
  lang: ExportLang = "en",
): ExportBlock | null {
  const ar = pick(intro.intro_ar_display, intro.intro_ar_source);
  const tr =
    lang === "bn"
      ? typeof bn === "string"
        ? pick(bn, null)
        : pick(bn?.intro_bn_display, bn?.intro_bn_source)
      : pick(intro.intro_en_display, intro.intro_en_source);
  if (!ar && !tr) return null;
  return { kind: "intro", label, ar, en: tr };
}

/** Same de-duplication the reading view uses: keep trailing material, drop repeats. */
function remainder(full: string | null, parts: (string | null)[]) {
  if (!full) return null;
  let rest = full;
  for (const part of parts) {
    if (!part) continue;
    const at = rest.indexOf(part.trim());
    if (at !== -1) {
      rest = (rest.slice(0, at) + "\n" + rest.slice(at + part.trim().length)).trim();
    }
  }
  return rest.trim().length > 0 ? rest.trim() : null;
}

function hadithBlock(h: HadithFull, lang: ExportLang, bengali?: BengaliExportData | null): ExportBlock {
  const ar = pick(h.arabic_display, h.arabic_source);
  if (lang === "bn") {
    const bn = pick(bengali?.hadiths[String(h.hadith_number)]?.text, null);
    return { kind: "hadith", number: h.hadith_number, ar, en: bn, extra: null };
  }
  const en = pick(h.english_display, h.english_source);
  const full = pick(h.full_display_content, h.full_source_content);
  return {
    kind: "hadith",
    number: h.hadith_number,
    ar,
    en,
    extra: remainder(full, [ar, en]),
  };
}

function byOrder<T extends { sort_order: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

function hadithOrder(rows: HadithFull[]) {
  return [...rows].sort(
    (a, b) => a.sort_order - b.sort_order || a.hadith_number - b.hadith_number,
  );
}

export function buildKitabExport(
  book: Book,
  collections: Collection[],
  chapters: Chapter[],
  hadiths: HadithFull[],
  options: ExportOptions = {},
): KitabExport {
  const lang = options.lang ?? "en";
  const bengali = lang === "bn" ? options.bengali ?? null : null;
  const L =
    lang === "bn"
      ? { kitabIntro: "কিতাবের ভূমিকা", collIntro: "মাজমূ‘-এর ভূমিকা", babIntro: "বাবের ভূমিকা", bab: "বাব" }
      : { kitabIntro: "Kitāb introduction", collIntro: "Majmūʿ introduction", babIntro: "Bāb introduction", bab: "Bāb" };

  const blocks: ExportBlock[] = [];
  const toc: TocEntry[] = [];
  const bookTitle =
    (lang === "bn" ? bengali?.bookTitle : null) ??
    (formatBookTitle(book.book_number, book.title_en) || `Book ${book.book_number}`);
  const only = options.collectionId
    ? collections.find((c) => c.id === options.collectionId) ?? null
    : null;
  const onlyTitle = only
    ? (lang === "bn" ? pick(bengali?.collections.get(only.id)?.title_bn, null) : null) ??
      only.title_en ??
      only.title_ar ??
      ""
    : null;
  const title = only ? `${bookTitle} — ${onlyTitle}` : bookTitle;

  blocks.push({ kind: "kitab", en: bookTitle, ar: book.title_ar });
  if (!only) {
    const bookIntro = introBlock(book, L.kitabIntro, bengali?.bookIntro ?? null, lang);
    if (bookIntro) blocks.push(bookIntro);
  }

  const used = new Set<string>();
  let anchorCount = 0;

  const pushChapter = (chapter: Chapter) => {
    const bnTitle = lang === "bn" ? pick(bengali?.chapters.get(chapter.id)?.title_bn, null) : null;
    const label =
      (bnTitle ? formatChapterTitle(chapter.chapter_number, bnTitle) : null) ||
      formatChapterTitle(chapter.chapter_number, chapter.title_en) ||
      L.bab;
    const anchor = `bab_${++anchorCount}`;
    toc.push({ anchor, label, ar: chapter.title_ar });
    blocks.push({ kind: "chapter", anchor, en: label, ar: chapter.title_ar });
    const intro = introBlock(chapter, L.babIntro, bengali?.chapters.get(chapter.id), lang);
    if (intro) blocks.push(intro);
    for (const h of hadithOrder(hadiths.filter((x) => x.chapter_id === chapter.id))) {
      used.add(h.id);
      blocks.push(hadithBlock(h, lang, bengali));
    }
  };

  const pushCollection = (collection: Collection) => {
    const bnTitle = lang === "bn" ? pick(bengali?.collections.get(collection.id)?.title_bn, null) : null;
    blocks.push({ kind: "collection", en: bnTitle ?? collection.title_en, ar: collection.title_ar });
    const intro = introBlock(collection, L.collIntro, bengali?.collections.get(collection.id), lang);
    if (intro) blocks.push(intro);
    const own = orderCollectionChapters(chapters.filter((c) => c.collection_id === collection.id));
    for (const chapter of own) pushChapter(chapter);
    for (const h of hadithOrder(
      hadiths.filter((x) => x.collection_id === collection.id && !x.chapter_id),
    )) {
      used.add(h.id);
      blocks.push(hadithBlock(h, lang, bengali));
    }
  };

  if (only) {
    pushCollection(only);
  } else {
    for (const collection of byOrder(collections)) pushCollection(collection);
    for (const chapter of byOrder(chapters.filter((c) => !c.collection_id))) pushChapter(chapter);
    const leftovers = hadithOrder(hadiths.filter((h) => !used.has(h.id)));
    for (const h of leftovers) blocks.push(hadithBlock(h, lang, bengali));
  }

  return { title, titleAr: book.title_ar, lang, toc, blocks };
}

export function kitabFileName(book: Book, extension: string, collection?: Collection | null) {
  const suffix = collection ? `-Majmu-${collection.sort_order}-${collection.title_en ?? ""}` : "";
  const base = `Kitab-${book.book_number}-${formatBookTitle(book.book_number, book.title_en) || ""}${suffix}`;
  const safe = base
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s._-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return `${safe || `Kitab-${book.book_number}`}.${extension}`;
}

function paragraphs(value: string) {
  return value
    .split(/\n{1,}/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/* ------------------------------ DOCX ------------------------------ */

export async function downloadKitabDocx(model: KitabExport, fileName: string) {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    HeadingLevel,
    PageBreak,
    Header,
    Footer,
    PageNumber,
    Bookmark,
    InternalHyperlink,
  } = await import("docx");

  const ARABIC_FONT = "Traditional Arabic";

  const ar = (value: string, size = 30) =>
    paragraphs(value).map(
      (line) =>
        new Paragraph({
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 160, line: 400 },
          children: [new TextRun({ text: line, font: ARABIC_FONT, size, rightToLeft: true })],
        }),
    );

  const en = (value: string, opts: { bold?: boolean; size?: number } = {}) =>
    paragraphs(value).map(
      (line) =>
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 140, line: 300 },
          children: [
            new TextRun({
              text: line,
              font: model.lang === "bn" ? "Nirmala UI" : "Georgia",
              size: opts.size ?? 22,
              ...(opts.bold ? { bold: true } : {}),
            }),
          ],
        }),
    );

  const children: InstanceType<typeof Paragraph>[] = [];
  const bn = model.lang === "bn";
  const TR_FONT = bn ? "Nirmala UI" : "Georgia";

  const tocBlocks = () => {
    if (model.toc.length === 0) return;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 160 },
        children: [
          new TextRun({ text: bn ? "সূচিপত্র" : "Contents", bold: true, size: 28, font: TR_FONT }),
        ],
      }),
    );
    for (const entry of model.toc) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new InternalHyperlink({
              anchor: entry.anchor,
              children: [
                new TextRun({ text: entry.label, style: "Hyperlink", font: TR_FONT, size: 22 }),
              ],
            }),
          ],
        }),
      );
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  };

  for (const block of model.blocks) {
    switch (block.kind) {
      case "kitab":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [new TextRun({ text: block.en, bold: true, size: 40, font: "Georgia" })],
          }),
        );
        if (block.ar) {
          children.push(
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.CENTER,
              spacing: { after: 360 },
              children: [
                new TextRun({ text: block.ar, font: ARABIC_FONT, size: 40, rightToLeft: true }),
              ],
            }),
          );
        }
        tocBlocks();
        break;
      case "collection":
        children.push(new Paragraph({ children: [new PageBreak()] }));
        if (block.en)
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 120 },
              children: [new TextRun({ text: block.en, bold: true, size: 30, font: "Georgia" })],
            }),
          );
        if (block.ar) children.push(...ar(block.ar, 32));
        break;
      case "chapter":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 320, after: 120 },
            children: [
              new Bookmark({
                id: block.anchor,
                children: [new TextRun({ text: block.en, bold: true, size: 26, font: TR_FONT })],
              }),
            ],
          }),
        );
        if (block.ar) children.push(...ar(block.ar, 28));
        break;
      case "intro":
        children.push(...en(block.label, { bold: true, size: 18 }));
        if (block.ar) children.push(...ar(block.ar));
        if (block.en) children.push(...en(block.en));
        break;
      case "hadith":
        children.push(
          new Paragraph({
            spacing: { before: 280, after: 100 },
            children: [
              new TextRun({
                text: `${model.lang === "bn" ? "হাদীস" : "Hadith"} ${block.number}`,
                bold: true,
                size: 22,
                font: "Georgia",
              }),
            ],
          }),
        );
        if (block.ar) children.push(...ar(block.ar));
        if (block.en) children.push(...en(block.en));
        if (block.extra) children.push(...en(block.extra));
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: model.title, size: 18, font: "Georgia", color: "666666" }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Georgia" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return deliverFile(blob, fileName);
}

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** What actually happened, so the UI can tell the truth instead of assuming. */
export type DeliveryOutcome = "shared" | "downloaded" | "opened" | "cancelled";

function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function supportsAnchorDownload() {
  if (typeof document === "undefined") return false;
  return "download" in document.createElement("a");
}

export async function deliverFile(blob: Blob, fileName: string): Promise<DeliveryOutcome> {
  const file = new File([blob], fileName, { type: blob.type || DOCX_TYPE });

  // iOS Safari ignores anchor downloads for blobs; the Share sheet ("Save to Files")
  // is the only supported hand-off there.
  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShare && (isAppleMobile() || !supportsAnchorDownload())) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return "shared";
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return "cancelled";
      // fall through to the download/open path below
    }
  }

  const url = URL.createObjectURL(file);
  try {
    if (supportsAnchorDownload()) {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      return "downloaded";
    }
    const opened = window.open(url, "_blank");
    if (opened) return "opened";
    throw new Error("The browser blocked the file hand-off.");
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/* ------------------------------- PDF ------------------------------- */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlParagraphs(value: string, className: string, dir: "rtl" | "ltr") {
  return paragraphs(value)
    .map((line) => `<p class="${className}" dir="${dir}">${escapeHtml(line)}</p>`)
    .join("");
}

export function buildKitabHtml(model: KitabExport) {
  const bn = model.lang === "bn";
  const toc = model.toc.length
    ? `<nav class="toc"><h2>${bn ? "সূচিপত্র" : "Contents"}</h2><ol>${model.toc
        .map((e) => `<li><a href="#${e.anchor}">${escapeHtml(e.label)}</a></li>`)
        .join("")}</ol></nav>`
    : "";
  const body = model.blocks
    .map((block) => {
      switch (block.kind) {
        case "kitab":
          return `<header class="cover"><h1>${escapeHtml(block.en)}</h1>${
            block.ar ? `<p class="ar title-ar" dir="rtl">${escapeHtml(block.ar)}</p>` : ""
          }</header>${toc}`;
        case "collection":
          return `<section class="collection">${
            block.en ? `<h2>${escapeHtml(block.en)}</h2>` : ""
          }${block.ar ? `<p class="ar heading-ar" dir="rtl">${escapeHtml(block.ar)}</p>` : ""}</section>`;
        case "chapter":
          return `<section class="chapter" id="${block.anchor}"><h3>${escapeHtml(block.en)}</h3>${
            block.ar ? `<p class="ar heading-ar" dir="rtl">${escapeHtml(block.ar)}</p>` : ""
          }</section>`;
        case "intro":
          return `<aside class="intro"><p class="label">${escapeHtml(block.label)}</p>${
            block.ar ? htmlParagraphs(block.ar, "ar", "rtl") : ""
          }${block.en ? htmlParagraphs(block.en, "en", "ltr") : ""}</aside>`;
        case "hadith":
          return `<article class="hadith"><p class="num">${bn ? "হাদীস" : "Hadith"} ${block.number}</p>${
            block.ar ? htmlParagraphs(block.ar, "ar", "rtl") : ""
          }${block.en ? htmlParagraphs(block.en, "en", "ltr") : ""}${
            block.extra ? htmlParagraphs(block.extra, "en extra", "ltr") : ""
          }</article>`;
      }
    })
    .join("\n");

  return `<!doctype html>
<html lang="${bn ? "bn" : "en"}"><head><meta charset="utf-8" />
<title>${escapeHtml(model.title)}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1c1917; line-height: 1.6; }
  .cover { text-align: center; margin-bottom: 18mm; }
  h1 { font-size: 24pt; margin: 0 0 8pt; }
  h2 { font-size: 17pt; margin: 0 0 6pt; page-break-after: avoid; }
  h3 { font-size: 13pt; margin: 0 0 4pt; page-break-after: avoid; }
  .collection { page-break-before: always; border-bottom: 1px solid #d6d3d1; padding-bottom: 6pt; margin: 0 0 10pt; }
  .chapter { margin: 16pt 0 6pt; page-break-inside: avoid; }
  .ar { font-family: "Traditional Arabic", "Amiri", "Scheherazade New", serif; font-size: 16pt; line-height: 2; text-align: right; direction: rtl; margin: 0 0 6pt; }
  .title-ar { font-size: 20pt; text-align: center; }
  .heading-ar { font-size: 15pt; }
  .en { font-size: 11pt; margin: 0 0 6pt; text-align: left; }
  .extra { color: #44403c; }
  .hadith { margin: 0 0 14pt; page-break-inside: avoid; }
  .num { font-size: 10pt; font-weight: bold; letter-spacing: .04em; color: #7c2d12; margin: 0 0 4pt; }
  .intro { background: #faf7f0; border: 1px solid #e7e5e4; padding: 6pt 8pt; margin: 0 0 10pt; }
  .toc { page-break-after: always; }
  .toc ol { list-style: none; padding: 0; }
  .toc li { margin: 0 0 4pt; font-size: 11pt; }
  .toc a { color: #7c2d12; text-decoration: none; }
  html[lang=bn] body, html[lang=bn] .en { font-family: "Noto Sans Bengali", "Nirmala UI", "Vrinda", sans-serif; }
  .label { font-size: 8pt; text-transform: uppercase; letter-spacing: .08em; color: #78716c; margin: 0 0 4pt; }
</style></head>
<body>${body}</body></html>`;
}

/**
 * Renders the same content in a hidden frame and hands it to the browser's
 * print-to-PDF pipeline, which shapes Arabic correctly and paginates the book.
 */
export async function downloadKitabPdf(model: KitabExport) {
  const html = buildKitabHtml(model);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  await new Promise<void>((resolve) => {
    frame.onload = () => resolve();
    const doc = frame.contentDocument;
    if (!doc) return resolve();
    doc.open();
    doc.write(html);
    doc.close();
    // Some browsers do not fire load for document.write; resolve on next tick too.
    setTimeout(resolve, 400);
  });

  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  setTimeout(() => frame.remove(), 60_000);
}
