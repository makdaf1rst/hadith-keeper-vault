import { cp, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const publicRoot = join(root, ".output", "public");
const destination = join(root, "dist-ios");

async function requireDirectory(name) {
  const path = join(publicRoot, name);
  const info = await stat(path).catch(() => null);
  if (!info?.isDirectory()) throw new Error(`Required build directory is missing: ${path}`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} failed with ${code}`)));
  });
}

await requireDirectory("content");
await requireDirectory("pagefind");
await run("node", ["scripts/build-content-manifest.mjs"]);
await run("bunx", ["vite", "build", "--config", "vite.ios.config.ts"]);
await mkdir(destination, { recursive: true });
await cp(join(publicRoot, "content"), join(destination, "content"), { recursive: true });
await cp(join(publicRoot, "pagefind"), join(destination, "pagefind"), { recursive: true });
for (const name of ["favicon.ico", "favicon-96x96.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "jami-al-kamil-logo.png"]) {
  const source = join(publicRoot, name);
  if (await stat(source).catch(() => null)) await cp(source, join(destination, name));
}
await cp(join(root, "ios", "App", "DailyHadithWidget", "daily-hadith.json"), join(destination, "daily-hadith.json"));
await run("bunx", ["cap", "sync", "ios"]);
await run("node", ["scripts/check-ios-bundle.mjs"]);
