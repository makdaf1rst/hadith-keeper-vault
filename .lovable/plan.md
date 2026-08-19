# Jāmiʿ al-Kāmil Hadith Library

Confirmed: I understand and will follow the source-preservation rules. No summarizing, paraphrasing, shortening, truncating, renumbering, or reconstructing from outside sources. Source text is stored permanently and separately from display text, every correction is logged, and each of the 31 .docx documents is imported one at a time into the existing database with a full validation report after each one.

## Approach

Build the app and database first, empty and ready. Then you upload document 1 as .docx; I extract it, map the Book / Collection / Chapter / Hadith structure, insert it, run the full validation, and give you the report. Then I stop until you upload the next one.

## Backend

Enable Lovable Cloud (database + auth + storage). Tables exactly as specified:

- `books` — id, book_number, title_ar, title_en, sort_order, source_document_id, timestamps
- `collections` — id, book_id, title_ar, title_en, sort_order, source_document_id, timestamps
- `chapters` — id, book_id, collection_id (nullable), chapter_number, title_ar, title_en, sort_order, source_document_id, timestamps
- `hadiths` — id, hadith_number (unique), book_id, collection_id, chapter_id, arabic_source, arabic_display, english_source, english_display, full_source_content, full_display_content, search_ar_normalized, search_en_normalized, sort_order, source_document_id, timestamps
- `import_documents` — filename, document_number, import_order, expected/imported/unique counts, book/collection/chapter counts, imported_at, validation_status, validation_notes
- `correction_log` — document, filename, hadith_number, book, collection, chapter, location, original_text, corrected_text, correction_type, created_at, review_status
- `import_issues` — document, hadith_number, issue_type, description, severity, review_status, created_at
- `user_roles` — separate role table with a security-definer `has_role()` check (never a role column on a profile)

Content is publicly readable. All writes (import, corrections, issue resolution) are admin-only, enforced server-side by role, never by anything the browser can set. A single admin account for you.

Long text is stored as full text with paragraph breaks preserved; there are no length caps anywhere in the schema.

## Reading app

- `/` — library home: search bar, direct hadith-number jump, collapsible tree of Book → Collection → Chapter → Hadith. Arabic and English titles shown together on every level.
- `/hadith/:number` — permalink for each hadith: number in Latin and Arabic-Indic digits, full Arabic (RTL, large readable Arabic font, generous line height, diacritics preserved), full English, plus grades, references, Qur'anic verses, commentary and any other attached material in original paragraph order. Previous / Next follow global numbering.
- `/book/:number` and chapter anchors for stable routes.
- Copy buttons: Arabic only, English only, whole entry — always the complete stored text.
- Desktop: left navigation panel, main reading panel, search and filters on top. Mobile: same content, drawer navigation, no horizontal scroll.
- No `line-clamp`, no ellipsis truncation, no fixed-height overflow-hidden text containers anywhere. Collapsed items expand to the complete text.

## Search

One box accepting Arabic and English. Matches on Arabic text, English text, hadith number, and Book / Collection / Chapter titles. Filters for Book, Collection, Chapter and language (All / Arabic / English), each easy to clear.

Arabic matching uses `search_ar_normalized` (diacritics, tatweel, and alif variants normalized) while display keeps the original exactly. English matching uses `search_en_normalized` (lowercased, punctuation- and diacritic-insensitive, so `Bukhārī` / `al-Bukhari` match) while display keeps the original transliteration. A numeric query offers direct access to that hadith.

Search results show number, Book, Collection, Chapter and a short contextual preview with the match highlighted; opening the result shows the complete hadith.

## Admin area

Login-protected, not publicly linked:

- Import dashboard: documents imported, order, hadith ranges, status, counts, and every warning.
- Exact Source View: `arabic_source` / `english_source` side by side with the display versions.
- Correction Log page: filter by document, hadith number, book, correction type, status; each row shows original, corrected, location, type, source document.
- Import Issues page: missing numbers, duplicates, overlaps, suspicious truncation, unmatched headings, empty records — with review status.

## Import procedure (per document)

I parse the .docx directly from your upload and follow your 18 steps: identify filename and expected range, find all Kitāb / جموع-مجموع / Bāb headings, pair Arabic and English headings into single records, track active Book/Collection/Chapter sequentially, attach every hadith to the most recent headings, extract full content including verses, grades, references and commentary, apply only completely unambiguous spelling/spacing/punctuation fixes into the display fields, log every one, store the untouched source separately, insert, then validate.

Validation checks every number in the range individually (no sampling), duplicates within and across documents, overlaps with earlier documents, heading pairing gaps, empty or suspiciously truncated records. Nothing is overwritten automatically; conflicts are reported and wait for your decision. Earlier imports are never rewritten by a later one.

You then get the exact validation report in the format you specified, and I stop.

## Missing heading translations

Per your answer, when a Kitāb / Collection / Bāb heading exists in only one language I will supply a translation of that heading — headings only, never hadith text, and never invented content. Each supplied heading is marked as translated, recorded in the correction log with its source-language original, and listed in the validation report so you can review or replace it.

## Technical notes

TanStack Start + Lovable Cloud (Postgres). Row Level Security on all tables: public read on content, admin-only writes verified server-side through `has_role`. Postgres full-text/trigram indexes on the normalized search columns for fast search across 16,546 records. Text columns are unbounded `text`. Import runs as an admin-only server function so the client can never write hadith data.
