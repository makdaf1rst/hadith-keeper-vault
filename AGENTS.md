<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Editing hadith text, explanations and notes

Never put hadith text, commentary or notes in code (`src/`). The iOS app only
receives changes under `public/content/`; code changes need an App Store release.

- Find the book: search `public/content/book-*/hadiths.json` for `"hadith_number":N`.
- English/Arabic: add or edit an entry keyed `"N"` in
  `public/content/book-X/qc-overrides.json` (create it as `{}` if missing). Include
  `hadith_number` plus only the changed fields (`arabic_display`,
  `english_display`, `full_display_content`). Example: book-49, hadith 10081.
- Bengali: same in `public/content/bengali/book-X/qc-overrides.json`; copy the
  hadith's full entry from `bengali/book-X/hadiths.json` and edit `text`.
- Keep the JSON valid. Run `node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' <file>`.
