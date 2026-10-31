import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, normalizePath, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";
import { renameSync } from "node:fs";
import { themeInitScript } from "./src/lib/theme-init";

function omitWebOnlyRoutes(): Plugin {
  const omitted = new Map([
    [normalizePath(resolve("src/routes/send-gift.tsx")), "/send-gift"],
    [normalizePath(resolve("src/routes/auth.tsx")), "/auth"],
  ]);
  return {
    name: "ios-omit-web-only-routes",
    enforce: "pre",
    load(id) {
      const path = omitted.get(normalizePath(id));
      if (!path) return null;
      return `import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute(${JSON.stringify(path)})({ beforeLoad: () => { throw redirect({ to: "/" }) } });`;
    },
  };
}

function iosIndexHtml(): Plugin {
  return {
    name: "ios-index-html",
    closeBundle() {
      renameSync(resolve("dist-ios/app.html"), resolve("dist-ios/index.html"));
    },
  };
}

function nativeThemeBeforePaint(): Plugin {
  return {
    name: "ios-theme-before-paint",
    transformIndexHtml: {
      order: "pre",
      handler() {
        return [{ tag: "script", children: `${themeInitScript}document.documentElement.classList.add("app");`, injectTo: "head-prepend" }];
      },
    },
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [omitWebOnlyRoutes(), nativeThemeBeforePaint(), iosIndexHtml(), react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: [{ find: /^@tanstack\/react-start(?:\/.*)?$/, replacement: resolve("src/ios-start-shim.ts") }],
  },
  build: {
    outDir: "dist-ios",
    emptyOutDir: true,
    rollupOptions: { input: { index: resolve("app.html") } },
  },
});
