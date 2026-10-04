import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookmarkX, Download, Library, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { useLanguage } from "@/lib/language";
import { toArabicIndicDigits } from "@/lib/normalize";

export const Route = createFileRoute("/bookmarks")({
  head: () => {
    const title = "My Bookmarks — Al-Jāmiʿ al-Kāmil";
    const description =
      "Bookmarks saved privately on this device, with backup and restore support for moving them between devices.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BookmarksPage,
});

function toBengaliDigits(value: number | string) {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);
}

function BookmarksPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const { bookmarks, remove, isLoading, createBackup, restoreBackup } = useBookmarks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function backupBookmarks() {
    try {
      const backup = createBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `al-jami-al-kamil-bookmarks-${date}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success(
        bn
          ? "বুকমার্ক ব্যাকআপ ফাইল তৈরি হয়েছে। এটি আপনার ডিভাইসের Files বা পছন্দের ক্লাউড ড্রাইভে সংরক্ষণ করুন।"
          : "Bookmark backup created. Save the file in Files or your preferred cloud drive.",
      );
    } catch {
      toast.error(bn ? "ব্যাকআপ ফাইল তৈরি করা যায়নি।" : "Could not create the backup file.");
    }
  }

  async function restoreFromFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = restoreBackup(parsed);
      toast.success(
        bn
          ? `${toBengaliDigits(result.imported)}টি বুকমার্ক ব্যাকআপ থেকে পড়া হয়েছে। মোট ${toBengaliDigits(result.total)}টি বুকমার্ক আছে।`
          : `${result.imported} bookmarks read from the backup. You now have ${result.total} bookmarks.`,
      );
    } catch (error) {
      toast.error(
        bn
          ? "এই ফাইলটি বৈধ আল-জামি‘ আল-কামিল বুকমার্ক ব্যাকআপ নয়।"
          : error instanceof Error
            ? error.message
            : "This is not a valid Al-Jāmiʿ al-Kāmil bookmark backup.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            {bn ? "আল-জামি আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold text-foreground">
          {bn ? "আমার বুকমার্ক" : "My Bookmarks"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {bn
            ? "বুকমার্কগুলো এই ডিভাইসে ব্যক্তিগতভাবে সংরক্ষিত থাকে। অন্য ডিভাইসে নিতে নিচের ব্যাকআপ ফাইল তৈরি করুন এবং সেখানে Restore Bookmarks ব্যবহার করুন।"
            : "Bookmarks are stored privately on this device. To move them to another device, create a backup file below and use Restore Bookmarks there."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={backupBookmarks}>
            <Download aria-hidden />
            {bn ? "বুকমার্ক ব্যাকআপ" : "Backup Bookmarks"}
          </Button>
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload aria-hidden />
            {bn ? "বুকমার্ক পুনরুদ্ধার" : "Restore Bookmarks"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void restoreFromFile(file);
            }}
          />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {bn
            ? "ব্যাকআপ ফাইলটি আপনি iPhone Files, iCloud Drive, Google Drive, কম্পিউটার বা অন্য নিরাপদ স্থানে রাখতে পারেন। সাইট আপনার Drive বা Files অ্যাকাউন্টে প্রবেশ করে না।"
            : "You can keep the backup file in iPhone Files, iCloud Drive, Google Drive, a computer, or another safe location. The website does not access your Drive or Files account."}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{bn ? "লোড হচ্ছে…" : "Loading…"}</p>
        ) : bookmarks.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-medium text-foreground">
              {bn ? "এখনও কোনো হাদীস সংরক্ষণ করা হয়নি" : "No saved hadiths yet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {bn
                ? "যেকোনো হাদীস খুলে তার নম্বরের পাশে “বুকমার্ক” চাপুন। সংরক্ষিত হাদীসগুলো এখানে দেখা যাবে।"
                : "Open any hadith and tap “Bookmark” beside its number. Saved hadiths appear here."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.number}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link
                    to="/hadith/$number"
                    params={{ number: String(bookmark.number) }}
                    className="min-w-0 flex-1"
                  >
                    <span className="flex items-baseline gap-2 text-base font-semibold text-primary">
                      {bn
                        ? `হাদীস ${toBengaliDigits(bookmark.number)}`
                        : `Hadith ${bookmark.number}`}
                      {!bn ? (
                        <span className="arabic-text text-base! leading-none! text-muted-foreground">
                          {toArabicIndicDigits(bookmark.number)}
                        </span>
                      ) : null}
                    </span>
                    {!bn ? (
                      <span className="mt-1 block space-y-0.5 text-sm text-muted-foreground">
                        {bookmark.bookTitle ? (
                          <span className="block">{bookmark.bookTitle}</span>
                        ) : null}
                        {bookmark.collectionTitle ? (
                          <span className="block">{bookmark.collectionTitle}</span>
                        ) : null}
                        {bookmark.chapterTitle ? (
                          <span className="block">{bookmark.chapterTitle}</span>
                        ) : null}
                      </span>
                    ) : null}
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void remove(bookmark.number)
                        .then(() =>
                          toast.success(bn ? "বুকমার্ক সরানো হয়েছে।" : "Bookmark removed."),
                        )
                        .catch(() =>
                          toast.error(
                            bn ? "এই বুকমার্কটি সরানো যায়নি।" : "Could not remove this bookmark.",
                          ),
                        );
                    }}
                    aria-label={
                      bn
                        ? `বুকমার্ক থেকে হাদীস ${toBengaliDigits(bookmark.number)} সরান`
                        : `Remove hadith ${bookmark.number} from bookmarks`
                    }
                  >
                    <BookmarkX aria-hidden />
                    {bn ? "সরান" : "Remove"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="outline" className="mt-10">
          <Link to="/">
            <ArrowLeft aria-hidden />
            {bn ? "গ্রন্থাগারে ফিরে যান" : "Back to the library"}
          </Link>
        </Button>
      </main>
    </div>
  );
}
