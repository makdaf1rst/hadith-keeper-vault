import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language";

// Set IOS to the App Store link once the app is approved; the button and iPhone popup appear on their own.
const STORE_LINKS = {
  android: "https://play.google.com/store/apps/details?id=com.jamialkamil.app",
  ios: "https://apps.apple.com/us/app/jami-al-kamil-hadith-library/id6818915205",
};

const DISMISSED_KEY = "jami-get-app-dismissed";

type Platform = keyof typeof STORE_LINKS;

const inApp = () => document.documentElement.classList.contains("app");

function mobilePlatform(): Platform | null {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  // iPadOS reports as Mac, so also check for touch
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
    return "ios";
  return null;
}

function StoreButton({ platform, bn }: { platform: Platform; bn: boolean }) {
  const href = STORE_LINKS[platform];
  if (!href) return null;
  if (platform === "android") {
    // Google's official badge (play.google.com/intl/en_us/badges), transparent padding trimmed
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="self-center rounded-lg">
        <img
          src={`/google-play-badge-${bn ? "bn" : "en"}.png`}
          alt={bn ? "Google Play থেকে নিন" : "Get it on Google Play"}
          width={568}
          height={172}
          className="h-14 w-auto"
        />
      </a>
    );
  }
  // ponytail: swap for Apple's official badge when STORE_LINKS.ios is set
  const label = bn ? "App Store থেকে নিন" : "Download on the App Store";
  return (
    <Button asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Smartphone />
        {label}
      </a>
    </Button>
  );
}

/** Store buttons for the Downloads page. Hidden inside the app itself. */
export function GetTheAppButtons() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  // checked after mount so the server-rendered page hydrates cleanly
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!inApp()), []);
  if (!show) return null;
  return (
    <section className="mt-6 rounded-xl border border-gold/40 bg-parchment p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{bn ? "অ্যাপটি নিন" : "Get the App"}</h2>
      <p className="mt-1 text-muted-foreground">
        {bn ? "ফোনে পড়ুন ও শুনুন, অফলাইনেও।" : "Read and listen on your phone, offline too."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StoreButton platform="android" bn={bn} />
        <StoreButton platform="ios" bn={bn} />
      </div>
    </section>
  );
}

/** Mounted once in the root layout: one-time popup on a phone browser whose store link exists. */
export function GetTheAppPrompt() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    if (inApp()) return;
    const p = mobilePlatform();
    if (!p || !STORE_LINKS[p]) return;
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      return; // storage blocked: don't nag on every page
    }
    setPlatform(p);
  }, []);

  const close = () => {
    setPlatform(null);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // private mode: it can show again next visit
    }
  };

  return (
    <Dialog open={platform !== null} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-sm rounded-2xl font-sans">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Smartphone className="size-7" aria-hidden />
          </span>
          <DialogTitle className="text-xl">{bn ? "অ্যাপটি নিন" : "Get the app"}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {bn
              ? "জামিউল কামিল অ্যাপে আরও সহজে পড়ুন ও শুনুন, ইন্টারনেট ছাড়াও।"
              : "Read and listen more easily in the Jāmiʿ al-Kāmil app, even without internet."}
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-2" onClick={close}>
          {platform ? <StoreButton platform={platform} bn={bn} /> : null}
          <Button variant="ghost">{bn ? "এখন নয়" : "Not now"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
