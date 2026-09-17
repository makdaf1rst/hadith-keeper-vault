import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBookmarks } from "@/lib/bookmarks";

type Props = {
  number: number;
  bookTitle?: string | null;
  collectionTitle?: string | null;
  chapterTitle?: string | null;
};

/** Saves a hadith to the reader's account. Never creates or changes hadith records. */
export function BookmarkButton({ number, bookTitle, collectionTitle, chapterTitle }: Props) {
  const { has, toggle, signedIn, pending } = useBookmarks();
  const [promptOpen, setPromptOpen] = useState(false);
  const saved = has(number);

  async function onClick() {
    if (!signedIn) {
      setPromptOpen(true);
      return;
    }
    try {
      const added = await toggle({
        number,
        bookTitle: bookTitle ?? null,
        collectionTitle: collectionTitle ?? null,
        chapterTitle: chapterTitle ?? null,
      });
      toast.success(added ? `Hadith ${number} bookmarked.` : "Bookmark removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this bookmark.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={saved ? "default" : "outline"}
        size="sm"
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? `Remove hadith ${number} from bookmarks` : `Bookmark hadith ${number}`}
        onClick={onClick}
      >
        {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
        {saved ? "Bookmarked" : "Bookmark"}
      </Button>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="bg-parchment sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to save bookmarks</DialogTitle>
            <DialogDescription>
              Please create an account or sign in to save bookmarks. Reading and searching the
              library always stays free and open.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create Account
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/auth" search={{ mode: "signin" }}>
                Sign In
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
