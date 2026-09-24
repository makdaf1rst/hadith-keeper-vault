import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookmarkX, Library, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useBookmarks } from "@/lib/bookmarks";
import { useLanguage } from "@/lib/language";
import { toArabicIndicDigits } from "@/lib/normalize";

export const Route = createFileRoute("/bookmarks")({
  head: () => {
    const title = "My Bookmarks — Al-Jāmiʿ al-Kāmil";
    const description =
      "Your saved hadiths from Al-Jāmiʿ al-Kāmil, stored with your account and available on every device, with their Book, Collection and Chapter context.";
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
  const navigate = useNavigate();
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const { bookmarks, remove, signedIn, sessionLoading, isLoading } = useBookmarks();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success(bn ? "সাইন আউট করা হয়েছে।" : "Signed out.");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <span className="flex items-center gap-3">
            <Library className="size-5 text-primary" aria-hidden />
            <span className="text-sm font-medium text-foreground">
              {bn ? "আল-জামি আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}
            </span>
          </span>
          {signedIn ? (
            <Button type="button" variant="ghost" size="sm" onClick={signOut}>
              <LogOut aria-hidden /> {bn ? "সাইন আউট" : "Sign out"}
            </Button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold text-foreground">{bn ? "আমার বুকমার্ক" : "My Bookmarks"}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {bn
            ? "আপনি যে হাদীসগুলো সংরক্ষণ করেন সেগুলো আপনার অ্যাকাউন্টে থাকে, তাই যেকোনো ডিভাইস থেকে সেগুলো দেখতে পারবেন।"
            : "Hadiths you save are kept with your account, so they follow you to any device."}
        </p>

        {sessionLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{bn ? "লোড হচ্ছে…" : "Loading…"}</p>
        ) : !signedIn ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-medium text-foreground">
              {bn ? "বুকমার্ক সংরক্ষণ করতে অ্যাকাউন্ট তৈরি করুন অথবা সাইন ইন করুন" : "Please create an account or sign in to save bookmarks"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {bn
                ? "সম্পূর্ণ গ্রন্থাগার পড়া ও অনুসন্ধান করা বিনামূল্যে এবং উন্মুক্ত থাকবে—শুধু সংরক্ষিত হাদীসগুলো রাখার জন্য অ্যাকাউন্ট প্রয়োজন।"
                : "Reading and searching the whole library stays free and open — an account is only needed to keep your saved hadiths."}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link to="/auth" search={{ mode: "signup", redirect: "/bookmarks" }}>
                  {bn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth" search={{ mode: "signin", redirect: "/bookmarks" }}>
                  {bn ? "সাইন ইন" : "Sign In"}
                </Link>
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">
            {bn ? "আপনার বুকমার্ক লোড হচ্ছে…" : "Loading your bookmarks…"}
          </p>
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
            {bookmarks.map((b) => (
              <li key={b.number} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link to="/hadith/$number" params={{ number: String(b.number) }} className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2 text-base font-semibold text-primary">
                      {bn ? `হাদীস ${toBengaliDigits(b.number)}` : `Hadith ${b.number}`}
                      {!bn ? (
                        <span className="arabic-text text-base! leading-none! text-muted-foreground">
                          {toArabicIndicDigits(b.number)}
                        </span>
                      ) : null}
                    </span>
                    {!bn ? (
                      <span className="mt-1 block space-y-0.5 text-sm text-muted-foreground">
                        {b.bookTitle ? <span className="block">{b.bookTitle}</span> : null}
                        {b.collectionTitle ? <span className="block">{b.collectionTitle}</span> : null}
                        {b.chapterTitle ? <span className="block">{b.chapterTitle}</span> : null}
                      </span>
                    ) : null}
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void remove(b.number)
                        .then(() => toast.success(bn ? "বুকমার্ক সরানো হয়েছে।" : "Bookmark removed."))
                        .catch(() => toast.error(bn ? "এই বুকমার্কটি সরানো যায়নি।" : "Could not remove this bookmark."));
                    }}
                    aria-label={bn ? `বুকমার্ক থেকে হাদীস ${toBengaliDigits(b.number)} সরান` : `Remove hadith ${b.number} from bookmarks`}
                  >
                    <BookmarkX aria-hidden /> {bn ? "সরান" : "Remove"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="outline" className="mt-10">
          <Link to="/">
            <ArrowLeft aria-hidden /> {bn ? "গ্রন্থাগারে ফিরে যান" : "Back to the library"}
          </Link>
        </Button>
      </main>
    </div>
  );
}
