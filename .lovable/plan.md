# Book 2 whole-book semantic screening (read-only)

Book 2 has **1,081 hadiths** (about 820k English and 770k Bengali characters). That's too much to read by hand in one pass, so the screening runs as an automated batch. Nothing in the project is changed.

## How it works

1. **Mechanical checks on all 1,081 hadiths:**
   - numbers and reference numbers (e.g. Bukhārī 7420, 7:40) that are in one language but not the other
   - Qur'an verse citations
   - grading words (Ṣaḥīḥ, Ḥasan, Ḍaʿīf, Agreed upon)
   - large length differences that suggest something was left out or added
2. **AI meaning check on every hadith**, in batches of about 10: English (the main reference), Bengali and Arabic are compared side by side. The AI flags a hadith only for meaning-level problems:
   - reversed or changed meaning, or a missing or added negation
   - a wrong person, place or object, or confusion over who did what
   - commands, prohibitions, conditions, exceptions or comparisons that change
   - quantities or order
   - references, grading or commentary
   - missing or added content
   
   Style, word order and synonyms are always marked as passing.
3. **Merge both checks** into one list of suspicious hadiths, each with a one-line reason.

## Output (one report, nothing else)

1. Total scanned: 1,081
2. Every suspicious hadith number, each with a short reason
3. Total flagged
4. Confirmation that no files or content were changed

## Technical details

- One Python script under /tmp reads `public/content/book-2/hadiths.json` and `public/content/bengali/book-2/hadiths.json`. It calls the Lovable AI Gateway using the existing key, with a strong model.
- Results are written only to /tmp. The script writes nothing to the project, the database or git.
- It uses some AI credits: about 110 batch calls. This is a first screening. You'll still review each flagged hadith yourself, as planned.
