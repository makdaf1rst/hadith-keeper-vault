// Deployment sync marker: bilingual download pledge gate
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, FileText, Loader2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBengaliBookIntro } from "@/lib/bengali-book-intros";
import { getBengaliBookTitle } from "@/lib/bengali-book-titles";
import { fetchBengaliBookTranslations, fetchBengaliStructure } from "@/lib/bengali-translations";
import { formatBookTitle, formatChapterTitle, orderCollectionChapters } from "@/lib/display-titles";
import {
  buildKitabExport,
  downloadKitabDocx,
  downloadKitabPdf,
  downloadKitabTxt,
  kitabFileName,
  type BengaliExportData,
} from "@/lib/kitab-export";
import {
  fetchBookHadiths,
  fetchBooks,
  fetchChapters,
  fetchCollections,
  type Book,
  type Chapter,
  type Collection,
} from "@/lib/library-api";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — Al-Jāmiʿ al-Kāmil" },
      { name: "description", content: "PDF and Word downloads of each Kitāb and Majmūʿ of Al-Jāmiʿ al-Kāmil." },
      { property: "og:title", content: "Downloads — Al-Jāmiʿ al-Kāmil" },
      { property: "og:description", content: "PDF and Word downloads of each Kitāb and Majmūʿ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const { contentLanguage } = useLanguage();
  const bn = contentLanguage === "bn";
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  if (!agreed) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-pledge-title"
          className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-gold/35 bg-card shadow-xl"
        >
          <div className="border-b border-border bg-parchment px-5 py-5 text-center sm:px-8">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-gold/40 bg-background shadow-sm">
              <ShieldCheck className="size-5 text-primary" aria-hidden />
            </div>
            <p className="arabic-text text-center! text-lg! leading-normal! text-primary">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 id="download-pledge-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {bn ? "ডাউনলোডের আগে একটি আমানত ও অঙ্গীকার" : "A Trust Before You Download"}
            </h1>
          </div>

          <div className="max-h-[68vh] space-y-5 overflow-y-auto px-5 py-6 leading-7 sm:px-8">
            {bn ? (
              <>
                <p>
                  এই প্রকল্প এবং এর অন্তর্ভুক্ত সকল উপকরণ <strong>আল্লাহর সন্তুষ্টির উদ্দেশ্যে সম্পূর্ণ বিনামূল্যে</strong> প্রস্তুত ও প্রকাশ করা হয়েছে। আল্লাহর ইচ্ছায় আমাদের উদ্দেশ্য হলো—এটি যেন সর্বদা বিনামূল্যে থাকে, যাতে মানুষ রাসূলুল্লাহ ﷺ-এর সুন্নাহ পড়তে, অধ্যয়ন করতে, সংরক্ষণ করতে, অন্যদের শেখাতে এবং এর দ্বারা উপকৃত হতে পারে।
                </p>
                <p>
                  আপনি এই উপকরণসমূহ <strong>সম্পূর্ণ বিনামূল্যে ডাউনলোড করতে পারেন</strong>—নিজের অধ্যয়ন, গবেষণা, শিক্ষা, ছাত্রদের পড়ানো, পরিবার ও বন্ধুদের সঙ্গে ভাগ করে নেওয়া এবং অন্যান্য কল্যাণকর অ-বাণিজ্যিক কাজে ব্যবহারের জন্য।
                </p>
                <p>
                  তবে আমরা আল্লাহর সামনে আপনার কাছে এই অঙ্গীকার চাই যে, বিনামূল্যে দেওয়া এই কাজ, এর সংকলিত উপকরণ অথবা এর ডাউনলোডযোগ্য বিষয়বস্তু নিয়ে আপনি <strong>বিক্রি করবেন না, বিক্রির উদ্দেশ্যে পুনরায় প্যাকেজ করবেন না, পেইড ওয়াল বা অর্থের বিনিময়ে সীমাবদ্ধ করবেন না এবং ব্যক্তিগত বাণিজ্যিক লাভের পণ্য হিসেবে ব্যবহার করবেন না।</strong>
                </p>

                <blockquote className="rounded-xl border border-gold/30 bg-accent/30 px-4 py-4">
                  <p className="font-medium">“আর আমার আয়াতসমূহের বিনিময়ে সামান্য মূল্য গ্রহণ করো না।”</p>
                  <footer className="mt-1 text-sm text-muted-foreground">আল-কুরআন ২:৪১</footer>
                </blockquote>

                <blockquote className="rounded-xl border border-border bg-muted/30 px-4 py-4">
                  <p className="font-medium">
                    “যে ব্যক্তি এমন জ্ঞান অর্জন করে, যা আল্লাহর সন্তুষ্টি লাভের উদ্দেশ্যে শেখা হয়, কিন্তু সে তা কেবল দুনিয়ার কোনো স্বার্থ লাভের জন্য শেখে, সে কিয়ামতের দিন জান্নাতের সুগন্ধও পাবে না।”
                  </p>
                  <footer className="mt-1 text-sm text-muted-foreground">সুনান আবু দাউদ, ৩৬৬৪</footer>
                </blockquote>

                <p>
                  এই আয়াত ও হাদীস আমাদের ইখলাসের গুরুত্ব এবং আল্লাহর দ্বীনকে দুনিয়াবি স্বার্থের উপায়ে পরিণত করার ভয়াবহতা স্মরণ করিয়ে দেয়।
                </p>
                <p>
                  এই শর্ত আপনাকে এই জ্ঞান <strong>অধ্যয়ন করা, শেখানো, উদ্ধৃত করা, বিনামূল্যে শেয়ার করা অথবা অন্যদের উপকার করার</strong> ক্ষেত্রে বাধা দেয় না। এর উদ্দেশ্য শুধু এতটুকু—যে কাজটি বিনামূল্যে আল্লাহর সন্তুষ্টির জন্য দেওয়া হয়েছে, কেউ যেন সেটি নিয়ে নিজের বাণিজ্যিক পণ্য হিসেবে বিক্রি না করে।
                </p>

                <div className="rounded-xl border-2 border-primary/25 bg-primary/5 px-4 py-4">
                  <p className="mb-2 font-semibold">আপনার অঙ্গীকার</p>
                  <p>
                    <strong>“আল্লাহর নামে আমি অঙ্গীকার করছি যে, এই ডাউনলোড করা উপকরণ আমি অধ্যয়ন, শিক্ষা, গবেষণা, সংরক্ষণ এবং কল্যাণকরভাবে বিনামূল্যে প্রচারের জন্য ব্যবহার করব। এই বিনামূল্যে দেওয়া প্রকল্প বা এর ডাউনলোডযোগ্য উপকরণ আমি বিক্রি করব না, বাণিজ্যিকভাবে পুনর্বিতরণ করব না, পেইড ওয়ালের পেছনে রাখব না এবং লাভের উদ্দেশ্যে কোনো পণ্য হিসেবে উপস্থাপন করব না।”</strong>
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  আল্লাহ এই জ্ঞানকে উপকারী করুন, আমাদের ইখলাস রক্ষা করুন, আমাদের ভুলত্রুটি ক্ষমা করুন এবং এই কাজকে একমাত্র তাঁর সন্তুষ্টির জন্য কবুল করুন। আমীন।
                </p>
              </>
            ) : (
              <>
                <p>
                  This project, and everything made available through it, has been prepared and shared <strong>freely for the sake of Allah</strong>. By Allah’s permission, our intention is that it remain freely accessible so that people may read, study, benefit from, preserve, and teach the Sunnah of the Messenger of Allah ﷺ.
                </p>
                <p>
                  You are welcome to download this material <strong>without charge</strong> for your own study, research, teaching, sharing with students, family, friends, and other beneficial non-commercial purposes.
                </p>
                <p>
                  However, we ask you before Allah not to take this freely provided work, or the knowledge and compiled material contained within it, and <strong>sell it, repackage it for sale, place it behind a paywall, or use it as a product for personal commercial profit.</strong>
                </p>

                <blockquote className="rounded-xl border border-gold/30 bg-accent/30 px-4 py-4">
                  <p className="font-medium">“And do not exchange My signs for a small price.”</p>
                  <footer className="mt-1 text-sm text-muted-foreground">Qur’an 2:41</footer>
                </blockquote>

                <blockquote className="rounded-xl border border-border bg-muted/30 px-4 py-4">
                  <p className="font-medium">
                    “Whoever learns knowledge by which the Face of Allah is sought, but learns it only to obtain some worldly gain, will not smell the fragrance of Paradise on the Day of Resurrection.”
                  </p>
                  <footer className="mt-1 text-sm text-muted-foreground">Sunan Abī Dāwūd, 3664</footer>
                </blockquote>

                <p>
                  These texts remind us of the seriousness of sincerity and of not turning the religion of Allah into a means of worldly exploitation.
                </p>
                <p>
                  This condition does <strong>not</strong> prevent you from studying the material, teaching from it, quoting from it, sharing it freely, or benefiting others with it. Its purpose is simply to protect a project that was given freely from being taken and sold as someone else’s commercial product.
                </p>

                <div className="rounded-xl border-2 border-primary/25 bg-primary/5 px-4 py-4">
                  <p className="mb-2 font-semibold">Your pledge</p>
                  <p>
                    <strong>“By the name of Allah, I agree that I will use these downloaded materials for study, teaching, research, preservation, and beneficial sharing. I will not sell, commercially redistribute, place behind a paywall, or present this freely provided project or its downloadable contents as a product for profit.”</strong>
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  May Allah make this knowledge beneficial, preserve our sincerity, forgive our shortcomings, and accept this work solely for His sake. Āmīn.
                </p>
              </>
            )}
          </div>

          <div className="grid gap-3 border-t border-border bg-parchment px-5 py-5 sm:grid-cols-2 sm:px-8">
            <Button
              type="button"
              size="lg"
              onClick={() => setAgreed(true)}
              className="w-full"
            >
              {bn ? "আমি সম্মত — ডাউনলোডে যান" : "I Agree — Continue to Downloads"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="w-full"
            >
              {bn ? "আমি সম্মত নই — হোম পেজে ফিরে যান" : "I Do Not Agree — Return Home"}
            </Button>
          </div>
        </section>
      </main>
    );
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
        <DownloadList bn={bn} />
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
            <BabList book={book} bn={bn} />
          ) : (
            <ul className="space-y-2">
              {list.map((c) => (
                <CollectionRow key={c.id} book={book} collection={c} bn={bn} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}

function CollectionRow({ book, collection, bn }: { book: Book; collection: Collection; bn: boolean }) {
  const [open, setOpen] = useState(false);
  const structure = useQuery({
    queryKey: ["bn-structure", book.book_number],
    queryFn: () => fetchBengaliStructure(book.book_number),
    enabled: bn && open,
  });
  const bnTitle = bn
    ? structure.data?.collections.find((c) => c.id === collection.id)?.title_bn
    : null;
  return (
    <li className="rounded-md border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2 p-3 text-left"
      >
        {open ? <ChevronDown className="mt-0.5 size-4 shrink-0" /> : <ChevronRight className="mt-0.5 size-4 shrink-0" />}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{bnTitle || collection.title_en}</span>
          {collection.title_ar ? (
            <span className="arabic-text block text-sm" dir="rtl">
              {collection.title_ar}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <div className="border-t px-3 py-3">
          <BabList book={book} collection={collection} bn={bn} />
        </div>
      ) : null}
    </li>
  );
}

function BabList({ book, collection, bn }: { book: Book; collection?: Collection; bn: boolean }) {
  const chapters = useQuery({
    queryKey: ["dl-chapters", book.id],
    queryFn: () => fetchChapters(book.id),
  });
  const structure = useQuery({
    queryKey: ["bn-structure", book.book_number],
    queryFn: () => fetchBengaliStructure(book.book_number),
    enabled: bn,
  });
  const [q, setQ] = useState("");
  const babs = useMemo(() => {
    const all = chapters.data ?? [];
    return collection
      ? orderCollectionChapters(all.filter((c) => c.collection_id === collection.id))
      : [...all.filter((c) => !c.collection_id)].sort((a, b) => a.sort_order - b.sort_order);
  }, [chapters.data, collection]);
  const bnTitles = useMemo(
    () => new Map((structure.data?.chapters ?? []).map((c) => [c.id, c.title_bn])),
    [structure.data],
  );
  const labelFor = (c: Chapter) =>
    (bn && bnTitles.get(c.id) ? formatChapterTitle(c.chapter_number, bnTitles.get(c.id)!) : null) ||
    formatChapterTitle(c.chapter_number, c.title_en) ||
    (bn ? "বাব" : "Bāb");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return babs;
    return babs.filter((c) =>
      [String(c.chapter_number ?? ""), c.title_en ?? "", c.title_ar ?? "", bnTitles.get(c.id) ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [babs, q, bnTitles]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-md border border-gold/30 bg-parchment p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold">
          {collection
            ? bn ? "সম্পূর্ণ মাজমূ‘" : "Entire Collection"
            : bn ? "সম্পূর্ণ কিতাব" : "Entire Kitāb"}
        </p>
        <DownloadActions book={book} collection={collection} bn={bn} />
      </div>
      {chapters.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : babs.length > 0 ? (
        <>
          {babs.length > 8 ? (
            <Input
              placeholder={bn ? "বাব নম্বর বা নাম দিয়ে খুঁজুন" : "Filter Bābs by number or title"}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Filter Bābs"
            />
          ) : null}
          <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 border-b pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm">{labelFor(c)}</p>
                  {c.title_ar ? (
                    <p className="arabic-text text-sm" dir="rtl">
                      {c.title_ar}
                    </p>
                  ) : null}
                </div>
                <DownloadActions book={book} collection={collection} chapter={c} bn={bn} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
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

function DownloadActions({
  book,
  collection,
  chapter,
  bn,
}: {
  book: Book;
  collection?: Collection;
  chapter?: Chapter;
  bn: boolean;
}) {
  const [busy, setBusy] = useState<null | "pdf" | "docx" | "txt-en" | "txt-bn">(null);
  const showBook48Txt = book.book_number === 48 && !!collection && !chapter;

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
        ...(chapter ? { chapterId: chapter.id } : collection ? { collectionId: collection.id } : {}),
      });
      if (kind === "docx") {
        const outcome = await downloadKitabDocx(model, kitabFileName(book, "docx", collection, chapter));
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

  async function runTxt(lang: "en" | "bn") {
    if (busy || !collection) return;
    const busyKey = lang === "bn" ? "txt-bn" : "txt-en";
    setBusy(busyKey);
    const notice = toast.loading(lang === "bn" ? "বাংলা TXT তৈরি হচ্ছে…" : "Preparing English TXT…");
    try {
      const [collections, chapters, hadiths, bengali] = await Promise.all([
        fetchCollections(book.id),
        fetchChapters(book.id),
        fetchBookHadiths(book.id),
        lang === "bn" ? loadBengali(book) : Promise.resolve(null),
      ]);

      const model = buildKitabExport(book, collections, chapters, hadiths, {
        lang,
        bengali,
        collectionId: collection.id,
      });

      const part = collection.sort_order;
      const fileName = `Book-48-Part-${part}-${lang === "bn" ? "Bangla" : "English"}.txt`;
      const outcome = await downloadKitabTxt(model, fileName);
      const msg =
        outcome === "shared"
          ? "TXT file ready — choose “Save to Files”."
          : outcome === "opened"
            ? "TXT file opened — use your browser’s share or save option."
            : outcome === "cancelled"
              ? "Download cancelled."
              : "Download started.";
      toast.success(msg, { id: notice });
    } catch {
      toast.error("The TXT download could not be prepared. Please try again.", { id: notice });
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
      {showBook48Txt ? (
        <>
          <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={busy !== null} onClick={() => void runTxt("en")}>
            {busy === "txt-en" ? <Loader2 className="animate-spin" /> : <FileText />} English TXT
          </Button>
          <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={busy !== null} onClick={() => void runTxt("bn")}>
            {busy === "txt-bn" ? <Loader2 className="animate-spin" /> : <FileText />} বাংলা TXT
          </Button>
        </>
      ) : null}
    </div>
  );
}
