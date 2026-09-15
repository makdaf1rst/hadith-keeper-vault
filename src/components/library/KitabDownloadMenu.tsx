import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildKitabExport,
  downloadKitabDocx,
  downloadKitabPdf,
  kitabFileName,
} from "@/lib/kitab-export";
import {
  fetchBookHadiths,
  type Book,
  type Chapter,
  type Collection,
} from "@/lib/library-api";

type Props = {
  book: Book;
  collections: Collection[];
  chapters: Chapter[];
};

/**
 * Export-only control. It reads the current stored content for this Kitāb and
 * never writes to or changes the database.
 */
export function KitabDownloadMenu({ book, collections, chapters }: Props) {
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);

  async function run(kind: "pdf" | "docx") {
    if (busy) return;
    setBusy(kind);
    const notice = toast.loading("Preparing the download — this can take a moment.");
    try {
      const hadiths = await fetchBookHadiths(book.id);
      const model = buildKitabExport(book, collections, chapters, hadiths);
      if (kind === "docx") {
        await downloadKitabDocx(model, kitabFileName(book, "docx"));
        toast.success("Word file downloaded.", { id: notice });
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy !== null} aria-label="Download this Kitāb">
          {busy ? <Loader2 className="animate-spin" /> : <Download />}
          {busy ? "Preparing…" : "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void run("pdf")}>
          <FileText /> Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void run("docx")}>
          <FileText /> Download as Word (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
