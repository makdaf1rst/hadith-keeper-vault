import { Link } from "@tanstack/react-router";
import { BookOpenText, History } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";
import { clearHistory, useReadingHistory } from "@/lib/reading-history";

export function ContinueReading() {
  const history = useReadingHistory();
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const num = (n: number) => (bn ? toBengaliDigits(n) : String(n));
  const latest = history[0];
  if (!latest) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gold/50 bg-accent/30 px-4 py-3">
      <BookOpenText className="size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {bn ? "পড়া চালিয়ে যান" : "Continue reading"}
        </p>
        <p className="truncate text-sm text-foreground">
          {bn ? "হাদিস" : "Hadith"} {num(latest.number)}
          {latest.chapterTitle ?? latest.bookTitle ? (
            <span className="text-muted-foreground"> · {latest.chapterTitle ?? latest.bookTitle}</span>
          ) : null}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to="/hadith/$number"
          params={{ number: String(latest.number) }}
          className={buttonVariants({ size: "sm" })}
        >
          {bn ? "চালিয়ে যান" : "Continue"}
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <History /> {bn ? "সাম্প্রতিক" : "Recent"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{bn ? "সম্প্রতি দেখা হাদিস" : "Recently viewed"}</DialogTitle>
              <DialogDescription>
                {bn
                  ? "শুধু এই ডিভাইসে সংরক্ষিত।"
                  : "Saved on this device only."}
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-2">
              {history.map((entry) => (
                <li key={entry.number}>
                  <Link
                    to="/hadith/$number"
                    params={{ number: String(entry.number) }}
                    className="block rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="font-semibold text-primary">
                      {bn ? "হাদিস" : "Hadith"} {num(entry.number)}
                    </span>
                    {entry.bookTitle ? (
                      <span className="block text-xs text-muted-foreground">{entry.bookTitle}</span>
                    ) : null}
                    {entry.chapterTitle ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {entry.chapterTitle}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="self-start" onClick={clearHistory}>
              {bn ? "ইতিহাস মুছুন" : "Clear history"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
