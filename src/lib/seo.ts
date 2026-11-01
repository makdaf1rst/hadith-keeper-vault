export const SITE_ORIGIN = "https://jami-al-kamil.com";
export const WORK_NAME = "Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil";
export const WORK_AUTHOR = "Ḍiyāʾ al-Raḥmān al-Aʿẓamī";
export const WORK_TRANSLATOR = "Sadman Zarif Talha";

export type Breadcrumb = {
  name: string;
  url: string;
};

export function makeBreadcrumbList(items: Breadcrumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Plain, verbatim source words for metadata; no rewriting or summarization. */
export function sourceExcerpt(source: string | null | undefined, maxLength = 180): string {
  const plain = (source ?? "")
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  const candidate = plain.slice(0, maxLength + 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > 0 ? boundary : maxLength).trimEnd()}…`;
}
