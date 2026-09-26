import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchBooks,
  fetchChapters,
  fetchCollections,
  searchHadiths,
  searchHeadings,
} from "@/lib/library-api";
import {
  hadithsInRange,
  RANGE_LIMIT,
  refineResults,
  searchBengaliInBook,
  type AdvancedResult,
  type GradeFilter,
} from "@/lib/advanced-search";
import { formatBookTitle, formatChapterTitle } from "@/lib/display-titles";
import { useInterfaceText, useLanguage } from "@/lib/language";
import { normalizeEnglish, toArabicIndicDigits } from "@/lib/normalize";

const ALL = "__all__";

function preview(value: string | null, term: string) {
  if (!value) return null;
  const flat = value.replace(/\s+/g, " ").trim();
  const normalized = normalizeEnglish(flat);
  const needle = normalizeEnglish(term);
  let start = 0;
  if (needle && normalized.includes(needle)) {
    start = Math.max(0, normalized.indexOf(needle) - 90);
  }
  const slice = flat.slice(start, start + 260);
  return (start > 0 ? "… " : "") + slice + (flat.length > start + 260 ? " …" : "");
}

export function SearchPanel() {
  const navigate = useNavigate();
  const t = useInterfaceText();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [bookId, setBookId] = useState<string>(ALL);
  const [collectionId, setCollectionId] = useState<string>(ALL);
  const [chapterId, setChapterId] = useState<string>(ALL);
  const [language, setLanguage] = useState<"all" | "ar" | "en">("all");
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [grade, setGrade] = useState<GradeFilter>("any");
  const [exact, setExact] = useState(false);
  const [field, setField] = useState<"default" | "bn">("default");

  const parseNum = (value: string) => {
    const n = Number(value.trim());
    return value.trim() && Number.isInteger(n) && n > 0 ? n : null;
  };
  const from = advancedOpen ? parseNum(rangeFrom) : null;
  const to = advancedOpen ? parseNum(rangeTo) : null;
  const advGrade: GradeFilter = advancedOpen ? grade : "any";
  const advExact = advancedOpen && exact;
  const advField = advancedOpen ? field : "default";
  const advancedActive =
    from != null || to != null || advGrade !== "any" || advExact || advField === "bn";
  const rangeOnly = !query.trim() && (from != null || to != null);
  const bengaliNeedsBook = advField === "bn" && bookId === ALL;

  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const collections = useQuery({
    queryKey: ["collections", bookId],
    queryFn: () => fetchCollections(bookId),
    enabled: bookId !== ALL,
  });
  const chapters = useQuery({
    queryKey: ["chapters", bookId],
    queryFn: () => fetchChapters(bookId),
    enabled: bookId !== ALL,
  });

  const results = useQuery({
    queryKey: [
      "search",
      query,
      bookId,
      collectionId,
      chapterId,
      language,
      from,
      to,
      advGrade,
      advExact,
      advField,
    ],
    queryFn: async (): Promise<AdvancedResult[]> => {
      const scope = {
        bookId: bookId === ALL ? null : bookId,
        collectionId: collectionId === ALL ? null : collectionId,
        chapterId: chapterId === ALL ? null : chapterId,
      };
      let base: AdvancedResult[];
      if (advField === "bn" && query.trim()) {
        if (!scope.bookId) return [];
        base = await searchBengaliInBook(scope.bookId, query, advExact, scope);
      } else if (!query.trim()) {
        const start = from ?? to ?? 1;
        base = await hadithsInRange(start, to ?? start + RANGE_LIMIT - 1, scope);
      } else {
        base = await searchHadiths({ query, ...scope, language });
      }
      if (!advancedActive) return base;
      return refineResults(base, {
        from,
        to,
        grade: advGrade,
        exact: advExact,
        phrase: query,
        language,
      });
    },
    enabled: query.trim().length > 0 || rangeOnly,
  });

  const headings = useQuery({
    queryKey: ["heading-search", query],
    queryFn: () => searchHeadings(query),
    enabled: query.trim().length > 1,
  });

  const numeric = useMemo(() => {
    const trimmed = query.trim();
    return /^\d{1,5}$/.test(trimmed) ? Number(trimmed) : null;
  }, [query]);

  const bookById = useMemo(
    () => new Map((books.data ?? []).map((b) => [b.id, b])),
    [books.data],
  );

  const filtersActive =
    bookId !== ALL || collectionId !== ALL || chapterId !== ALL || language !== "all";

  return (
    <section className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(input);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAria}
            className="h-11 bg-card pl-9 text-base"
          />
        </div>
        <Button type="submit" className="h-11 px-6">
          {t.search}
        </Button>
        {query ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => {
              setInput("");
              setQuery("");
            }}
          >
            <X /> {t.clear}
          </Button>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={bookId}
          onValueChange={(value) => {
            setBookId(value);
            setCollectionId(ALL);
            setChapterId(ALL);
          }}
        >
          <SelectTrigger className="w-56 bg-card">
            <SelectValue placeholder={t.allBooks} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.allBooks}</SelectItem>
            {(books.data ?? []).map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {formatBookTitle(book.book_number, book.title_en ?? book.title_ar)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={collectionId}
          onValueChange={setCollectionId}
          disabled={bookId === ALL || !(collections.data ?? []).length}
        >
          <SelectTrigger className="w-56 bg-card">
            <SelectValue placeholder={t.allCollections} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.allCollections}</SelectItem>
            {(collections.data ?? []).map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.title_en ?? collection.title_ar ?? "Untitled collection"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={chapterId}
          onValueChange={setChapterId}
          disabled={bookId === ALL || !(chapters.data ?? []).length}
        >
          <SelectTrigger className="w-56 bg-card">
            <SelectValue placeholder={t.allChapters} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.allChapters}</SelectItem>
            {(chapters.data ?? []).map((chapter) => (
              <SelectItem key={chapter.id} value={chapter.id}>
                {formatChapterTitle(
                  chapter.chapter_number,
                  chapter.title_en ?? chapter.title_ar,
                ) || "Chapter"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={(value) => setLanguage(value as typeof language)}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allLanguages}</SelectItem>
            <SelectItem value="ar">{t.arabic}</SelectItem>
            <SelectItem value="en">{t.english}</SelectItem>
          </SelectContent>
        </Select>

        {filtersActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBookId(ALL);
              setCollectionId(ALL);
              setChapterId(ALL);
              setLanguage("all");
            }}
          >
            <X /> {t.clearFilters}
          </Button>
        ) : null}

        <Button
          type="button"
          variant={advancedOpen ? "secondary" : "outline"}
          size="sm"
          aria-expanded={advancedOpen}
          aria-controls="advanced-search-panel"
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          <SlidersHorizontal /> {bn ? "উন্নত অনুসন্ধান" : "Advanced search"}
          <ChevronDown className={advancedOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </Button>
      </div>

      {advancedOpen ? (
        <div
          id="advanced-search-panel"
          className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <fieldset className="space-y-1">
            <legend className="text-xs font-semibold text-muted-foreground">
              {bn ? "হাদিস নম্বর (পরিসর)" : "Hadith number / range"}
            </legend>
            <div className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value.replace(/[^\d]/g, ""))}
                placeholder={bn ? "থেকে" : "From"}
                aria-label={bn ? "হাদিস নম্বর থেকে" : "Hadith number from"}
                className="bg-background"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                inputMode="numeric"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value.replace(/[^\d]/g, ""))}
                placeholder={bn ? "পর্যন্ত" : "To"}
                aria-label={bn ? "হাদিস নম্বর পর্যন্ত" : "Hadith number to"}
                className="bg-background"
              />
            </div>
          </fieldset>

          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">
              {bn ? "মান (লেখায় উল্লিখিত)" : "Grade (as stated in the text)"}
            </span>
            <Select value={grade} onValueChange={(v) => setGrade(v as GradeFilter)}>
              <SelectTrigger className="w-full bg-background" aria-label={bn ? "মান" : "Grade"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{bn ? "যেকোনো মান" : "Any grade"}</SelectItem>
                <SelectItem value="agreed">{bn ? "মুত্তাফাকুন আলাইহি" : "Agreed upon"}</SelectItem>
                <SelectItem value="sahih">{bn ? "সহীহ" : "Sahih"}</SelectItem>
                <SelectItem value="hasan">{bn ? "হাসান" : "Hasan"}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">
              {bn ? "কোথায় খুঁজবেন" : "Search in"}
            </span>
            <Select value={field} onValueChange={(v) => setField(v as "default" | "bn")}>
              <SelectTrigger className="w-full bg-background" aria-label={bn ? "কোথায় খুঁজবেন" : "Search in"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  {bn ? "আরবি / ইংরেজি (উপরের ভাষা অনুযায়ী)" : "Arabic / English (language above)"}
                </SelectItem>
                <SelectItem value="bn">{bn ? "বাংলা অনুবাদ" : "Bengali translation"}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={exact}
              onChange={(e) => setExact(e.target.checked)}
              className="size-4 accent-primary"
            />
            {bn ? "হুবহু বাক্যাংশ মেলান" : "Exact phrase"}
          </label>

          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
            {bn
              ? `ফিল্টার শুধু বিদ্যমান ফলাফল সংকুচিত করে। শুধু নম্বর-পরিসর দিলে সর্বোচ্চ ${RANGE_LIMIT}টি হাদিস দেখানো হয়। বাংলা অনুসন্ধানের জন্য একটি কিতাব নির্বাচন করুন।`
              : `Filters only narrow the existing results. A number range on its own lists up to ${RANGE_LIMIT} hadiths. Bengali search needs a Kitāb selected.`}
          </p>
        </div>
      ) : null}

      {numeric ? (
        <div className="rounded-md border border-gold/50 bg-accent/40 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/hadith/$number", params: { number: String(numeric) } })}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.goToHadith} {numeric} ({toArabicIndicDigits(numeric)})
          </button>
        </div>
      ) : null}

      {query && headings.data?.length ? (
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t.matchingHeadings}
          </h3>
          <ul className="space-y-1 text-sm">
            {headings.data.map((hit) => (
              <li key={`${hit.kind}-${hit.id}`} className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs text-muted-foreground capitalize">{hit.kind}</span>
                {hit.kind === "book" && hit.bookNumber ? (
                  <Link
                    to="/book/$number"
                    params={{ number: String(hit.bookNumber) }}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {formatBookTitle(hit.bookNumber, hit.title_en ?? hit.title_ar)}
                  </Link>
                ) : (
                  <span>
                    {hit.kind === "chapter"
                      ? formatChapterTitle(hit.chapterNumber, hit.title_en ?? hit.title_ar)
                      : hit.title_en ?? hit.title_ar}
                  </span>
                )}
                {hit.title_ar && hit.title_en ? (
                  <span className="arabic-text text-base! leading-normal! text-muted-foreground">
                    {hit.title_ar}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {query || rangeOnly ? (
        <div className="space-y-3">
          {bengaliNeedsBook && query.trim() ? (
            <p className="text-sm text-muted-foreground">
              {bn ? "বাংলা অনুবাদে খুঁজতে উপরে একটি কিতাব নির্বাচন করুন।" : "Choose a Kitāb above to search the Bengali translation."}
            </p>
          ) : null}
          {results.isLoading ? <p className="text-sm text-muted-foreground">{t.searching}</p> : null}
          {results.error ? (
            <p className="text-sm text-destructive">{t.searchFailed}</p>
          ) : null}
          {results.data && results.data.length === 0 && !results.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t.noSearchMatch}
            </p>
          ) : null}
          {results.data?.map((result) => {
            const book = result.book_id ? bookById.get(result.book_id) : undefined;
            return (
              <Link
                key={result.id}
                to="/hadith/$number"
                params={{ number: String(result.hadith_number) }}
                className="block rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-primary">{t.hadith} {result.hadith_number}</span>
                  {book ? (
                    <span className="text-xs text-muted-foreground">
                      {formatBookTitle(book.book_number, book.title_en ?? book.title_ar)}
                    </span>
                  ) : null}
                </div>
                {result.arabic_display ? (
                  <p className="arabic-text mt-2 text-lg! leading-loose! text-foreground/90">
                    {preview(result.arabic_display, query)}
                  </p>
                ) : null}
                {result.bengali_text ? (
                  <p lang="bn" className="mt-1 text-sm text-muted-foreground">
                    {preview(result.bengali_text, "")}
                  </p>
                ) : null}
                {result.english_display && !result.bengali_text ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {preview(result.english_display, query)}
                  </p>
                ) : null}
                <span className="mt-2 inline-block text-xs text-muted-foreground italic">
                  {t.previewOnly}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
