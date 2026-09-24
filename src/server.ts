import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function hasBengaliPreviewCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === "jami_bengali_preview=1");
}

async function handleBengaliPreviewAuth(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/__bengali-preview/")) return null;

  if (url.pathname === "/__bengali-preview/status" && request.method === "GET") {
    return Response.json({ unlocked: hasBengaliPreviewCookie(request) });
  }

  if (url.pathname === "/__bengali-preview/unlock" && request.method === "POST") {
    const configuredPasscode =
      typeof env === "object" && env !== null
        ? (env as Record<string, unknown>)["BENGALI_PREVIEW_PASSCODE"]
        : undefined;

    if (typeof configuredPasscode !== "string" || configuredPasscode.length === 0) {
      return Response.json(
        { ok: false, error: "Bengali preview passcode is not configured." },
        { status: 503 },
      );
    }

    let submitted = "";
    try {
      const body = (await request.json()) as { passcode?: unknown };
      submitted = typeof body.passcode === "string" ? body.passcode : "";
    } catch {
      return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    if (submitted !== configuredPasscode) {
      return Response.json({ ok: false, error: "Incorrect passcode." }, { status: 401 });
    }

    return new Response(null, {
      status: 204,
      headers: {
        "set-cookie":
          "jami_bengali_preview=1; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800",
        "cache-control": "no-store",
      },
    });
  }

  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const previewAuthResponse = await handleBengaliPreviewAuth(request, env);
      if (previewAuthResponse) return previewAuthResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
