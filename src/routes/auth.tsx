import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Bookmarks — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Al-Jāmiʿ al-Kāmil bookmarks are saved directly on the reader's device. No account or sign-in is required.",
      },
    ],
  }),
  component: AuthRetiredPage,
});

function AuthRetiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center">
        <Bookmark className="mx-auto size-8 text-primary" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold text-foreground">No sign-in required</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Accounts are no longer required for bookmarks. Your bookmarks are saved directly on this
          device. Use Backup Bookmarks and Restore Bookmarks to move them to another device.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/bookmarks">My Bookmarks</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft aria-hidden />
              Back to the library
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
