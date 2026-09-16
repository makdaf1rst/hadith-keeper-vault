import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";

type Props = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
};

/** Saves a hadith to this device only; no database record is created or changed. */
export function BookmarkButton({ number, bookTitle, collectionTitle, chapterTitle }: Props) {
  const { has, toggle } = useBookmarks();
  const saved = has(number);

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size="sm"
      aria-pressed={saved}
      aria-label={saved ? `Remove hadith ${number} from bookmarks` : `Bookmark hadith ${number}`}
      onClick={() => {
        const added = toggle({
          number,
          bookTitle: bookTitle ?? null,
          collectionTitle: collectionTitle ?? null,
          chapterTitle: chapterTitle ?? null,
        });
        toast.success(added ? `Hadith ${number} bookmarked.` : `Bookmark removed.`);
      }}
    >
      {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
      {saved ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
