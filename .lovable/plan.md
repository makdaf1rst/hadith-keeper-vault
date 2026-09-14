# Home corner menu and placeholder pages

## Scope
- Add a compact, keyboard-accessible menu beside the existing Admin link on the home header only.
- Link the menu to Announcements, Other Projects, and Send Gift.
- Preserve the existing four-line Arabic/English title and author presentation.
- Add three minimal destination pages with clear titles and a return link to the library.
- Leave all library data, search, authentication, administration, numbering, and hierarchy behavior unchanged.

## Technical details
- Use the existing Button and Dropdown Menu components with TanStack Router links.
- Add `/announcements`, `/projects`, and `/send-gift` route files, each with unique page metadata.
- Keep the Send Gift page informational only, with no payment or donation behavior.

## Verification
- Check the menu opens by pointer and keyboard on desktop and mobile widths.
- Follow all three links and confirm each destination returns cleanly to the home library.
- Confirm the corner menu is absent from all three destination pages.
