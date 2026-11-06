import JSZip from "jszip";

import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { fetchBengaliBookTranslations, fetchBengaliStructure } from "@/lib/bengali-translations";
import { buildKitabExport, buildKitabHtml, deliverFile, type BengaliExportData } from "@/lib/kitab-export";
import { fetchBookHadiths, fetchBooks, fetchChapters, fetchCollections } from "@/lib/library-api";

/** Creates a self-contained archive; no source records are changed. */
export async function downloadCompleteLibrary(onProgress: (done: number, total: number) => void) {
  const books = await fetchBooks();
  if (books.length !== 66) throw new Error(`Expected 66 Kitābs, found ${books.length}. Download aborted.`);
  const zip = new JSZip();
  const index: string[] = [];
  const seen = new Set<number>();

  for (const [position, book] of books.entries()) {
    const [collections, chapters, hadiths, bnStructure, bnHadiths] = await Promise.all([
      fetchCollections(book.id),
      fetchChapters(book.id),
      fetchBookHadiths(book.id),
      fetchBengaliStructure(book.book_number),
      fetchBengaliBookTranslations(book.book_number),
    ]);

    for (const hadith of hadiths) {
      if (seen.has(hadith.hadith_number)) throw new Error(`Duplicate hadith ${hadith.hadith_number}. Download aborted.`);
      seen.add(hadith.hadith_number);
    }

    const intro = getBengaliBookIntro(book.book_number);
    const bengali: BengaliExportData = {
      bookTitle: getBengaliBookTitle(book.book_number),
      bookIntro: intro?.intro_bn_display ?? intro?.intro_bn_source ?? null,
      collections: new Map(bnStructure.collections.map((c) => [c.id, c])),
      chapters: new Map(bnStructure.chapters.map((c) => [c.id, c])),
      hadiths: bnHadiths,
    };

    const dirname = `Kitab-${String(book.book_number).padStart(2, "0")}`;
    const folder = zip.folder(dirname);
    if (!folder) throw new Error("Could not create ZIP folder.");
    folder.file("English.html", buildKitabHtml(buildKitabExport(book, collections, chapters, hadiths, { lang: "en" })));
    folder.file("Bangla.html", buildKitabHtml(buildKitabExport(book, collections, chapters, hadiths, { lang: "bn", bengali })));

    const collectionFolder = folder.folder("Collections");
    for (const collection of [...collections].sort((a, b) => a.sort_order - b.sort_order)) {
      const name = `Collection-${String(collection.sort_order).padStart(3, "0")}`;
      collectionFolder?.file(`${name}-English.html`, buildKitabHtml(buildKitabExport(book, collections, chapters, hadiths, { lang: "en", collectionId: collection.id })));
      collectionFolder?.file(`${name}-Bangla.html`, buildKitabHtml(buildKitabExport(book, collections, chapters, hadiths, { lang: "bn", bengali, collectionId: collection.id })));
    }

    index.push(`<li><a href="${dirname}/English.html">Kitāb ${book.book_number} — English / Arabic</a> · <a href="${dirname}/Bangla.html">বাংলা / আরবি</a></li>`);
    onProgress(position + 1, books.length);
  }

  if (seen.size !== 16546 || !Array.from({ length: 16546 }, (_, i) => i + 1).every(n => seen.has(n))) {
    throw new Error(`Expected all 16,546 numbered hadith, found ${seen.size}. Download aborted.`);
  }

  zip.file("START-HERE.html", `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Al-Jāmiʿ al-Kāmil — Offline Library</title><style>body{font-family:system-ui,sans-serif;max-width:780px;margin:auto;padding:24px;line-height:1.8}a{color:#69421d}li{margin:7px 0}</style></head><body><h1>Al-Jāmiʿ al-Kāmil — Offline Library</h1><p>66 Kitābs · 16,546 Hadith · Arabic, English and Bengali. Open the files after extracting the ZIP. Each Kitāb contains separate English and Bengali reading files with Arabic text, and a Collections directory for individual collections. No internet connection is required to open these HTML files in a compatible browser.</p><ol>${index.join("")}</ol></body></html>`);
  zip.file("README.txt", "Al-Jāmiʿ al-Kāmil — complete offline text library\n\nExtract the ZIP with your phone or computer's file manager. Open START-HERE.html, or navigate to a Kitab folder and open English.html or Bangla.html. Each Kitab also contains a Collections folder with separate files for every Majmūʿ. This archive contains text only, not audio. All text is exported from the site's current content without changing it.\n");
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return deliverFile(blob, "Al-Jami-al-Kamil-Complete-Offline-Library.zip");
}
