# The Complete Hadith Library

Below is the single complete master guideline you can paste into Lovable. It combines the app structure, document-import rules, preservation rules, spelling-correction rules, search behavior, validation, admin controls, and final quality checks into one specification.

PROJECT NAME:

Jāmiʿ al-Kāmil Hadith Library



==================================================

PROJECT PURPOSE

==================================================



Build a complete bilingual Arabic-English hadith application from my finished collection.



My complete collection contains:



- 16,546 numbered hadiths

- 66 Kitābs / Books

- 31 source documents

- Arabic text

- English translations

- Kitāb / Book headings

- جموع / مجموع / Collection headings

- باب / Chapter headings

- Qur'anic verses

- hadith grades

- source references

- explanatory material

- commentary associated with hadiths



I will upload the 31 documents ONE DOCUMENT AT A TIME.



Each uploaded document is authoritative source material.



The application must treat these documents as archival scholarly source material, NOT as material to summarize, rewrite, simplify, or creatively edit.



==================================================

ABSOLUTE SOURCE-PRESERVATION RULE

==================================================



THE SOURCE DOCUMENTS ARE THE PRIMARY SOURCE OF TRUTH.



The app may organize, index, search, display, and make obvious spelling corrections.



It must NOT alter substantive content.



NEVER:



- summarize

- paraphrase

- shorten

- condense

- rewrite

- simplify

- omit

- merge

- creatively reinterpret

- replace source text with AI-generated wording

- substitute text from another edition

- reconstruct missing text from memory

- silently remove repeated wording

- delete commentary merely because it is long

- change theological meaning

- change hadith wording

- change Qur'anic wording

- change references

- change grading

- renumber hadiths



Every meaningful word from the source documents must remain available in the application.



If a passage is long, display it in full.



If content is collapsed for navigation, the complete content must appear when expanded.



Do not use ellipses to replace source content.



Do not cut text because of UI length.



When uncertain whether content should be preserved, PRESERVE IT.



==================================================

ORIGINAL SOURCE + DISPLAY VERSION

==================================================



For maximum safety, never destroy the originally imported text.



Store both:



arabic_source

arabic_display



english_source

english_display



The SOURCE fields must preserve the exact imported source.



The DISPLAY fields may contain ONLY approved obvious spelling, punctuation, or spacing corrections.



Do not overwrite the source fields.



This allows every correction to be reviewed and reversed.



==================================================

ALLOWED SPELLING AND TYPO CORRECTIONS

==================================================



You MAY correct spelling mistakes only when the intended correction is completely obvious and unambiguous.



Allowed examples include:



- obvious English typing errors

- duplicated letters

- missing letters in ordinary words

- clear accidental spacing errors

- obvious punctuation mistakes

- obvious capitalization mistakes

- clearly accidental Arabic character mistakes where there is no reasonable ambiguity



Examples:



teh → the



recieve → receive



Messengerof Allah → Messenger of Allah



Do not correct a word merely because another wording sounds better.



Do not rewrite awkward English for style.



Do not modernize old wording.



Do not change Arabic because another edition uses another wording.



Do not standardize transliteration unless the existing form is clearly a typo.



Do not change:



- proper names based only on preferred transliteration

- hadith grades

- source references

- Qur'anic text

- theological expressions

- Arabic matn

- English translation meaning



If a correction is uncertain:



LEAVE THE ORIGINAL UNCHANGED.



==================================================

CORRECTION LOG

==================================================



Every correction must be logged.



Create a table named:



correction_log



Each correction entry must include:



- source_document_id

- source filename

- hadith_number if applicable

- Book if applicable

- Collection if applicable

- Chapter if applicable

- exact location

- original_text

- corrected_text

- correction_type

- date/time

- review_status



correction_type should be one of:



- spelling

- punctuation

- spacing

- capitalization

- obvious typo



No substantive correction may be made silently.



==================================================

CONTENT HIERARCHY

==================================================



The main hierarchy is:



KITĀB / BOOK

    ↓

JUMŪʿ / MAJMŪʿ / COLLECTION

    ↓

BĀB / CHAPTER

    ↓

HADITH



However, not every section necessarily uses every level.



Some Kitābs may have:



Book

→ Chapter

→ Hadith



without a Collection.



Some sections may contain Collection headings only at certain points.



Do not invent structural levels just to make the database uniform.



Use only the hierarchy actually present in the source documents.



==================================================

KITĀB / BOOK IDENTIFICATION

==================================================



