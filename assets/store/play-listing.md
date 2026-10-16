# Google Play listing copy — Jami al-Kamil

All values for the Play Console store listing. Paths are relative to the repo root.

## Create app

- App name: `Jāmiʿ al-Kāmil`
- Default language: English (United States)
- App or game: App
- Free or paid: Free

## Store listing (Main store listing)

- App name (30 max, keyword helps search): `Jāmiʿ al-Kāmil: Hadith Library`
- Short description (80 max):
  `Hadith library: 16,546 narrations in Arabic, English & Bangla. Offline, no ads`
- Full description (4000 max):

```
Read and search 16,546 authentic hadith in Arabic, English and Bangla (Bengali), all in one free Islamic library app that works offline.

Jami al-Kamil brings you al-Jami al-Kamil fi al-Hadith al-Sahih al-Shamil by Shaykh Dr. Diya al-Rahman al-A'zami: one of the most comprehensive hadith collections ever compiled, gathered from more than 200 source works and organized across 66 books.

WHY READERS USE IT
- Every narration in the original Arabic with English and Bangla translation
- Search by word or phrase across the whole collection, in Arabic, English or Bangla
- Bookmark any hadith and pick up where you left off
- Download books and read hadith offline, with no internet connection
- Backup and restore your bookmarks to move them to a new phone
- Reading themes, including dark mode, sepia and a "follow my device" option
- Switch the app between English and Bangla
- A short guided tour on first launch, replayable any time from Settings

PRIVATE BY DESIGN
No account, no sign-in, no ads, no tracking. Your bookmarks and reading progress stay on your device unless you export them yourself.

ABOUT THE COLLECTION
Al-Jami al-Kamil is the life's work of Shaykh Dr. Diya al-Rahman al-A'zami, who spent decades collecting, verifying and organizing narrations from over two hundred classical and contemporary sources into a single collection.

Free, forever. Feedback and corrections: saqibh49@gmail.com
```

## Graphics

- App icon (512x512): `public/icon-512.png`
- Feature graphic (1024x500): `assets/store/play-feature-graphic.png`
- Phone screenshots (upload all 7, in order): `assets/store/play-phone/01..07.png`
  (regenerate from `app-screenshots/` with `python3 scripts/store-screenshots.py`)

## Categorization and contact

- App category: Books & Reference
- Tags: Books & Reference
- Store listing contact email: saqibh49@gmail.com
- Website: https://jami-al-kamil.com
- Privacy policy URL (required): https://jami-al-kamil.com/privacy

## Policy answers

- Privacy policy: https://jami-al-kamil.com/privacy
- Data safety: No data collected, no data shared
- Ads: No ads
- Target audience: 18+ (not designed for children; avoids Families policy requirements)
- Content rating questionnaire: reference/utility, no violence, no UGC, no social features -> Everyone
- News app: No
- COVID-19 contact tracing / government app: No

## Release

- Package name: com.jamialkamil.app
- Signed AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Release build command:
  `cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease`
- Note: personal accounts must complete a closed test (12 testers, 14 days) before production access.
- Release name / notes draft: `Initial release: the complete al-Jami al-Kamil hadith library in Arabic, English and Bengali.`
