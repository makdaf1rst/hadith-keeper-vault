import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/library/PlaceholderPage";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library.",
      },
      { property: "og:title", content: "Other Projects — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Other scholarly projects connected with the Al-Jāmiʿ al-Kāmil library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Other Projects"
      description="Information about other scholarly projects will be added here."
    />
  );
}