Arabic Kitāb headings generally contain:



كتاب



English equivalents normally contain wording such as:



Book of ...

The Book of ...



Arabic and English versions of the same Kitāb must be stored as ONE Book record.



Example:



كتاب الإيمان



Book of Faith



These are not two Books.



They are two language fields for the same Book.



Store as:



title_ar

title_en



==================================================

JUMŪʿ / MAJMŪʿ / COLLECTION IDENTIFICATION

==================================================



Arabic Collection headings may begin with or contain:



جموع

مجموع



These represent a major subdivision beneath a Kitāb.



English translations should be stored as the same Collection record.



Example structure:



Arabic:

جموع أبواب خصال الإيمان



English:

Collection of Chapters Concerning the Characteristics of Faith



Store these as:



title_ar

title_en



Do not create separate Collection records for Arabic and English.



==================================================

BĀB / CHAPTER IDENTIFICATION

==================================================



Arabic Chapter headings contain:



باب



English headings generally contain:



Chapter



Arabic and English versions belong to ONE Chapter record.



Example:



باب بدء الوحي إلى رسول الله



Chapter: The Beginning of Revelation to the Messenger of Allah



Store together as:



title_ar

title_en



Do not mistake Chapter numbers for hadith numbers.



==================================================

HADITH IDENTIFICATION

==================================================



Each numbered hadith is a separate canonical hadith record.



Hadith numbering is GLOBAL across the collection.



The complete collection runs:



1 through 16,546



Do not restart numbering at each Book.



Do not renumber according to Chapter.



Do not create new numbering.



Do not silently change existing numbers.



==================================================

POSITIONAL HIERARCHY RULE

==================================================



The document structure is sequential.



A hadith belongs to the most recently encountered:



Book



Collection, if one exists



Chapter



until a new heading of that level appears.



Example:



Book 2

Collection A

Chapter 1

Hadith 22

Hadith 23

Hadith 24

Chapter 2

Hadith 25

Hadith 26

Collection B

Chapter 1

Hadith 27



Hadiths 22–24 belong to Chapter 1 of Collection A.



Hadiths 25–26 belong to Chapter 2 of Collection A.



Hadith 27 belongs to Chapter 1 of Collection B.



Do not independently guess the hierarchy for each hadith.



==================================================

BILINGUAL HEADING PAIRING

==================================================



Arabic and English headings may appear on separate lines.



They must still be recognized as one semantic heading.



Pair:



Arabic Kitāb + English Book



Arabic Collection + English Collection



Arabic Bāb + English Chapter



Do not create duplicate sections just because the two languages are on separate lines.



==================================================

MISSING HEADING TRANSLATIONS

==================================================



If an Arabic Kitāb, Collection, or Bāb exists but no English translation exists:



DO NOT automatically invent a translation unless I explicitly instruct you to translate missing headings.



If an English heading exists but Arabic is missing:



do not invent Arabic.



Instead flag it in the import validation report.



==================================================

DATABASE STRUCTURE

==================================================



Use a proper database.



Do not hard-code 16,546 hadiths directly into UI page components.



Recommended tables:



books

collections

chapters

hadiths

import_documents

correction_log

import_issues



==================================================

BOOKS TABLE

==================================================



Fields:



id



book_number



title_ar



title_en



sort_order



source_document_id



created_at



updated_at



==================================================

COLLECTIONS TABLE

==================================================



Fields:



id



book_id



title_ar



title_en



sort_order



source_document_id



created_at



updated_at



==================================================

CHAPTERS TABLE

==================================================



Fields:



id



book_id



collection_id nullable



chapter_number



title_ar



title_en



sort_order



source_document_id



created_at



updated_at



==================================================

HADITHS TABLE

==================================================



Fields:



id



hadith_number



book_id



collection_id nullable



chapter_id nullable



arabic_source



arabic_display



english_source



english_display



full_source_content



full_display_content



search_ar_normalized



search_en_normalized



sort_order



source_document_id



created_at



updated_at



==================================================

IMPORT_DOCUMENTS TABLE

==================================================



Fields:



id



filename



document_number



import_order



expected_hadith_start



expected_hadith_end



expected_hadith_count



imported_hadith_count



unique_hadith_count



book_count



collection_count



chapter_count



imported_at



validation_status



validation_notes



==================================================

IMPORT_ISSUES TABLE

==================================================



Fields:



id



source_document_id



hadith_number nullable



issue_type



description



severity



review_status



created_at



