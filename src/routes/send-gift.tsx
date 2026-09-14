import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/library/PlaceholderPage";

export const Route = createFileRoute("/send-gift")({
  head: () => ({
    meta: [
      { title: "Send Gift — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content: "The future Send Gift page for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:title", content: "Send Gift — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "The future Send Gift page for the Al-Jāmiʿ al-Kāmil hadith library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SendGiftPage,
});

function SendGiftPage() {
  return (
    <PlaceholderPage
      title="Send Gift"
      description="This page is reserved for a future gifting option. No payment or gifting service is available yet."
    />
  );
}