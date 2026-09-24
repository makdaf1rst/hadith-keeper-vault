import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Al-Jāmiʿ al-Kāmil" },
      { name: "description", content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library." },
      { property: "og:title", content: "Announcements — Al-Jāmiʿ al-Kāmil" },
      { property: "og:description", content: "Announcements for the Al-Jāmiʿ al-Kāmil hadith library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Library className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            {bn ? "আল-জামি আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold text-foreground">{bn ? "ঘোষণা" : "Announcements"}</h1>

        <article className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {bn ? "একটি আন্তরিক অনুরোধ" : "A Sincere Request"}
          </h2>

          {bn ? (
            <div className="mt-5 space-y-5 text-base leading-7 text-muted-foreground">
              <p>
                অনুগ্রহ করে এই গ্রন্থাগারটি <strong className="text-foreground">সুন্নাহ অধ্যয়ন, তা থেকে উপকৃত হওয়া, শিক্ষা দেওয়া এবং এই জ্ঞান অন্যদের মাঝে ছড়িয়ে দেওয়ার জন্য</strong> ব্যবহার করুন।
              </p>
              <p>
                তবে আল্লাহর সন্তুষ্টির জন্য আমরা আন্তরিকভাবে অনুরোধ করছি, <strong className="text-foreground">এই কাজকে ব্যবসা বা দুনিয়াবি লাভের মাধ্যম বানাবেন না</strong>। রাসূলুল্লাহ ﷺ-এর জ্ঞানকে সেবা করা এবং হিদায়াতপ্রত্যাশী মানুষের কাছে তা সহজলভ্য করার বিনীত প্রচেষ্টা হিসেবে এই প্রকল্প প্রস্তুত করা হয়েছে।
              </p>
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
                <p className="font-medium text-foreground">
                  “আর আমার আয়াতসমূহের বিনিময়ে সামান্য মূল্য গ্রহণ করো না এবং কেবল আমাকেই ভয় করো।”
                </p>
                <p className="mt-2 text-sm">কুরআন ২:৪১</p>
              </div>
              <p>আর রাসূলুল্লাহ ﷺ সতর্ক করেছেন:</p>
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
                <p className="font-medium text-foreground">
                  “যে ব্যক্তি এমন জ্ঞান অর্জন করে যার দ্বারা আল্লাহর সন্তুষ্টি কামনা করা হয়, কিন্তু তা কেবল দুনিয়াবি কোনো লাভ অর্জনের জন্য শেখে, সে কিয়ামতের দিন জান্নাতের সুগন্ধও পাবে না।”
                </p>
                <p className="mt-2 text-sm">সুনান আবী দাউদ ৩৬৬৪</p>
              </div>
              <p>
                তাই অনুগ্রহ করে <strong className="text-foreground">এটি পড়ুন, অধ্যয়ন করুন, শেয়ার করুন, শিক্ষা দিন এবং বিনামূল্যে ছড়িয়ে দিন</strong>; কিন্তু এই প্রচেষ্টাকে দুনিয়াবি ব্যবসা বা ব্যক্তিগত লাভের মাধ্যম বানাবেন না।
              </p>
              <p>
                আল্লাহ এই কাজকে একান্তভাবে তাঁর সন্তুষ্টির জন্য কবুল করুন, উম্মাহর জন্য উপকারী করুন, সহীহ জ্ঞান প্রচারে যারা সহযোগিতা করেন তাদের সবাইকে প্রতিদান দিন এবং আখিরাতের বিনিময়ে দুনিয়ার লাভ অন্বেষণ করা থেকে আমাদের রক্ষা করুন। <strong className="text-foreground">আমীন।</strong>
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5 text-base leading-7 text-muted-foreground">
              <p>Please use this library to <strong className="text-foreground">study the Sunnah, benefit from it, teach it, and spread this knowledge to others</strong>.</p>
              <p>But we sincerely ask you, <strong className="text-foreground">for the sake of Allah, not to use this work as a means of business or worldly profit</strong>. This project was prepared as a humble effort to serve the knowledge of the Messenger of Allah ﷺ and to make it accessible to people seeking guidance.</p>
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
                <p className="font-medium text-foreground">“And do not exchange My signs for a small price, and fear Me alone.”</p>
                <p className="mt-2 text-sm">Qur’an 2:41</p>
              </div>
              <p>And the Messenger of Allah ﷺ warned:</p>
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-5 py-4">
                <p className="font-medium text-foreground">“Whoever acquires knowledge by which the pleasure of Allah is sought, but acquires it only to gain some worldly advantage, will not smell the fragrance of Paradise on the Day of Resurrection.”</p>
                <p className="mt-2 text-sm">Sunan Abī Dāwūd 3664</p>
              </div>
              <p>So please <strong className="text-foreground">read it, study it, share it, teach from it, and spread it freely</strong>, but do not turn this effort into a means of worldly business or personal profit.</p>
              <p>May Allah make this work sincerely for His sake, allow it to benefit the Ummah, reward everyone who helps spread authentic knowledge, and protect us from seeking the Hereafter through the gains of this world. <strong className="text-foreground">Āmīn.</strong></p>
            </div>
          )}
        </article>

        <Button asChild variant="outline" className="mt-8">
          <Link to="/">
            <ArrowLeft aria-hidden />
            {bn ? "গ্রন্থাগারে ফিরে যান" : "Back to the library"}
          </Link>
        </Button>
      </main>
    </div>
  );
}
