import { Link } from "@tanstack/react-router";
import { ArrowLeft, Library } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">Al-Jāmiʿ al-Kāmil</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/">
            <ArrowLeft aria-hidden />
            Back to the library
          </Link>
        </Button>
      </main>
    </div>
  );
}