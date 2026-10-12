import type { ReactNode } from "react";

// Website-only sticky bar under SiteHeader (Quran.com reader style). The app keeps each route's own header.
export function ReaderSubBar({
  left,
  title,
  right,
  progress,
}: {
  left: ReactNode;
  title: ReactNode;
  right?: ReactNode;
  progress?: number;
}) {
  return (
    <div className="sticky top-14 z-30 border-b border-border/70 bg-background/85 font-sans backdrop-blur-md supports-[backdrop-filter]:bg-background/70 [.app_&]:hidden">
      <div className="mx-auto flex h-12 max-w-4xl items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center">{left}</div>
        <div className="hidden shrink-0 text-sm font-semibold text-foreground md:block">{title}</div>
        <div className="flex flex-1 items-center justify-end gap-1">{right}</div>
      </div>
      {progress != null ? (
        <div className="h-0.5 bg-border/60" aria-hidden>
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export const subBarBack =
  "inline-flex min-w-0 items-center gap-2 rounded-full py-1 pr-3 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export const subBarPill =
  "inline-flex h-8 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