Use this for:



- missing number

- duplicate number

- suspicious truncation

- unmatched heading

- empty content

- extraction failure

- hierarchy uncertainty

- overlapping previously imported range



==================================================

FULL HADITH CONTENT

==================================================



A hadith record is NOT merely:



Arabic matn

+

English translation



It may also contain:



- Qur'anic verses

- hadith grade

- Arabic reference

- English reference

- explanatory notes

- commentary

- alternative narrations

- linguistic explanations

- related text

- additional paragraphs



When this material is attached to a hadith in the source document, preserve it with that hadith.



Do not discard commentary.



Do not detach references and accidentally assign them to the next hadith.



Preserve paragraph order.



==================================================

PARAGRAPH PRESERVATION

==================================================



Preserve meaningful paragraph breaks.



Do not flatten an entire long hadith into one unreadable line.



Do not split meaningful paragraphs arbitrarily.



Preserve:



Arabic paragraph ordering



English paragraph ordering



reference placement



commentary placement



Qur'anic verse placement



==================================================

NO TRUNCATION

==================================================



No hadith content may be visually or permanently cut off.



Do not use:



text-overflow: ellipsis



line-clamp



fixed-height text boxes that hide overflow



character limits



word limits



automatic summarization



"Read more" systems that fail to expose the full content



If a hadith is collapsed, expanding it must display EVERYTHING.



No word may become inaccessible because the hadith is long.



==================================================

APP NAVIGATION

==================================================



The main reading hierarchy must use collapsible navigation.



Example:



▸ Book 2 — Book of Faith



    ▸ Collection: Characteristics of Faith



        ▸ Chapter 1 — Question of Jibrīl



            Hadith 22

            Hadith 23

            Hadith 24



        ▸ Chapter 2 — ...



    ▸ Another Collection



Clicking a Book:



expands/collapses the Book.



Clicking a Collection:



expands/collapses its Chapters.



Clicking a Chapter:



expands/collapses its Hadiths.



Hadith content may also be collapsible in browse mode.



==================================================

BOOK DISPLAY

==================================================



Each Book should prominently show both:



Arabic title



English title



Example:



كتاب الإيمان



Book of Faith



==================================================

COLLECTION DISPLAY

==================================================



Each Collection should show:



Arabic title



English title



if both exist.



==================================================

CHAPTER DISPLAY

==================================================



Each Chapter should show:



Arabic title



English title



if both exist.



==================================================

HADITH DISPLAY

==================================================



Each hadith page/card should show:



Hadith number



Arabic content



English content



references



grades



commentary



additional attached content



when present.



Hadith number should be easy to identify.



Example:



Hadith 22

٢٢



==================================================

ARABIC DISPLAY REQUIREMENTS

==================================================



Arabic must:



- render right-to-left

- wrap correctly

- never overflow horizontally

- never be clipped

- preserve diacritics where present

- preserve Arabic punctuation where present

- use an appropriate readable Arabic-capable font

- have generous line spacing

- display well on mobile and desktop



Do not put Arabic into extremely narrow cards.



==================================================

ENGLISH DISPLAY REQUIREMENTS

==================================================



English must:



- render left-to-right

- preserve paragraph breaks

- wrap normally

- never be clipped

- never be truncated

- use comfortable line height

- display well on mobile and desktop



==================================================

SEARCH SYSTEM

==================================================



Create one main search system capable of searching all 16,546 hadiths.



Search must support:



- Arabic words

- English words

- hadith number

- Book title

- Collection title

- Chapter title

- source/reference terms where practical



The same search box should accept Arabic and English.



==================================================

ARABIC SEARCH

==================================================



Preserve the original Arabic for display.



Create a separate normalized Arabic search value.



Use:



search_ar_normalized



Arabic search may ignore or normalize for matching:



- tashkīl / diacritics

- tatweel ـ

- common alif variations such as:



أ

إ

آ

ا



This normalization is ONLY for searching.



Do not alter displayed Arabic.



Example:



Displayed:



إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ



Search may internally normalize toward something like:



انما الاعمال بالنيات



This allows someone typing without diacritics to find the same hadith.



==================================================

ENGLISH SEARCH

==================================================



English search should be:



- case-insensitive

- Unicode-safe

- punctuation tolerant

- reasonably tolerant of transliteration differences



Where technically practical, searches such as:



Bukhari



Bukhārī



al-Bukhari



al-Bukhārī



should locate relevant entries.



Do not alter displayed transliteration merely to improve search.



