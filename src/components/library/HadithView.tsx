import { Copy } from "lucide-react";
import { toast } from "sonner";

import { BookmarkButton } from "@/components/library/BookmarkButton";
import { Button } from "@/components/ui/button";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import type { Book, Chapter, Collection, HadithFull } from "@/lib/library-api";
import { toArabicIndicDigits } from "@/lib/normalize";

type Props = {
  hadith: HadithFull;
  context?:
    | { book: Book | null; collection: Collection | null; chapter: Chapter | null }
    | undefined;
  showExactSource?: boolean | undefined;
};


function text(display: string | null, source: string | null) {
  const value = display ?? source;
  return value && value.trim().length > 0 ? value : null;
}

/**
 * The stored "full" record begins with the Arabic and English texts and then continues
 * with grading, references and commentary. Strip the parts that are already rendered
 * above so nothing is shown twice, while keeping any remaining material in full.
 */
function remainder(full: string | null, parts: (string | null)[]) {
  if (!full) return null;
  let rest = full;
  for (const part of parts) {
    if (!part) continue;
    const at = rest.indexOf(part.trim());
    if (at !== -1) {
      rest = (rest.slice(0, at) + "\n" + rest.slice(at + part.trim().length)).trim();
    }
  }
  return rest.trim().length > 0 ? rest.trim() : null;
}


async function copy(value: string | null, label: string) {
  if (!value) {
    toast.error(`No ${label} text stored for this hadith.`);
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied in full.`);
  } catch {
    toast.error("Copying failed in this browser.");
  }
}

export function HadithView({ hadith, context, showExactSource = false }: Props) {
  const arabic = showExactSource
    ? hadith.arabic_source
    : text(hadith.arabic_display, hadith.arabic_source);
  const english = showExactSource
    ? hadith.english_source
    : text(hadith.english_display, hadith.english_source);
  const full = showExactSource
    ? hadith.full_source_content
    : text(hadith.full_display_content, hadith.full_source_content);
  const extra = remainder(full, [arabic, english]);


  const whole = full ?? [arabic, english, extra].filter(Boolean).join("\n\n");

  return (
    <article className="rounded-lg border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-parchment px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight text-primary">
            Hadith {hadith.hadith_number}
          </span>
          <span className="arabic-text text-xl! leading-none! text-muted-foreground">
            {toArabicIndicDigits(hadith.hadith_number)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookmarkButton
            number={hadith.hadith_number}
            bookTitle={
              context?.book
                ? formatBookTitle(context.book.book_number, context.book.title_en)
                : null
            }
            collectionTitle={context?.collection?.title_en ?? null}
            chapterTitle={
              context?.chapter
                ? formatChapterTitle(context.chapter.chapter_number, context.chapter.title_en)
                : null
            }
          />
          <Button variant="outline" size="sm" onClick={() => copy(arabic, "Arabic")}>
            <Copy /> Arabic
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(english, "English")}>
            <Copy /> English
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(whole, "Full entry")}>
            <Copy /> Full entry
          </Button>
        </div>
      </header>

      {context ? (
        <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
          <BreadcrumbLine
            label="Book"
            ar={context.book?.title_ar}
            en={
              context.book
                ? formatBookTitle(context.book.book_number, context.book.title_en)
                : null
            }
          />
          <BreadcrumbLine
            label="Collection"
            ar={context.collection?.title_ar}
            en={context.collection?.title_en}
          />
          <BreadcrumbLine
            label="Chapter"
            ar={context.chapter?.title_ar}
            en={
              context.chapter
                ? formatChapterTitle(context.chapter.chapter_number, context.chapter.title_en)
                : null
            }
          />
        </div>
      ) : null}

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {arabic ? <p className="arabic-text text-foreground">{arabic}</p> : null}
        {arabic && english ? <hr className="border-border" /> : null}
        {english ? <div className="english-text text-foreground">{english}</div> : null}
        {extra ? (
          <>
            <hr className="border-border" />
            <div className="english-text text-foreground">{extra}</div>
          </>
        ) : null}
        {!arabic && !english && !extra ? (
          <p className="text-sm text-destructive">
            No content is stored for this hadith number yet.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function BreadcrumbLine({
  label,
  ar,
  en,
}: {
  label: string;
  ar?: string | null | undefined;
  en?: string | null | undefined;
}) {

  if (!ar && !en) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-0.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {en ? <span className="text-foreground">{en}</span> : null}
      {ar ? <span className="arabic-text text-base! leading-normal! text-foreground">{ar}</span> : null}
    </div>
  );
}
