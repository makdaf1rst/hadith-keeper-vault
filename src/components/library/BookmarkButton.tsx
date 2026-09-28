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

/** Saves bookmarks directly on the reader's device. */
export function BookmarkButton({ number, bookTitle, collectionTitle, chapterTitle }: Props) {
  const { has, toggle, pending } = useBookmarks();
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

      toast.success(
        added
          ? bn
            ? "হাদীসটি এই ডিভাইসে বুকমার্ক করা হয়েছে।"
            : `Hadith ${number} saved on this device.`
          : bn
            ? "বুকমার্ক সরানো হয়েছে।"
            : "Bookmark removed.",
      );
    } catch (error) {
      toast.error(
        bn
          ? "এই বুকমার্কটি সংরক্ষণ করা যায়নি।"
          : error instanceof Error
            ? error.message
            : "Could not save this bookmark.",
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
