import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";

const DUA_AR =
  "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ";

// Verbatim text supplied by the translator; do not reword.
const COPY = {
  en: {
    title: "Contributions & Acknowledgments",
    book: "Al-Jāmiʿ al-Kāmil",
    credits: [
      ["Original Compiler", "Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī"],
      ["Translation", "Sadman Zarif Talha"],
      ["Resources & Research Support", "Nafee Ibne Sajed"],
      ["Website & App Development", "Saqib Hossain"],
      ["Funding & Financial Support", "Ahsanul Zubair"],
    ],
    duaHeading: "A Humble Request for Duʿāʾ",
    paragraphs: [
      "This work has been undertaken solely for the sake of Allah, with the hope of making the teachings of the Messenger of Allah ﷺ accessible to people around the world.",
      "We humbly ask you to remember everyone involved in this project in your duʿāʾ and to share this work with others so that more people may benefit from it.",
      "May Allah accept our efforts, forgive our shortcomings, grant sincerity in our intentions, and make this project a source of continuous reward (Ṣadaqah Jāriyah) for everyone who contributed to it.",
    ],
    transliteration:
      "Rabbanā taqabbal minnā innaka anta as-Samīʿu al-ʿAlīm, wa tub ʿalaynā innaka anta at-Tawwābu ar-Raḥīm.",
    meaning:
      "“Our Lord, accept this from us. Indeed, You are the All-Hearing, the All-Knowing. And turn to us in mercy. Indeed, You are the Accepter of Repentance, the Most Merciful.”",
    amin: "Āmīn.",
    back: "Back to the library",
  },
  bn: {
    title: "অবদান ও কৃতজ্ঞতা স্বীকার",
    book: "আল-জামি‘ আল-কামিল",
    credits: [
      ["মূল সংকলক", "শাইখ যিয়াউর রহমান আল-আযমী"],
      ["অনুবাদ", "সাদমান জারিফ তালহা"],
      ["তথ্য ও গবেষণা সহায়তা", "নাফি ইবনে সাজেদ"],
      ["ওয়েবসাইট ও অ্যাপ ডেভেলপমেন্ট", "সাকিব হোসেন"],
      ["আর্থিক সহযোগিতা", "আহসানুল জুবায়ের"],
    ],
    duaHeading: "আপনাদের কাছে দোয়ার আবেদন",
    paragraphs: [
      "এই কাজটি শুধুমাত্র আল্লাহর সন্তুষ্টি অর্জনের উদ্দেশ্যে করা হয়েছে, যাতে রাসূলুল্লাহ ﷺ-এর হাদিস ও শিক্ষা বিশ্বের মানুষের কাছে আরও সহজে পৌঁছে দেওয়া যায়।",
      "আপনাদের কাছে আমাদের বিনীত অনুরোধ, এই প্রকল্পের সঙ্গে জড়িত সকলের জন্য দোয়া করবেন এবং আমাদের এই প্রচেষ্টাটি অন্যদের সঙ্গে শেয়ার করবেন, যাতে আরও বেশি মানুষ এর মাধ্যমে উপকৃত হতে পারেন।",
      "আল্লাহ যেন আমাদের এই ক্ষুদ্র প্রচেষ্টা কবুল করেন, আমাদের ভুলত্রুটি ক্ষমা করেন, আমাদের নিয়তকে একনিষ্ঠ রাখেন এবং এই কাজটিকে এর সঙ্গে সংশ্লিষ্ট সকলের জন্য সদকায়ে জারিয়ার মাধ্যম বানিয়ে দেন।",
    ],
    transliteration:
      "উচ্চারণ: রব্বানা তাকাব্বাল মিন্না, ইন্নাকা আনতাস সামীউল আলীম। ওয়া তুব আলাইনা, ইন্নাকা আনতাত তাওয়াবুর রাহীম।",
    meaning:
      "অর্থ: হে আমাদের রব! আমাদের পক্ষ থেকে কবুল করুন। নিশ্চয়ই আপনি সর্বশ্রোতা, সর্বজ্ঞ। আর আমাদের তাওবা কবুল করুন। নিশ্চয়ই আপনি তাওবা কবুলকারী, পরম দয়ালু।",
    amin: "আমীন।",
    back: "গ্রন্থাগারে ফিরে যান",
  },
} as const;

export const Route = createFileRoute("/acknowledgments")({
  head: () => ({
    meta: [
      { title: "Contributions & Acknowledgments — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "The people behind Al-Jāmiʿ al-Kāmil: compiled by Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī, translated by Sadman Zarif Talha, with research, development and funding support.",
      },
      { property: "og:title", content: "Contributions & Acknowledgments — Al-Jāmiʿ al-Kāmil" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://jami-al-kamil.com/acknowledgments" }],
  }),
  component: AcknowledgmentsPage,
});

function AcknowledgmentsPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const c = COPY[bn ? "bn" : "en"];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <HeartHandshake className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">{c.book}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-foreground">{c.title}</h1>

          <dl className="mt-8 space-y-5">
            {c.credits.map(([role, name]) => (
              <div key={role}>
                <dt className="font-sans text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {role}
                </dt>
                <dd className="mt-1 text-lg font-medium text-foreground">{name}</dd>
              </div>
            ))}
          </dl>

          <hr className="my-10 border-border" />

          <h2 className="text-2xl font-semibold text-foreground">{c.duaHeading}</h2>
          <div
            className={`mt-6 space-y-5 text-base leading-8 text-foreground/90 ${bn ? "" : "english-text"}`}
          >
            {c.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p lang="ar" dir="rtl" className="arabic-text py-2 text-2xl leading-loose text-foreground">
              {DUA_AR}
            </p>
            <p className="italic">{c.transliteration}</p>
            <p>{c.meaning}</p>
            <p className="font-semibold text-foreground">{c.amin}</p>
          </div>
        </div>

        <Button asChild variant="outline" className="mt-8">
          <Link to="/">
            <ArrowLeft aria-hidden />
            {c.back}
          </Link>
        </Button>
      </main>
    </div>
  );
}
