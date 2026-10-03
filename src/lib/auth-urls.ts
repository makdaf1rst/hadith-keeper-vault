export const SITE_URL = "https://jami-al-kamil.com";

/** Only allow navigation within the library after authentication. */
export function safeAuthRedirect(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  ) {
    return "/bookmarks";
  }

  try {
    const target = new URL(value, SITE_URL);
    if (target.origin !== SITE_URL || target.pathname.startsWith("/auth")) {
      return "/bookmarks";
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/bookmarks";
  }
}

/** Email links always return to the public site, including signups from previews. */
export function authEmailRedirect(path: "/auth/callback" | "/auth/reset-password"): string {
  return new URL(path, SITE_URL).href;
}

export function authLinkError(hash: string, search: string): string | null {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const query = new URLSearchParams(search.replace(/^\?/, ""));
  const params = fragment.has("error") || fragment.has("error_code") ? fragment : query;
  if (!params.has("error") && !params.has("error_code")) return null;
  return "This email link is invalid or has expired. Please request a new one.";
}
