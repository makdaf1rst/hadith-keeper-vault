import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { fetchLibraryStats } from "@/lib/library-api";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Import & validation console — Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Administrator console for Jāmiʿ al-Kāmil: imported documents, spelling correction log and unresolved import issues.",
      },
      { property: "og:title", content: "Import & validation console — Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Track imported source documents, corrections and flagged issues.",
      },
    ],
  }),
  component: AdminPage,
});

function useTable(table: "import_documents" | "correction_log" | "import_issues", select: string) {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as Record<string, unknown>[];
    },
  });
}

function DataTable({
  rows,
  columns,
  empty,
}: {
  rows: Record<string, unknown>[] | undefined;
  columns: { key: string; label: string }[];
  empty: string;
}) {
  if (!rows?.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-border align-top">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2 whitespace-pre-wrap">
                  {row[column.key] == null ? "—" : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const stats = useQuery({ queryKey: ["library-stats"], queryFn: fetchLibraryStats });
  const documents = useTable(
    "import_documents",
    "file_name, book_number, hadith_range_start, hadith_range_end, hadith_count, status, created_at",
  );
  const corrections = useTable(
    "correction_log",
    "hadith_number, language, original_text, corrected_text, reason, created_at",
  );
  const issues = useTable(
    "import_issues",
    "hadith_number, issue_type, details, resolved, created_at",
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Library
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Import & validation console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.data
              ? `${stats.data.documents} source documents imported · ${stats.data.books} books · ${stats.data.hadiths} hadiths of 16,546`
              : "Loading library totals…"}
          </p>
        </div>

        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">Imported documents</TabsTrigger>
            <TabsTrigger value="corrections">Correction log</TabsTrigger>
            <TabsTrigger value="issues">Flagged issues</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <DataTable
              rows={documents.data}
              empty="No source documents have been imported yet."
              columns={[
                { key: "file_name", label: "File" },
                { key: "book_number", label: "Book" },
                { key: "hadith_range_start", label: "From" },
                { key: "hadith_range_end", label: "To" },
                { key: "hadith_count", label: "Hadiths" },
                { key: "status", label: "Status" },
              ]}
            />
          </TabsContent>

          <TabsContent value="corrections" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Every spelling correction is recorded with the original wording, so nothing is changed
              silently.
            </p>
            <DataTable
              rows={corrections.data}
              empty="No corrections have been recorded."
              columns={[
                { key: "hadith_number", label: "Hadith" },
                { key: "language", label: "Language" },
                { key: "original_text", label: "Original" },
                { key: "corrected_text", label: "Corrected" },
                { key: "reason", label: "Reason" },
              ]}
            />
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <DataTable
              rows={issues.data}
              empty="No import issues have been flagged."
              columns={[
                { key: "hadith_number", label: "Hadith" },
                { key: "issue_type", label: "Issue" },
                { key: "details", label: "Details" },
                { key: "resolved", label: "Resolved" },
              ]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
