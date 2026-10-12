// Deployment sync marker: always-visible continue reading panel
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

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gold/50 bg-accent/30 px-4 py-3">
      <BookOpenText className="size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {bn ? "পড়া চালিয়ে যান" : "Continue reading"}
        </p>
        {latest ? (
          <p className="truncate text-sm text-foreground">
            {bn ? "হাদিস" : "Hadith"} {num(latest.number)}
            {(latest.chapterTitle ?? latest.bookTitle) ? (
              <span className="text-muted-foreground">
                {" "}
                · {latest.chapterTitle ?? latest.bookTitle}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {bn
              ? "এখনও কোনো সাম্প্রতিক হাদিস সংরক্ষিত হয়নি। একটি হাদিস খুললে এখানে আপনার পড়ার স্থান মনে রাখা হবে।"
              : "No recent hadith yet. Open a hadith and your reading place will be remembered here."}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {latest ? (
          <Link
            to="/hadith/$number"
            params={{ number: String(latest.number) }}
            className={buttonVariants({ size: "sm" })}
          >
            {bn ? "চালিয়ে যান" : "Continue"}
          </Link>
        ) : null}
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
                {bn ? "শুধু এই ডিভাইসে সংরক্ষিত।" : "Saved on this device only."}
              </DialogDescription>
            </DialogHeader>
            {history.length ? (
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
                        <span className="block text-xs text-muted-foreground">
                          {entry.bookTitle}
                        </span>
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
            ) : (
              <p className="text-sm text-muted-foreground">
                {bn ? "এখনও কোনো হাদিস দেখা হয়নি।" : "No hadith has been viewed yet."}
              </p>
            )}
            {history.length ? (
              <Button variant="ghost" size="sm" className="self-start" onClick={clearHistory}>
                {bn ? "ইতিহাস মুছুন" : "Clear history"}
              </Button>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// App-only "Recent" chip row (Quran.com style); the website keeps ContinueReading above.
export function RecentChips() {
  const history = useReadingHistory();
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  if (history.length === 0) return null;

  return (
    <section className="hidden font-sans [.app_&]:block">
      <h2 className="mb-2 px-4 font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {bn ? "সাম্প্রতিক" : "Recent"}
      </h2>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {history.slice(0, 5).map((entry) => (
          <li key={entry.number} className="shrink-0">
            <Link
              to="/hadith/$number"
              params={{ number: String(entry.number) }}
              className="flex max-w-56 flex-col rounded-2xl border border-border bg-card px-4 py-2.5 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="text-sm font-semibold text-foreground">
                {bn ? "হাদিস" : "Hadith"} {bn ? toBengaliDigits(entry.number) : entry.number}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {entry.chapterTitle ?? entry.bookTitle ?? entry.collectionTitle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
