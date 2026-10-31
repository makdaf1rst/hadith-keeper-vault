import { useQuery } from "@tanstack/react-query";
import { Download, Headphones, Loader2, Pause, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { playHadith, usePlayer } from "@/components/library/AudioDock";
import { Button } from "@/components/ui/button";
import { AUDIO_BASE, MB_PER_HADITH, isBookSaved, removeBook, saveBook } from "@/lib/audio";
import { fetchBookHadiths } from "@/lib/library-api";
import { useLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";

/** Starts this hadith in the bottom player, or pauses/resumes it when it's the one playing. */
export function ListenButton({ number, className }: { number: number; className?: string }) {
  const { contentLanguage } = useLanguage();
  const { track, paused } = usePlayer();
  if (!AUDIO_BASE) return null;
  const playing = !paused && track?.n === number && track.lang === contentLanguage;
  const bn = contentLanguage === "bn";
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      aria-label={playing ? (bn ? "থামান" : "Pause") : bn ? "শুনুন" : "Listen"}
      aria-pressed={playing}
      onClick={() => playHadith(number, contentLanguage)}
    >
      {playing ? <Pause /> : <Headphones />}
    </Button>
  );
}

type Phase = { kind: "idle" | "saved" } | { kind: "saving"; done: number; total: number };

export function BookAudioDownload({ bookId, bookNumber }: { bookId: string; bookNumber: number }) {
  const { contentLanguage: lang } = useLanguage();
  const bn = lang === "bn";
  const n = (value: number) => (bn ? toBengaliDigits(value) : String(value));
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const abort = useRef<AbortController | null>(null);
  const hadiths = useQuery({
    queryKey: ["book-hadiths", bookId],
    queryFn: () => fetchBookHadiths(bookId),
    enabled: !!AUDIO_BASE,
  });
  const numbers = (hadiths.data ?? []).map((h) => h.hadith_number);

  useEffect(
    () => setPhase({ kind: isBookSaved(bookNumber, lang) ? "saved" : "idle" }),
    [bookNumber, lang],
  );
  useEffect(() => () => abort.current?.abort(), []);

  if (!AUDIO_BASE || !numbers.length) return null;
  const mb = Math.ceil(numbers.length * MB_PER_HADITH);

  async function start() {
    abort.current = new AbortController();
    setPhase({ kind: "saving", done: 0, total: numbers.length });
    try {
      await saveBook(
        bookNumber,
        numbers,
        lang,
        (done, total) => setPhase({ kind: "saving", done, total }),
        abort.current.signal,
      );
      setPhase({ kind: "saved" });
      toast.success(
        bn ? "অডিও সংরক্ষিত হয়েছে, অফলাইনেও শোনা যাবে।" : "Audio saved. You can listen offline.",
      );
    } catch (error) {
      setPhase({ kind: "idle" });
      if (abort.current.signal.aborted) return;
      toast.error(error instanceof Error ? error.message : "Download failed. Tap again to resume.");
    }
  }

  async function remove() {
    await removeBook(bookNumber, numbers, lang);
    setPhase({ kind: "idle" });
    toast.success(bn ? "অডিও মুছে ফেলা হয়েছে।" : "Saved audio removed.");
  }

  if (phase.kind === "saving") {
    return (
      <div
        className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" />
        {bn
          ? `অডিও ডাউনলোড হচ্ছে: ${n(phase.done)} / ${n(phase.total)}`
          : `Downloading audio: ${phase.done} of ${phase.total}`}
        <progress className="h-1.5 w-32 accent-primary" value={phase.done} max={phase.total} />
        <Button variant="ghost" size="sm" onClick={() => abort.current?.abort()}>
          <X /> {bn ? "বাতিল" : "Cancel"}
        </Button>
      </div>
    );
  }

  if (phase.kind === "saved") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Headphones className="size-4" />
        {bn ? "এই কিতাবের অডিও অফলাইনের জন্য সংরক্ষিত" : "Audio saved for offline listening"}
        <Button variant="ghost" size="sm" onClick={() => void remove()}>
          <Trash2 /> {bn ? `মুছুন (${n(mb)} MB)` : `Remove (${mb} MB)`}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void start()}>
      <Download />
      {bn
        ? `এই কিতাবের অডিও ডাউনলোড করুন (প্রায় ${n(mb)} MB)`
        : `Download this book's audio (about ${mb} MB)`}
    </Button>
  );
}