Use a normalized search field.



==================================================

SEARCH RESULTS

==================================================



Each search result should display:



Hadith number



Book



Collection if applicable



Chapter



small contextual preview



highlighted search match where practical



A short preview is allowed ONLY in search results.



Opening the result must show the COMPLETE hadith content.



Search-result previews must never replace full stored text.



==================================================

SEARCH FILTERS

==================================================



Provide optional filters for:



Book



Collection



Chapter



Language



Language filter:



All



Arabic



English



Make filters easy to clear.



==================================================

DIRECT HADITH NUMBER SEARCH

==================================================



If the user searches a number such as:



1102



the app should offer direct access to:



Hadith 1102



==================================================

PERMALINKS

==================================================



Every hadith should have a stable URL.



Example:



/hadith/1



/hadith/1102



/hadith/16546



Books should also have stable routes.



Chapters should have stable routes or anchors.



==================================================

PREVIOUS / NEXT HADITH

==================================================



On individual hadith view provide:



Previous Hadith



Next Hadith



Navigation must follow global numbering.



==================================================

COPY FEATURES

==================================================



Provide copy buttons for:



Arabic only



English only



Entire hadith entry



Copied content must be complete.



Never copy only a shortened preview.



==================================================

MOBILE DESIGN

==================================================



The app must work excellently on phones.



Requirements:



- no horizontal text scrolling

- no clipped Arabic

- no clipped English

- readable font sizing

- touch-friendly accordions

- easy search access

- responsive sidebar/navigation

- long hadiths remain fully readable



==================================================

DESKTOP DESIGN

==================================================



Recommended desktop layout:



LEFT PANEL:



Books



Collections



Chapters



MAIN PANEL:



Hadith reading area



TOP:



Search



Filters



Direct hadith-number navigation



==================================================

DESIGN STYLE

==================================================



The app should feel like a serious scholarly digital hadith library.



Prioritize:



accuracy



readability



searchability



bilingual presentation



text integrity



clear hierarchy



fast navigation



Do not prioritize flashy animations over readability.



Avoid:



- excessive visual effects

- social-media-style cards

- AI-generated summaries

- distracting animations

- tiny text

- excessive whitespace that makes scholarly reading difficult



==================================================

ADMIN IMPORT AREA

==================================================



Create an ADMIN-ONLY section for document importing.



The admin should be able to:



- upload next document

- view imported documents

- view document order

- view hadith ranges

- view import status

- view missing-number warnings

- view duplicate warnings

- view heading issues

- view extraction warnings

- view correction logs



Do not make document upload publicly accessible.



==================================================

ONE DOCUMENT AT A TIME

==================================================



I will upload 31 documents individually.



Each document must be imported into the EXISTING database.



When a new document is uploaded:



DO NOT:



- rebuild the database

- delete existing hadiths

- reprocess previously approved documents

- modify earlier imports

- overwrite previous content automatically



Only import the new document.



==================================================

DOCUMENT IMPORT PROCEDURE

==================================================



For EVERY uploaded document perform this exact process.



STEP 1



Identify the exact filename.



STEP 2



Determine the expected hadith-number range.



STEP 3



Determine the expected count:



end number

minus

start number

plus 1



STEP 4



Identify all Kitāb headings.



STEP 5



Identify all جموع / مجموع / Collection headings.



STEP 6



Identify all Bāb / Chapter headings.



STEP 7



Pair Arabic and English versions of the same heading.



STEP 8



Track the active Book / Collection / Chapter sequentially through the document.



STEP 9



Identify every hadith number.



STEP 10



Associate each hadith with its correct:



Book



Collection if applicable



Chapter



STEP 11



Extract the FULL hadith content.



STEP 12



Preserve all:



Arabic



English



Qur'anic verses



references



grades



commentary



explanatory material



alternate narrations



attached content



STEP 13



Check for only completely obvious spelling/spacing/punctuation mistakes.



STEP 14



Create correction-log entries for every correction.



STEP 15



Store original source text separately from corrected display text.



STEP 16



Import into the database.



STEP 17



Run validation.



STEP 18



Give me the validation report.



DO NOT simply say:



"Import completed successfully."



==================================================

HADITH COUNT VALIDATION

==================================================



For a continuous range:



expected count =

ending hadith number

-

starting hadith number

+

1



Example:



Hadith 1–1102



1102 - 1 + 1 = 1102



Compare:



expected count



imported count



unique number count



