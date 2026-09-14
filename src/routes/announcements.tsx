import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/library/PlaceholderPage";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:title", content: "Announcements — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <PlaceholderPage
      title="Announcements"
      description="Library announcements will be shared here. There are no announcements at present."
    />
  );
}