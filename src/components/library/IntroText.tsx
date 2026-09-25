import { getBookIntroDisplayOverride } from "@/lib/book-intro-overrides";
import type { Intro } from "@/lib/library-api";
import { useLanguage } from "@/lib/language";

type Props = {
  intro: (Partial<Intro> & { book_number?: number | null }) | null | undefined;
  bengaliIntro?: {
    intro_bn_source?: string | null;
    intro_bn_display?: string | null;
  } | null | undefined;
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
 * Always complete — never clamped or truncated. Localized intro data refreshes on deployment.
 */
export function IntroText({ intro, bengaliIntro, label = "Introduction", className }: Props) {
  const { contentLanguage } = useLanguage();
  const override = getBookIntroDisplayOverride(intro?.book_number);
  const ar = override?.intro_ar_display ?? pick(intro?.intro_ar_display, intro?.intro_ar_source);
  const en = override?.intro_en_display ?? pick(intro?.intro_en_display, intro?.intro_en_source);
  const bn = pick(bengaliIntro?.intro_bn_display, bengaliIntro?.intro_bn_source);
  const translation = contentLanguage === "bn" ? bn : en;
  if (!ar && !translation) return null;

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
      {ar && translation ? <hr className="my-3 border-border" /> : null}
      {translation ? (
        <div
          lang={contentLanguage === "bn" ? "bn" : "en"}
          className={contentLanguage === "bn" ? "whitespace-pre-line text-foreground leading-8" : "english-text text-foreground"}
        >
          {translation}
        </div>
      ) : null}
    </section>
  );
}
