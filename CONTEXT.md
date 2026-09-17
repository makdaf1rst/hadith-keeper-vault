# Hadith Keeper Vault

- **Reads:** `AGENTS.md` for repository rules, `README.md` for product context, and `src/routes/README.md` for route conventions.
- **Does:** Serves the bilingual hadith library at https://jami-al-kamil.com using TanStack Start.
- **Writes:** Application code in `src/` and public assets in `public/`. Browser and Apple touch icons are registered in `src/routes/__root.tsx`.
- **Delivery:** `netlify.toml` defines the website build. Commits on `main` also sync to the connected Lovable project.
