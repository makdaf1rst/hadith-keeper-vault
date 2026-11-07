import { Download, Loader2, Pause, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { WELCOME_CLOSED_EVENT } from "@/components/WelcomeTour";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AUDIO_BASE } from "@/lib/audio";
import { useLanguage, type ContentLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";
import {
  estimateSizes,
  getPlan,
  markPrompted,
  pauseOfflineDownload,
  removeOfflineText,
  resumeOfflineDownload,
  startOfflineDownload,
  supportsOffline,
  useOfflineLibrary,
  wasPrompted,
  type OfflinePlan,
} from "@/lib/offline-library";

type Sizes = { textMb: number; audioMb: number };

function formatSize(mb: number, bn: boolean) {
  const text = mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb} MB`;
  return bn ? toBengaliDigits(text) : text;
}

const audioName = (lang: ContentLanguage, bn: boolean) =>
  lang === "bn" ? (bn ? "বাংলা অডিও" : "Bengali audio") : bn ? "ইংরেজি অডিও" : "English audio";

function useSizes(enabled: boolean) {
  const [sizes, setSizes] = useState<Sizes | null>(null);
  useEffect(() => {
    if (!enabled) return;
    estimateSizes()
      .then(setSizes)
      .catch(() => setSizes(null));
  }, [enabled]);
  return sizes;
}

/**
 * Mounted once in the root layout. Picks up an unfinished download on launch, shows the
 * first-launch choice in the app (after the welcome tour), and toasts when a download ends.
 */
export function OfflinePrompt() {
  const { interfaceLanguage, contentLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const [open, setOpen] = useState(false);
  const sizes = useSizes(open);
  const state = useOfflineLibrary();
  const previous = useRef(state.kind);

  useEffect(() => {
    if (!supportsOffline()) return;
    resumeOfflineDownload();
    const onOnline = () => resumeOfflineDownload();
    window.addEventListener("online", onOnline);

    const maybeShow = () => {
      if (document.documentElement.classList.contains("app") && !wasPrompted() && !getPlan()) {
        setOpen(true);
      }
    };
    let tourSeen = false;
    try {
      tourSeen = localStorage.getItem("jami-welcome-seen") === "1";
    } catch {
      // storage blocked: the prompt can still be opened from Settings
    }
    if (tourSeen) maybeShow();
    window.addEventListener(WELCOME_CLOSED_EVENT, maybeShow);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener(WELCOME_CLOSED_EVENT, maybeShow);
    };
  }, []);

  useEffect(() => {
    const was = previous.current;
    previous.current = state.kind;
    if (was !== "running") return;
    if (state.kind === "done") {
      toast.success(
        bn
          ? "লাইব্রেরি সংরক্ষিত হয়েছে। ইন্টারনেট ছাড়াও ব্যবহার করা যাবে।"
          : "Library saved. It now works without internet.",
      );
    } else if (state.kind === "error") {
      toast.error(
        bn
          ? "ডাউনলোড থেমে গেছে। সংযোগ ফিরলে আবার শুরু হবে।"
          : `${state.message} It will continue when you're back online.`,
      );
    }
  }, [state, bn]);

  const choose = (plan: OfflinePlan | null) => {
    markPrompted();
    setOpen(false);
    if (!plan) return;
    void startOfflineDownload(plan);
    toast(
      bn
        ? "ডাউনলোড শুরু হয়েছে। অগ্রগতি সেটিংসে দেখুন।"
        : "Download started. You can follow it in Settings.",
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : choose(null))}>
      <DialogContent className="max-w-sm rounded-2xl font-sans">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Download className="size-7" aria-hidden />
          </span>
          <DialogTitle className="text-xl">
            {bn ? "অফলাইনে পড়ুন ও শুনুন" : "Read and listen offline"}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {bn
              ? "পুরো লাইব্রেরি এই ডিভাইসে সংরক্ষণ করে রাখুন, যাতে ভ্রমণে বা দুর্বল নেটওয়ার্কেও পড়া, খোঁজা ও শোনা যায়। ডাউনলোডে কিছুটা সময় লাগে, তাই অ্যাপ খোলা রাখুন; থেমে গেলে পরের বার যেখানে থেমেছিল সেখান থেকে চলবে।"
              : "Save the whole library to this device, so you can read, search, and listen on a flight, a trip, or anywhere the signal is weak. It takes a while, so keep the app open. If it stops, it picks up where it left off next time."}
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-2">
          {AUDIO_BASE ? (
            <Button onClick={() => choose({ audio: contentLanguage })}>
              <Download />
              {bn ? "লেখা ও " : "Text and "}
              {audioName(contentLanguage, bn)}
              {sizes
                ? ` (${bn ? "প্রায় " : "about "}${formatSize(sizes.textMb + sizes.audioMb, bn)})`
                : ""}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => choose({ audio: null })}>
            {bn ? "শুধু লেখা" : "Text only"}
            {sizes ? ` (${bn ? "প্রায় " : "about "}${formatSize(sizes.textMb, bn)})` : ""}
          </Button>
          <Button variant="ghost" onClick={() => choose(null)}>
            {bn ? "এখন নয় (পরে সেটিংস থেকে)" : "Not now (you can do it in Settings)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The "Offline library" block on the Settings page. */
export function OfflineLibrarySettings() {
  const { interfaceLanguage, contentLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";
  const state = useOfflineLibrary();
  const sizes = useSizes(true);
  const [plan, setPlan] = useState<OfflinePlan | null>(null);
  // browser-only checks run after mount so the server-rendered page hydrates cleanly
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => setSupported(supportsOffline()), []);
  useEffect(() => setPlan(getPlan()), [state.kind]);

  if (supported === null) return null;
  if (!supported) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        {bn
          ? "এই ব্রাউজারে অফলাইন সংরক্ষণ সম্ভব নয়।"
          : "This browser can't save the library for offline use."}
      </p>
    );
  }

  const n = (value: number) => (bn ? toBengaliDigits(String(value)) : String(value));
  const size = (mb: number) =>
    sizes ? ` (${bn ? "প্রায় " : "about "}${formatSize(mb, bn)})` : "";
  const audioLangs: ContentLanguage[] = contentLanguage === "bn" ? ["bn", "en"] : ["en", "bn"];

  const startButtons = (
    <div className="flex flex-col gap-2">
      {AUDIO_BASE
        ? audioLangs.map((lang) => (
            <Button
              key={lang}
              variant="outline"
              onClick={() => void startOfflineDownload({ audio: lang })}
            >
              <Download />
              {bn ? "লেখা ও " : "Text and "}
              {audioName(lang, bn)}
              {size((sizes?.textMb ?? 0) + (sizes?.audioMb ?? 0))}
            </Button>
          ))
        : null}
      <Button variant="outline" onClick={() => void startOfflineDownload({ audio: null })}>
        <Download />
        {bn ? "শুধু লেখা" : "Text only"}
        {size(sizes?.textMb ?? 0)}
      </Button>
    </div>
  );

  let body;
  if (state.kind === "running") {
    const label =
      state.stage === "text"
        ? bn
          ? "লেখা ও খোঁজার সূচি সংরক্ষণ হচ্ছে"
          : "Saving text and search"
        : bn
          ? "অডিও সংরক্ষণ হচ্ছে"
          : "Saving audio";
    const pct = state.total ? Math.floor((state.done / state.total) * 100) : 0;
    body = (
      <div className="flex flex-col gap-3" aria-live="polite">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {label}: {n(pct)}%
        </div>
        <progress className="h-1.5 w-full accent-primary" value={state.done} max={state.total} />
        <p className="text-xs text-muted-foreground">
          {bn
            ? "অ্যাপ খোলা রাখুন। বন্ধ করলে পরের বার যেখানে থেমেছিল সেখান থেকে চলবে।"
            : "Keep the app open. If you close it, it carries on from where it stopped next time."}
        </p>
        <Button variant="ghost" size="sm" className="self-start" onClick={pauseOfflineDownload}>
          <Pause /> {bn ? "বিরতি" : "Pause"}
        </Button>
      </div>
    );
  } else if (plan) {
    const status =
      state.kind === "done"
        ? bn
          ? `সংরক্ষিত: লেখা${plan.audio ? ` ও ${audioName(plan.audio, true)}` : ""}। ইন্টারনেট ছাড়াও কাজ করবে।`
          : `Saved: text${plan.audio ? ` and ${audioName(plan.audio, false)}` : ""}. Works without internet.`
        : state.kind === "error"
          ? state.message
          : state.kind === "paused"
            ? bn
              ? "ডাউনলোড বিরতিতে আছে।"
              : "Download paused."
            : bn
              ? "সংরক্ষিত লাইব্রেরি পরীক্ষা করা হচ্ছে…"
              : "Checking the saved library…";
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm">{status}</p>
        <div className="flex flex-wrap gap-2">
          {state.kind !== "done" ? (
            <Button size="sm" onClick={() => void startOfflineDownload(plan)}>
              <Download /> {bn ? "চালিয়ে যান" : "Resume"}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => void removeOfflineText()}>
            <Trash2 /> {bn ? "সংরক্ষিত লেখা মুছুন" : "Remove saved text"}
          </Button>
        </div>
        {plan.audio ? (
          <p className="text-xs text-muted-foreground">
            {bn
              ? "সংরক্ষিত অডিও প্রতিটি কিতাবের পাতা থেকে মুছতে পারবেন।"
              : "Saved audio can be removed from each book's page."}
          </p>
        ) : null}
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {bn
            ? "পুরো লাইব্রেরি এই ডিভাইসে সংরক্ষণ করুন, যাতে ইন্টারনেট ছাড়াও পড়া, খোঁজা ও শোনা যায়।"
            : "Save the whole library on this device so you can read, search, and listen with no internet."}
        </p>
        {startButtons}
      </div>
    );
  }

  return <li className="px-4 py-4">{body}</li>;
}
