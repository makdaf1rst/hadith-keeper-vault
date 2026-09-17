import { getBookIntroDisplayOverride } from "@/lib/book-intro-overrides";
import type { Intro } from "@/lib/library-api";

type Props = {
  intro: (Partial<Intro> & { book_number?: number | null }) | null | undefined;
  label?: string;
  className?: string;
};

function pick(display: string | null | undefined, source: string | null | undefined) {
  const value = display ?? source;
  return value && value.trim().length > 0 ? value : null;
}

/**
 * Renders the introductory material (Qurʾānic verses, athar, scholarly notes) that the
 * source document places under a Kitāb / Collection / Bāb heading, before its hadiths.
 * Always complete — never clamped or truncated.
 */
export function IntroText({ intro, label = "Introduction", className }: Props) {
  const override = getBookIntroDisplayOverride(intro?.book_number);
  const ar = override?.intro_ar_display ?? pick(intro?.intro_ar_display, intro?.intro_ar_source);
  const en = override?.intro_en_display ?? pick(intro?.intro_en_display, intro?.intro_en_source);
  if (!ar && !en) return null;

  return (
    <section
      className={
        "rounded-md border border-border bg-parchment px-4 py-3 " + (className ?? "")
      }
    >
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {ar ? <p className="arabic-text text-foreground">{ar}</p> : null}
      {ar && en ? <hr className="my-3 border-border" /> : null}
      {en ? <div className="english-text text-foreground">{en}</div> : null}
    </section>
  );
}
