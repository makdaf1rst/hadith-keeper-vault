import { createFileRoute } from "@tanstack/react-router";

import { SearchPanel } from "@/components/library/SearchPanel";
import { useInterfaceText } from "@/lib/language";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Al-Jāmiʿ al-Kāmil" }] }),
  component: SearchPage,
});

// ponytail: Phase 1 just gives search its own tab; recent searches + filters sheet land in Phase 3
function SearchPage() {
  const t = useInterfaceText();
  return (
    <main className="mx-auto max-w-3xl px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-6">
      <h1 className="mb-4 font-sans text-3xl font-bold text-foreground">{t.search}</h1>
      <SearchPanel />
    </main>
  );
}
