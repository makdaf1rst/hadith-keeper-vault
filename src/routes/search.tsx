import { createFileRoute } from "@tanstack/react-router";

import { SearchPanel } from "@/components/library/SearchPanel";
import { useInterfaceText } from "@/lib/language";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Al-Jāmiʿ al-Kāmil" }] }),
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    const q = search["q"];
    return typeof q === "string" && q.trim() ? { q: q.slice(0, 200) } : {};
  },
  component: SearchPage,
});

function SearchPage() {
  const t = useInterfaceText();
  const { q } = Route.useSearch();
  return (
    <main className="mx-auto max-w-3xl px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-6 web:pt-12 sm:web:pt-16">
      <h1 className="mb-4 font-sans text-3xl font-bold text-foreground web:mb-6 web:text-center web:text-4xl web:tracking-tight">
        {t.search}
      </h1>
      <SearchPanel key={q} initialQuery={q} />
    </main>
  );
}
