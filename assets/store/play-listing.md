# Google Play listing copy — Jami al-Kamil

All values for the Play Console store listing. Paths are relative to the repo root.

## Create app

- App name: `Jāmiʿ al-Kāmil`
- Default language: English (United States)
- App or game: App
- Free or paid: Free

## Store listing (Main store listing)

- App name: `Jāmiʿ al-Kāmil`
- Short description (80 max):
  `The complete al-Jami al-Kamil hadith library in Arabic, English and Bengali`
- Full description (4000 max):

```
Jami al-Kamil is the complete digital library of al-Jami al-Kamil by Shaykh Dr. Diya al-Rahman al-A'zami, one of the most comprehensive hadith collections ever compiled: 16,546 narrations gathered from more than 200 source works, organized across 66 books.

Read every narration in the original Arabic, with translations in English and Bengali.

FEATURES
- The full 66-book library: 16,546 narrations with Arabic text and translation
- Fast search across the entire collection
- Bookmarks and reading history, saved automatically on your device
- Download books for offline reading
- Backup and restore: export your bookmarks and progress as a file, import it on any other device
- No account, no sign-in, no ads, no tracking. Everything stays on your device.
- Free, forever

ABOUT THE COLLECTION
Al-Jami al-Kamil is the life's work of Shaykh Dr. Diya al-Rahman al-A'zami, who spent decades collecting, verifying, and organizing narrations from over two hundred classical and contemporary sources into a single comprehensive collection.

Your bookmarks and reading progress never leave your device unless you export them yourself.
```

## Graphics

- App icon (512x512): `public/icon-512.png`
- Feature graphic (1024x500): `assets/store/play-feature-graphic.png`
- Phone screenshots (upload all 6): `assets/store/asc-6.5/iphone-01..06-*.png`

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