Do not count duplicates as additional valid hadiths.



==================================================

MISSING HADITH CHECK

==================================================



Compare every expected hadith number in the document range against imported hadith numbers.



Example:



If range is:



1–1102



check EVERY number:



1

2

3

4

...

1102



No sampling.



If one is missing:



report the exact number.



Do not silently invent the missing entry.



Do not renumber the following hadiths.



==================================================

DUPLICATE CHECK

==================================================



Check for duplicate hadith numbers within the document.



Also check against already imported documents.



If a number already exists:



DO NOT overwrite automatically.



Report:



existing source document



new source document



overlapping number(s)



Wait for explicit resolution.



==================================================

HADITH UNIQUE CONSTRAINT

==================================================



Canonical hadith_number should normally be unique across the database.



Do not permit accidental duplicate canonical records.



If the source itself intentionally contains a duplicate number:



flag it for review rather than deleting one.



==================================================

TEXT COMPLETENESS CHECK

==================================================



Before approving the import, look for suspicious extraction issues.



Examples:



- Arabic ends in the middle of a word

- English sentence suddenly cuts off

- visible "... " replacing content

- entire paragraphs missing

- empty hadith

- number present with no body

- Arabic exists but all English unexpectedly disappeared

- English exists but all Arabic unexpectedly disappeared

- references assigned to wrong hadith

- chapter heading accidentally attached to previous hadith

- hadith text accidentally interpreted as heading

- heading accidentally interpreted as hadith content



If suspicious:



flag:



SOURCE EXTRACTION REQUIRES REVIEW



Do not reconstruct missing text using AI.



==================================================

NO OUTSIDE RECONSTRUCTION

==================================================



If extraction appears damaged:



DO NOT:



- search Google for another version

- use Sunnah.com automatically

- use another edition

- regenerate Arabic from memory

- regenerate English from memory

- invent missing words



The uploaded document remains authoritative.



Report the issue.



==================================================

HEADING VALIDATION

==================================================



Check every heading pair.



Report:



Arabic Book without English Book



English Book without Arabic Book



Arabic Collection without English Collection



English Collection without Arabic Collection



Arabic Bāb without English Chapter



English Chapter without Arabic Bāb



Do not silently invent missing titles.



==================================================

SOURCE TRACEABILITY

==================================================



Every imported record must store:



source_document_id



This applies to:



Books



Collections



Chapters



Hadiths



Corrections



Issues



This must make it possible to determine which of the 31 original documents produced any app entry.



==================================================

IMPORT IMMUTABILITY

==================================================



After a document has passed validation:



treat it as locked imported content.



Do not automatically rewrite it when later documents are uploaded.



Do not run global AI cleanup across all earlier records.



Any later change must be:



intentional



traceable



logged



==================================================

EXACT SOURCE VIEW

==================================================



Create an admin feature:



EXACT SOURCE VIEW



Normal reading mode may show corrected display text.



Exact Source View must show:



arabic_source



english_source



exactly as originally imported.



This lets me compare corrected and original text.



==================================================

CORRECTION LOG ADMIN PAGE

==================================================



Create a page:



Correction Log



Allow filtering by:



Document



Hadith number



Book



Correction type



Status



Each record should show:



Original



Corrected



Location



Reason/type



Source document



==================================================

IMPORT VALIDATION REPORT

==================================================



After EVERY document, report exactly:



DOCUMENT:

[filename]



DOCUMENT NUMBER:

[x of 31]



HADITH RANGE:

[start]–[end]



EXPECTED HADITH COUNT:

[number]



IMPORTED HADITH RECORDS:

[number]



UNIQUE HADITH NUMBERS:

[number]



MISSING HADITH NUMBERS:

[list or NONE]



DUPLICATE HADITH NUMBERS:

[list or NONE]



OVERLAP WITH PREVIOUS DOCUMENTS:

[list or NONE]



BOOKS FOUND:

[number]



COLLECTIONS FOUND:

[number]



CHAPTERS FOUND:

[number]



ARABIC BOOK TITLES WITHOUT ENGLISH:

[list or NONE]



ENGLISH BOOK TITLES WITHOUT ARABIC:

[list or NONE]



ARABIC COLLECTION TITLES WITHOUT ENGLISH:

[list or NONE]



ENGLISH COLLECTION TITLES WITHOUT ARABIC:

[list or NONE]



ARABIC CHAPTER TITLES WITHOUT ENGLISH:

[list or NONE]



