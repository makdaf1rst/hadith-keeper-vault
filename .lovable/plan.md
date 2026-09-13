# Global Kitāb and Bāb display formatting

## Scope
- Add shared presentation helpers for book and chapter labels.
- Use database number fields as the single visible numeric prefix.
- Remove only obvious redundant prefixes from the start of English titles at render time.
- Apply the helpers to the library tree, book pages, search filters/results, heading matches, and hadith breadcrumbs.
- Leave collection labels, Arabic text, hadith numbering, stored content, relationships, and database rows unchanged.

## Display behavior
- Books render as `N. Title`.
- Chapters render as `N. Title`.
- Prefix cleanup handles repeated forms such as `1 —`, `1.`, `Book 1-1`, `Chapter 1-1`, and leading `Book:`/`Chapter:` labels without stripping meaningful title words elsewhere.
- Missing English titles fall back safely without manufacturing duplicate labels.

## Verification
- Add focused formatter tests covering clean titles, duplicated prefixes, compound numbering, and titles without redundant prefixes.
- Inspect Book 1 / Chapter 1 and representative later records in the live app at desktop and mobile widths.
- Confirm visible labels contain no duplicated `Book N-N` or `Chapter N-N` patterns.
