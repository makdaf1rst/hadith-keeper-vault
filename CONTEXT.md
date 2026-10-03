# Hadith Keeper Vault

- **Reads:** `AGENTS.md` for repository rules, `README.md` for product context, and `src/routes/README.md` for route conventions.
- **Does:** Serves the bilingual hadith library at https://jami-al-kamil.com using TanStack Start.
- **Does:** Wraps the live site in Capacitor app shells (`ios/`, `android/`, config in `capacitor.config.ts`, offline fallback in `capacitor-shell/`); `public/manifest.webmanifest` and icons support PWA install.
- **Does:** Service worker (`public/sw.js`, registered in `src/lib/register-sw.ts`) serves previously viewed pages, Supabase data, assets, and fonts from cache for offline reading.
- **Writes:** Application code in `src/` and public assets in `public/`. Browser and Apple touch icons are registered in `src/routes/__root.tsx`.
- **Delivery:** `netlify.toml` defines the website build. Commits on `main` also sync to the connected Lovable project.
- **Local only:** `_backups/` holds Postgres dumps (gitignored, never commit). `assets/brand/` holds source logo/icon artwork.