ENGLISH CHAPTER TITLES WITHOUT ARABIC:

[list or NONE]



SUSPICIOUSLY TRUNCATED CONTENT:

[list or NONE]



EMPTY HADITH RECORDS:

[list or NONE]



SPELLING/TYPO CORRECTIONS:

[number]



CORRECTION LOG CREATED:

YES / NO



IMPORT STATUS:

PASS

or

NEEDS REVIEW



==================================================

DO NOT CONTINUE AUTOMATICALLY

==================================================



After importing and validating one document:



STOP.



Do not begin processing another document unless I upload the next document.



==================================================

FINAL GLOBAL VALIDATION

==================================================



After all 31 documents are imported:



perform a full global audit.



Expected total:



31 source documents



66 Books



16,546 hadith numbers



Check EVERY global hadith number:



1 through 16,546



Do not sample.



==================================================

FINAL REPORT

==================================================



At completion report:



SOURCE DOCUMENTS:

Expected: 31

Actual: [number]



BOOKS:

Expected: 66

Actual: [number]



TOTAL HADITH RECORDS:

[number]



UNIQUE HADITH NUMBERS:

[number]



EXPECTED UNIQUE HADITH NUMBERS:

16,546



MISSING HADITH NUMBERS:

[list or NONE]



DUPLICATE HADITH NUMBERS:

[list or NONE]



OVERLAPPING DOCUMENT RANGES:

[list or NONE]



TOTAL COLLECTIONS:

[number]



TOTAL CHAPTERS:

[number]



UNMATCHED ARABIC/ENGLISH HEADINGS:

[number and list]



TOTAL SPELLING/TYPO CORRECTIONS:

[number]



UNRESOLVED IMPORT ISSUES:

[number]



FINAL STATUS:

PASS

or

NEEDS REVIEW



Do not declare the collection complete unless the global number check has actually been performed.



==================================================

SEARCH QUALITY CHECK

==================================================



After all documents are imported, test searches using:



Arabic terms



English terms



hadith numbers



Book names



Collection names



Chapter names



Test both exact and normalized Arabic searches.



Verify search works across all imported documents.



==================================================

READING QUALITY CHECK

==================================================



Test:



very short hadith



very long hadith



long Arabic commentary



long English commentary



Qur'anic verse content



references



mobile layout



desktop layout



Ensure:



no clipping



no hidden text



no missing paragraphs



no broken RTL rendering



no accidental truncation



==================================================

STRICT PROHIBITIONS

==================================================



NEVER:



summarize any hadith



summarize commentary



paraphrase Arabic



paraphrase English



shorten content



replace content with ellipses



invent missing wording



invent missing translations



combine hadiths



split one hadith without source evidence



change hadith numbers



change hadith grading



change source references



change Qur'anic wording



replace source text using outside websites



apply speculative Arabic correction



rewrite English for style



remove repeated source wording because it seems unnecessary



silently fix uncertain text



silently delete duplicates



silently fill missing numbers



overwrite previously approved imports



==================================================

PRIORITY ORDER

==================================================



If any instruction conflicts with another instruction, follow this order:



1. Preserve the complete source content.

2. Preserve the original source version permanently.

3. Preserve correct global hadith numbering.

4. Preserve Book / Collection / Chapter structure.

5. Preserve Arabic-English pairing.

6. Prevent missing or duplicate imports.

7. Preserve source traceability.

8. Maintain accurate search.

9. Correct only completely obvious spelling/typing mistakes.

10. Improve visual appearance.



CONTENT INTEGRITY ALWAYS TAKES PRIORITY OVER DESIGN.



==================================================

FINAL CORE PRINCIPLE

==================================================



The uploaded documents are authoritative.



Your job is to:



ORGANIZE THEM

INDEX THEM

SEARCH THEM

DISPLAY THEM

VALIDATE THEM



Your job is NOT to rewrite them.



Obvious spelling mistakes may be corrected only when completely unambiguous.



The original wording must always remain stored.



Every correction must be logged.



No word may be lost.



No hadith may be summarized.



No hadith may be cut off.



No content may be silently replaced.



The finished application must faithfully contain the complete collection of:



31 documents

66 Books

16,546 hadiths



with searchable Arabic and English and collapsible:



Kitāb

→ Collection

→ Bāb

→ Hadith



Before implementing the application, confirm that you understand and will follow all of these rules.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/69db9fa2-bded-4529-9f21-045f34164a1c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

<!-- deployment refresh: Bengali footer language selector -->
