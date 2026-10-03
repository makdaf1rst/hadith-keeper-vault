import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Al-Jāmiʿ al-Kāmil has no accounts and collects no personal data. Bookmarks, reading history, and settings stay on your device.",
      },
      { property: "og:title", content: "Privacy Policy — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content:
          "No accounts, no tracking. Your bookmarks, reading history, and settings are stored only on your own device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            {bn ? "আল-জামি আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-foreground">
            {bn ? "গোপনীয়তা নীতি" : "Privacy Policy"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bn ? "কার্যকরের তারিখ: ৩ অক্টোবর ২০২৬" : "Effective date: October 3, 2026"}
          </p>

          {bn ? (
            <div className="mt-6 space-y-5 text-base leading-8 text-foreground/90">
              <p>
                আল-জামি‘ আল-কামিল এমনভাবে তৈরি করা হয়েছে যাতে আপনার কোনো ব্যক্তিগত তথ্যের প্রয়োজনই
                না হয়। এই পৃষ্ঠায় ব্যাখ্যা করা হলো আপনার তথ্য কীভাবে ব্যবহৃত হয় — এবং কীভাবে
                ব্যবহৃত হয় না।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                কোনো অ্যাকাউন্ট নেই, কোনো তথ্য সংগ্রহ নেই
              </h2>
              <p>
                এই ওয়েবসাইটে কোনো সাইন-ইন বা অ্যাকাউন্ট ব্যবস্থা নেই। আমরা আপনার নাম, ইমেইল ঠিকানা,
                ফোন নম্বর বা অন্য কোনো ব্যক্তিগত তথ্য চাই না, সংগ্রহ করি না বা সংরক্ষণ করি না। কোনো
                বিজ্ঞাপন, বিশ্লেষণ (অ্যানালিটিক্স) বা ট্র্যাকিং সেবাও এখানে ব্যবহৃত হয় না।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                আপনার তথ্য থাকে আপনার ডিভাইসেই
              </h2>
              <p>
                আপনার বুকমার্ক, পঠন-ইতিহাস (সর্বশেষ পড়া হাদিস), ভাষা ও পাঠ-সেটিংস — সবকিছু
                শুধুমাত্র আপনার ডিভাইসের স্থানীয় স্টোরেজে (local storage) সংরক্ষিত থাকে। এই তথ্য
                কখনো আমাদের সার্ভারে পাঠানো হয় না এবং আপনি ছাড়া অন্য কেউ এটি দেখতে পায় না।
              </p>
              <p>
                আপনার ব্রাউজার বা অ্যাপের সাইট ডেটা মুছে ফেললে এই তথ্যগুলো সম্পূর্ণরূপে মুছে যায়।
                যেহেতু তথ্য আপনার ডিভাইসে থাকে, ডিভাইস বদলালে বা ডেটা মুছলে তা ফিরিয়ে আনার একমাত্র
                উপায় হলো ব্যাকআপ ফাইল।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                ব্যাকআপ ও পুনরুদ্ধার ফাইল
              </h2>
              <p>
                আপনি চাইলে Bookmarks পৃষ্ঠা থেকে আপনার বুকমার্কের একটি ব্যাকআপ ফাইল (JSON) তৈরি করতে
                পারেন এবং অন্য যেকোনো ডিভাইসে তা পুনরুদ্ধার করতে পারেন। এই ফাইলটি শুধুমাত্র আপনার
                অনুরোধে, আপনার ডিভাইসেই তৈরি হয়। ফাইলটি আপনি যেখানে খুশি রাখতে পারেন — ওয়েবসাইট
                আপনার Files, iCloud, Google Drive বা অন্য কোনো স্টোরেজে প্রবেশ করে না।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">সার্ভার লগ</h2>
              <p>
                পৃষ্ঠাগুলো আপনার ডিভাইসে পৌঁছে দিতে আমাদের হোস্টিং প্রদানকারী স্বাভাবিক প্রযুক্তিগত
                লগ (যেমন আইপি ঠিকানা, ব্রাউজারের ধরন ও অনুরোধের সময়) প্রক্রিয়া করে। এগুলো
                নিরাপত্তা ও সেবা পরিচালনার প্রয়োজনেই ব্যবহৃত হয় এবং কোনো ব্যক্তিকে চিহ্নিত করতে
                ব্যবহার করা হয় না।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                আমাদের সঙ্গে যোগাযোগ করলে
              </h2>
              <p>
                আপনি যদি আমাদের ইমেইল করেন, তাহলে উত্তর দেওয়ার জন্য আপনার ইমেইল ঠিকানা ও বার্তার
                বিষয়বস্তু আমরা দেখতে পাই। এই ঠিকানা শুধুমাত্র আপনার বার্তার উত্তর দিতে ব্যবহৃত হয়;
                কোনো তালিকায় যোগ করা হয় না বা অন্য কারো সঙ্গে ভাগ করা হয় না।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">শিশুদের গোপনীয়তা</h2>
              <p>
                যেহেতু আমরা কোনো ব্যক্তিগত তথ্য সংগ্রহ করি না, তাই এই সাইট সব বয়সের পাঠকের জন্য
                নিরাপদে ব্যবহারযোগ্য।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">এই নীতির পরিবর্তন</h2>
              <p>
                এই নীতিতে কোনো পরিবর্তন হলে তা এই পৃষ্ঠায় প্রকাশ করা হবে এবং উপরের কার্যকরের তারিখ
                হালনাগাদ করা হবে।
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">যোগাযোগ</h2>
              <p>
                গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের লিখুন:{" "}
                <a
                  href="mailto:Aljamiushshamil@gmail.com"
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Aljamiushshamil@gmail.com
                </a>
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5 english-text text-base leading-8 text-foreground/90">
              <p>
                Al-Jāmiʿ al-Kāmil is built so that it never needs your personal information. This
                page explains what happens with your data — and what does not.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                No accounts, no data collection
              </h2>
              <p>
                This website has no sign-in and no account system. We do not ask for, collect, or
                store your name, email address, phone number, or any other personal information.
                There is no advertising, analytics, or tracking of any kind on this site.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                Your data stays on your device
              </h2>
              <p>
                Your bookmarks, reading history (recently read hadiths), language preference, and
                reading settings are stored only in your device's local storage. This information is
                never sent to our servers and is not visible to anyone but you.
              </p>
              <p>
                Clearing your browser or app site data removes all of it permanently. Because the
                data lives on your device, the only way to move it to a new device — or to recover
                it after clearing — is a backup file.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">
                Backup and restore files
              </h2>
              <p>
                You can create a backup file (JSON) of your bookmarks from the Bookmarks page and
                restore it on any other device. The file is created on your device only when you ask
                for it, and you choose where to keep it. The website does not access your Files,
                iCloud, Google Drive, or any other storage account.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">Server logs</h2>
              <p>
                To deliver pages to your device, our hosting provider processes standard technical
                logs (such as IP address, browser type, and time of request). These are used only to
                operate and secure the service and are not used to identify you.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">If you contact us</h2>
              <p>
                If you email us, we receive your email address and the contents of your message so
                that we can reply. Your address is used only to respond to you — it is never added
                to a mailing list or shared with anyone.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">Children's privacy</h2>
              <p>
                Because we collect no personal information at all, the site is safe for readers of
                any age to use.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">Changes to this policy</h2>
              <p>
                If this policy ever changes, the updated version will be published on this page with
                a revised effective date above.
              </p>

              <h2 className="pt-2 text-xl font-semibold text-foreground">Contact</h2>
              <p>
                For any privacy questions, write to us at:{" "}
                <a
                  href="mailto:Aljamiushshamil@gmail.com"
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Aljamiushshamil@gmail.com
                </a>
              </p>
            </div>
          )}
        </div>

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
