import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, FileText, Loader2, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { fetchBengaliBookTranslations, fetchBengaliStructure } from "@/lib/bengali-translations";
import { formatBookTitle } from "@/lib/display-titles";
import { verifyDownloadsPasscode } from "@/lib/downloads-access.functions";
import {
  buildKitabExport,
  downloadKitabDocx,
  downloadKitabPdf,
  kitabFileName,
  type BengaliExportData,
} from "@/lib/kitab-export";
import {
  fetchBookHadiths,
  fetchBooks,
  fetchChapters,
  fetchCollections,
  type Book,
  type Collection,
} from "@/lib/library-api";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — Al-Jāmiʿ al-Kāmil" },
      { name: "description", content: "Private PDF and Word downloads of each Kitāb and Majmūʿ of Al-Jāmiʿ al-Kāmil." },
      { property: "og:title", content: "Downloads — Al-Jāmiʿ al-Kāmil" },
      { property: "og:description", content: "Private PDF and Word downloads of each Kitāb and Majmūʿ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadsPage,
});

const UNLOCK_KEY = "jami-downloads-unlocked";

function DownloadsPage() {
  const { contentLanguage } = useLanguage();
  const bn = contentLanguage === "bn";
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
  }, []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await verifyDownloadsPasscode({ data: { code: code.trim() } });
      if (res.ok) {
        sessionStorage.setItem(UNLOCK_KEY, "1");
        setUnlocked(true);
      } else setError(res.error);
    } catch {
      setError("Unable to check the passcode right now.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{bn ? "ডাউনলোড" : "Downloads"}</h1>
      <p className="mt-2 text-muted-foreground">
        {bn
          ? "প্রতিটি নথিতে আরবি ও বাংলা থাকবে (বর্তমান ভাষা)।"
          : "Each document contains Arabic and English (your current language)."}
      </p>

      <div className="mt-6">
        {unlocked ? (
          <DownloadList bn={bn} />
        ) : (
          <form onSubmit={unlock} className="max-w-sm space-y-3 rounded-xl border bg-card p-5 shadow-sm">
            <label htmlFor="dl-code" className="flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4" aria-hidden /> {bn ? "পাসকোড" : "Passcode"}
            </label>
            <Input
              id="dl-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={checking || !code.trim()} className="w-full">
              {checking ? <Loader2 className="animate-spin" /> : null}
              {bn ? "খুলুন" : "Unlock"}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8">
        <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
          {bn ? "← গ্রন্থাগারে ফিরে যান" : "← Back to the Library"}
        </Link>
      </div>
    </main>
  );
}

function DownloadList({ bn }: { bn: boolean }) {
  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = books.data ?? [];
    if (!term) return list;
    return list.filter((b) =>
      [String(b.book_number), b.title_en ?? "", b.title_ar ?? "", getBengaliBookTitle(b.book_number) ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [books.data, q]);

  return (
    <div className="space-y-3">
      <Input
        placeholder={bn ? "কিতাব নম্বর বা নাম দিয়ে খুঁজুন" : "Filter by Kitāb number or title"}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter Kitābs"
      />
      {books.isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
      <ul className="space-y-2">
        {filtered.map((book) => (
          <BookRow key={book.id} book={book} bn={bn} />
        ))}
      </ul>
    </div>
  );
}

function BookRow({ book, bn }: { book: Book; bn: boolean }) {
  const [open, setOpen] = useState(false);
  const collections = useQuery({
    queryKey: ["dl-collections", book.id],
    queryFn: () => fetchCollections(book.id),
    enabled: open,
  });
  const title = (bn ? getBengaliBookTitle(book.book_number) : null) ?? formatBookTitle(book.book_number, book.title_en);
  const list = [...(collections.data ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <li className="rounded-lg border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 p-4 text-left"
      >
        {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
        <span className="flex-1 font-medium">{title}</span>
        {book.title_ar ? (
          <span className="arabic-text hidden text-base sm:inline" dir="rtl">
            {book.title_ar}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="border-t px-4 py-3">
          {collections.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <DownloadActions book={book} bn={bn} />
          ) : (
            <ul className="space-y-3">
              {list.map((c) => (
                <li key={c.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.title_en}</p>
                    {c.title_ar ? (
                      <p className="arabic-text text-sm" dir="rtl">
                        {c.title_ar}
                      </p>
                    ) : null}
                  </div>
                  <DownloadActions book={book} collection={c} bn={bn} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}

async function loadBengali(book: Book): Promise<BengaliExportData> {
  const [structure, hadiths] = await Promise.all([
    fetchBengaliStructure(book.book_number),
    fetchBengaliBookTranslations(book.book_number),
  ]);
  const intro = getBengaliBookIntro(book.book_number);
  return {
    bookTitle: getBengaliBookTitle(book.book_number),
    bookIntro: intro?.intro_bn_display ?? intro?.intro_bn_source ?? null,
    collections: new Map(structure.collections.map((c) => [c.id, c])),
    chapters: new Map(structure.chapters.map((c) => [c.id, c])),
    hadiths,
  };
}

function DownloadActions({ book, collection, bn }: { book: Book; collection?: Collection; bn: boolean }) {
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);

  async function run(kind: "pdf" | "docx") {
    if (busy) return;
    setBusy(kind);
    const notice = toast.loading(bn ? "ফাইল তৈরি হচ্ছে…" : "Preparing the download…");
    try {
      const [collections, chapters, hadiths, bengali] = await Promise.all([
        fetchCollections(book.id),
        fetchChapters(book.id),
        fetchBookHadiths(book.id),
        bn ? loadBengali(book) : Promise.resolve(null),
      ]);
      const model = buildKitabExport(book, collections, chapters, hadiths, {
        lang: bn ? "bn" : "en",
        bengali,
        ...(collection ? { collectionId: collection.id } : {}),
      });
      if (kind === "docx") {
        const outcome = await downloadKitabDocx(model, kitabFileName(book, "docx", collection));
        const msg =
          outcome === "shared"
            ? "Word file ready — choose “Save to Files”."
            : outcome === "opened"
              ? "Word file opened — use your browser’s share or save option."
              : outcome === "cancelled"
                ? "Download cancelled."
                : "Download started.";
        toast.success(msg, { id: notice });
      } else {
        await downloadKitabPdf(model);
        toast.success("Choose “Save as PDF” in the print window.", { id: notice });
      }
    } catch {
      toast.error("The download could not be prepared. Please try again.", { id: notice });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={busy !== null} onClick={() => void run("pdf")}>
        {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileText />} PDF
      </Button>
      <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={busy !== null} onClick={() => void run("docx")}>
        {busy === "docx" ? <Loader2 className="animate-spin" /> : <FileText />} Word (.docx)
      </Button>
    </div>
  );
}
