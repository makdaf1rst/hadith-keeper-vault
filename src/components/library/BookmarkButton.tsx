import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { useLanguage } from "@/lib/language";

type Props = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
};

/** Saves immediately on the device; signed-in readers also sync to their account. */
export function BookmarkButton({ number, bookTitle, collectionTitle, chapterTitle }: Props) {
  const { has, toggle, signedIn, pending } = useBookmarks();
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const saved = has(number);

  async function onClick() {
    try {
      const added = await toggle({
        number,
        bookTitle: bookTitle ?? null,
        collectionTitle: collectionTitle ?? null,
        chapterTitle: chapterTitle ?? null,
      });

      if (added) {
        toast.success(
          signedIn
            ? bn
              ? "হাদীসটি বুকমার্ক করা হয়েছে এবং অ্যাকাউন্টে সিঙ্ক হয়েছে।"
              : `Hadith ${number} bookmarked and synced.`
            : bn
              ? "হাদীসটি এই ডিভাইসে বুকমার্ক করা হয়েছে।"
              : `Hadith ${number} saved on this device.`,
          !signedIn
            ? {
                description: bn
                  ? "অন্য ডিভাইসেও বুকমার্ক পেতে সাইন ইন করুন।"
                  : "Sign in to sync bookmarks across devices.",
              }
            : undefined,
        );
      } else {
        toast.success(bn ? "বুকমার্ক সরানো হয়েছে।" : "Bookmark removed.");
      }
    } catch (error) {
      toast.warning(
        bn
          ? "বুকমার্কটি এই ডিভাইসে সংরক্ষিত আছে, কিন্তু অ্যাকাউন্টে সিঙ্ক করা যায়নি।"
          : error instanceof Error
            ? error.message
            : "Saved on this device, but account sync failed.",
      );
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size="sm"
      disabled={pending}
      aria-pressed={saved}
      aria-label={
        bn
          ? saved
            ? "বুকমার্ক থেকে হাদীসটি সরান"
            : "হাদীসটি বুকমার্ক করুন"
          : saved
            ? `Remove hadith ${number} from bookmarks`
            : `Bookmark hadith ${number}`
      }
      onClick={onClick}
    >
      {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
      {saved ? (bn ? "বুকমার্ক করা" : "Bookmarked") : bn ? "বুকমার্ক" : "Bookmark"}
    </Button>
  );
}
