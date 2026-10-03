# Hadith Keeper Vault

- **Reads:** `AGENTS.md` for repository rules, `README.md` for product context, and `src/routes/README.md` for route conventions.
- **Does:** Serves the bilingual hadith library at https://jami-al-kamil.com using TanStack Start.
- **Does:** Wraps the live site in Capacitor app shells (`ios/`, `android/`, config in `capacitor.config.ts`, offline fallback in `capacitor-shell/`); `public/manifest.webmanifest` and icons support PWA install.
- **Does:** Service worker (`public/sw.js`, registered in `src/lib/register-sw.ts`) serves previously viewed pages, Supabase data, assets, and fonts from cache for offline reading.
- **Writes:** Application code in `src/` and public assets in `public/`. Browser and Apple touch icons are registered in `src/routes/__root.tsx`.
- **Delivery:** `netlify.toml` defines the website build. Commits on `main` also sync to the connected Lovable project.
- **Android release:** `cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease` produces a signed AAB at `android/app/build/outputs/bundle/release/`. Signing config lives in `android/app/build.gradle` and reads `android/app/keystore.properties` (gitignored, points at `upload-keystore.jks`, alias `upload`). Passwords are in Doppler, `fulcrum` project, `prd` config, as `JAMI_ANDROID_STORE_PASSWORD` / `JAMI_ANDROID_KEY_PASSWORD` / `JAMI_ANDROID_KEY_ALIAS`. SDK is at `/opt/homebrew/share/android-commandlinetools` (see `android/local.properties`).
- **Local only:** `_backups/` holds Postgres dumps (gitignored, never commit). `assets/brand/` holds source logo/icon artwork. Zero-byte `Icon\r` files (macOS metadata) break Android resource builds — delete them with `find . -name "$(printf 'Icon\r')" -delete` if aapt errors mention "file name must end with .xml".
