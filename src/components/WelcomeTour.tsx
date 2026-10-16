import { useEffect, useState } from "react";
import { Bookmark, Download, Library, Search, Settings } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language";

const SEEN_KEY = "jami-welcome-seen";
export const SHOW_WELCOME_EVENT = "jami-show-welcome";

const STEPS = [
  {
    icon: Library,
    en: [
      "Welcome to Jāmiʿ al-Kāmil",
      "16,546 narrations across 66 books, in Arabic with English and Bengali translation. Open any book from the Library tab.",
    ],
    bn: [
      "জামি আল-কামিলে স্বাগতম",
      "৬৬টি কিতাবে ১৬,৫৪৬টি হাদিস, আরবি মূল পাঠ সহ ইংরেজি ও বাংলা অনুবাদ। লাইব্রেরি ট্যাব থেকে যেকোনো কিতাব খুলুন।",
    ],
  },
  {
    icon: Search,
    en: [
      "Search everything",
      "Search by word or phrase across the whole collection, in Arabic, English or Bengali.",
    ],
    bn: ["সবকিছু খুঁজুন", "শব্দ বা বাক্যাংশ দিয়ে পুরো সংকলনে খুঁজুন, আরবি, ইংরেজি বা বাংলায়।"],
  },
  {
    icon: Bookmark,
    en: [
      "Bookmark what matters",
      "Tap the bookmark icon on any hadith to save it. They stay on your device, and you can back them up or restore them from the Bookmarks tab.",
    ],
    bn: [
      "গুরুত্বপূর্ণ হাদিস সংরক্ষণ করুন",
      "যেকোনো হাদিসের বুকমার্ক আইকনে চাপ দিয়ে সংরক্ষণ করুন। এগুলো আপনার ডিভাইসেই থাকে, এবং বুকমার্ক ট্যাব থেকে ব্যাকআপ বা রিস্টোর করতে পারবেন।",
    ],
  },
  {
    icon: Download,
    en: [
      "Read offline",
      "Go to Settings → Downloads to save books and read without an internet connection.",
    ],
    bn: ["অফলাইনে পড়ুন", "ইন্টারনেট ছাড়া পড়তে সেটিংস → ডাউনলোড থেকে কিতাব সংরক্ষণ করুন।"],
  },
  {
    icon: Settings,
    en: [
      "Make it yours",
      "In Settings, pick a reading theme (or follow your device) and switch the interface language. You can replay this tour there too.",
    ],
    bn: [
      "নিজের মতো সাজান",
      "সেটিংসে পড়ার থিম বেছে নিন (বা ডিভাইসের থিম অনুসরণ করুন) এবং ভাষা বদলান। এই পরিচিতি সেখান থেকে আবার দেখতে পারবেন।",
    ],
  },
] as const;

// App-only first-launch tour; Settings can replay it via SHOW_WELCOME_EVENT.
export function WelcomeTour() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const show = () => {
      setStep(0);
      setOpen(true);
    };
    try {
      if (document.documentElement.classList.contains("app") && !localStorage.getItem(SEEN_KEY))
        show();
    } catch {
      // storage blocked: skip the tour rather than show it every launch
    }
    window.addEventListener(SHOW_WELCOME_EVENT, show);
    return () => window.removeEventListener(SHOW_WELCOME_EVENT, show);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // private mode: fine, tour just reappears next launch
    }
  };

  const current = STEPS[step]!;
  const [title, body] = bn ? current.bn : current.en;
  const Icon = current.icon;
  const last = step === STEPS.length - 1;
  const btn =
    "rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent className="max-w-sm rounded-2xl font-sans">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Icon className="size-7" aria-hidden />
          </span>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">{body}</DialogDescription>
        </div>

        <div className="flex justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button type="button" className={`${btn} text-muted-foreground`} onClick={close}>
            {bn ? "এড়িয়ে যান" : "Skip"}
          </button>
          <button
            type="button"
            className={`${btn} bg-primary text-primary-foreground`}
            onClick={() => (last ? close() : setStep(step + 1))}
          >
            {last ? (bn ? "শুরু করুন" : "Get started") : bn ? "পরবর্তী" : "Next"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
