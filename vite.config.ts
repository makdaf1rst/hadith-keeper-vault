// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Cloudflare Workers SSR (module worker + static assets). The static-only
  // alternatives were tried and rejected: nitro's static presets have no SSR
  // entry (breaks the vite build), and TanStack Start's spa-mode prerender
  // expects an ssr build layout that the nitro vite plugin in this stack does
  // not produce.
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      // Static assets (content/, pagefind/, assets/) are served by
      // Cloudflare's asset layer; only non-asset requests hit the worker.
      wrangler: {
        name: "jami-al-kamil",
        // Custom domains are declared here (not just in the dashboard) because
        // `wrangler deploy` removes routes that are not in the config, which
        // would detach the domain on the next CI deploy.
        routes: [
          { pattern: "jami-al-kamil.com", custom_domain: true },
          { pattern: "www.jami-al-kamil.com", custom_domain: true },
        ],
      },
    },
  },
});
