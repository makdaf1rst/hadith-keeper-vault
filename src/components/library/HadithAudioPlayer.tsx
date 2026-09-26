"use client";

import { useQuery } from "@tanstack/react-query";
import { Headphones, Pause, Play, Square, SkipBack, SkipForward } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchBengaliTranslation } from "@/lib/bengali-translations";
import {
  fetchAdjacentHadithNumber,
  fetchHadithByNumber,
  fetchHadithContext,
  type Book,
  type Chapter,
  type Collection,
  type HadithFull,
} from "@/lib/library-api";
import { useLanguage } from "@/lib/language";

type StopAfter = "hadith" | "bab" | "collection" | "kitab" | "continuous";
type AudioLanguage = "en" | "bn";

type StoredSettings = {
  language: AudioLanguage;
  rate: number;
  stopAfter: StopAfter;
  voiceName: string | null;
};

type SessionState = {
  active: boolean;
  paused: boolean;
  currentNumber: number | null;
};

type Props = {
  hadith: HadithFull;
  englishText: string | null;
  context?: {
    book: Book | null;
    collection: Collection | null;
    chapter: Chapter | null;
  };
};

const SETTINGS_KEY = "jami-listen-settings.v1";
const SESSION_KEY = "jami-listen-session.v1";

function readSettings(fallbackLanguage: AudioLanguage): StoredSettings {
  if (typeof window === "undefined") {
    return { language: fallbackLanguage, rate: 1, stopAfter: "continuous", voiceName: null };
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<StoredSettings>;
    return {
      language: parsed.language === "bn" || parsed.language === "en" ? parsed.language : fallbackLanguage,
      rate: typeof parsed.rate === "number" && parsed.rate >= 0.75 && parsed.rate <= 2 ? parsed.rate : 1,
      stopAfter:
        parsed.stopAfter === "hadith" ||
        parsed.stopAfter === "bab" ||
        parsed.stopAfter === "collection" ||
        parsed.stopAfter === "kitab" ||
        parsed.stopAfter === "continuous"
          ? parsed.stopAfter
          : "continuous",
      voiceName: typeof parsed.voiceName === "string" ? parsed.voiceName : null,
    };
  } catch {
    return { language: fallbackLanguage, rate: 1, stopAfter: "continuous", voiceName: null };
  }
}

function readSession(): SessionState {
  if (typeof window === "undefined") return { active: false, paused: false, currentNumber: null };
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "{}") as Partial<SessionState>;
    return {
      active: parsed.active === true,
      paused: parsed.paused === true,
      currentNumber: typeof parsed.currentNumber === "number" ? parsed.currentNumber : null,
    };
  } catch {
    return { active: false, paused: false, currentNumber: null };
  }
}

function writeSession(state: SessionState) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }
}

function voiceScore(voice: SpeechSynthesisVoice, language: AudioLanguage) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (language === "bn") {
    if (voice.lang.toLowerCase().startsWith("bn-bd")) score += 80;
    else if (voice.lang.toLowerCase().startsWith("bn")) score += 60;
  } else {
    if (voice.lang.toLowerCase().startsWith("en-us")) score += 70;
    else if (voice.lang.toLowerCase().startsWith("en-gb")) score += 65;
    else if (voice.lang.toLowerCase().startsWith("en")) score += 50;
  }
  if (/natural|neural|enhanced|premium/.test(name)) score += 80;
  if (/google|microsoft|apple|samantha|daniel|ava|aria|jenny/.test(name)) score += 25;
  if (!voice.localService) score += 10;
  return score;
}

function normalizeForSpeech(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function HadithAudioPlayer({ hadith, englishText, context }: Props) {
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  const fallbackLanguage: AudioLanguage = contentLanguage === "bn" ? "bn" : "en";
  const [settings, setSettings] = useState<StoredSettings>(() => readSettings(fallbackLanguage));
  const [open, setOpen] = useState(() => readSession().active);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const autoStartedRef = useRef<number | null>(null);

  const bengali = useQuery({
    queryKey: ["bengali-hadith", hadith.hadith_number],
    queryFn: () => fetchBengaliTranslation(hadith.hadith_number),
    enabled: settings.language === "bn",
  });

  const speechText =
    settings.language === "bn" ? (bengali.data?.text ?? null) : englishText;

  const matchingVoices = useMemo(
    () =>
      voices
        .filter((voice) =>
          settings.language === "bn"
            ? voice.lang.toLowerCase().startsWith("bn")
            : voice.lang.toLowerCase().startsWith("en"),
        )
        .sort((a, b) => voiceScore(b, settings.language) - voiceScore(a, settings.language)),
    [voices, settings.language],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function nextHadith(direction: "previous" | "next") {
    return fetchAdjacentHadithNumber(hadith.hadith_number, direction);
  }

  async function shouldContinue(nextNumber: number) {
    if (settings.stopAfter === "continuous") return true;
    if (settings.stopAfter === "hadith") return false;

    const nextHadith = await fetchHadithByNumber(nextNumber);
    if (!nextHadith) return false;
    const nextContext = await fetchHadithContext(nextHadith);

    if (settings.stopAfter === "kitab") {
      return context?.book?.id != null && nextContext.book?.id === context.book.id;
    }
    if (settings.stopAfter === "collection") {
      return context?.collection?.id != null && nextContext.collection?.id === context.collection.id;
    }
    if (settings.stopAfter === "bab") {
      return context?.chapter?.id != null && nextContext.chapter?.id === context.chapter.id;
    }
    return false;
  }

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setPaused(false);
    writeSession({ active: false, paused: false, currentNumber: hadith.hadith_number });
  }

  function pauseOrResume() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      writeSession({ active: true, paused: false, currentNumber: hadith.hadith_number });
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
      writeSession({ active: true, paused: true, currentNumber: hadith.hadith_number });
    }
  }

  async function move(direction: "previous" | "next") {
    stop();
    const number = await nextHadith(direction);
    if (number == null) return;
    setOpen(true);
    writeSession({ active: true, paused: false, currentNumber: number });
    await navigate({ to: "/hadith/$number", params: { number: String(number) } });
  }

  function play() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio reading is not supported in this browser.");
      return;
    }
    if (!speechText?.trim()) {
      toast.error(settings.language === "bn" ? "No Bangla translation is available for this hadith." : "No English translation is available for this hadith.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(normalizeForSpeech(speechText));
    utterance.lang = settings.language === "bn" ? "bn-BD" : "en-US";
    utterance.rate = settings.rate;

    const selected =
      matchingVoices.find((voice) => voice.name === settings.voiceName) ?? matchingVoices[0];
    if (selected) utterance.voice = selected;

    utterance.onstart = () => {
      setPlaying(true);
      setPaused(false);
      setOpen(true);
      writeSession({ active: true, paused: false, currentNumber: hadith.hadith_number });
    };
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      setPlaying(false);
      setPaused(false);
      writeSession({ active: false, paused: false, currentNumber: hadith.hadith_number });
      toast.error("Audio reading stopped unexpectedly.");
    };
    utterance.onend = async () => {
      setPlaying(false);
      setPaused(false);
      const nextNumber = await nextHadith("next");
      if (nextNumber == null || !(await shouldContinue(nextNumber))) {
        writeSession({ active: false, paused: false, currentNumber: hadith.hadith_number });
        return;
      }
      writeSession({ active: true, paused: false, currentNumber: nextNumber });
      await navigate({ to: "/hadith/$number", params: { number: String(nextNumber) } });
    };

    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    const session = readSession();
    if (!session.active || session.paused) return;
    if (session.currentNumber !== hadith.hadith_number) return;
    if (!speechText?.trim()) return;
    if (autoStartedRef.current === hadith.hadith_number) return;
    autoStartedRef.current = hadith.hadith_number;
    const timer = window.setTimeout(play, 250);
    return () => window.clearTimeout(timer);
    // play intentionally omitted: this effect starts only once per routed hadith.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hadith.hadith_number, speechText]);

  const selectedVoice =
    matchingVoices.find((voice) => voice.name === settings.voiceName) ?? matchingVoices[0] ?? null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title={contentLanguage === "bn" ? "হাদিস শুনুন" : "Listen to hadith"}
      >
        <Headphones />
        {contentLanguage === "bn" ? "শুনুন" : "Listen"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value && !playing) return;
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {contentLanguage === "bn" ? "হাদিস অডিও" : "Hadith Listen Mode"} · {hadith.hadith_number}
            </DialogTitle>
            <DialogDescription>
              {contentLanguage === "bn"
                ? "ফ্রি ডিভাইস ভয়েস ব্যবহার করে বাংলা বা ইংরেজি অনুবাদ শুনুন।"
                : "Listen to the English or Bangla translation using your device's free voices."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{contentLanguage === "bn" ? "ভাষা" : "Language"}</span>
                <select
                  value={settings.language}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      language: event.target.value === "bn" ? "bn" : "en",
                      voiceName: null,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{contentLanguage === "bn" ? "গতি" : "Speed"}</span>
                <select
                  value={settings.rate}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, rate: Number(event.target.value) }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                >
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <option key={rate} value={rate}>{rate}×</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">{contentLanguage === "bn" ? "ভয়েস" : "Voice"}</span>
              <select
                value={selectedVoice?.name ?? ""}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, voiceName: event.target.value || null }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3"
              >
                {matchingVoices.length ? (
                  matchingVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                ) : (
                  <option value="">{settings.language === "bn" ? "Default Bangla voice" : "Default English voice"}</option>
                )}
              </select>
              <p className="text-xs text-muted-foreground">
                {contentLanguage === "bn"
                  ? "আপনার ফোনে থাকা সবচেয়ে স্বাভাবিক ভয়েসটি আগে দেখানো হয়।"
                  : "The most natural-looking voice available on your device is listed first."}
              </p>
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">{contentLanguage === "bn" ? "কখন থামবে" : "Stop after"}</span>
              <select
                value={settings.stopAfter}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, stopAfter: event.target.value as StopAfter }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="hadith">This hadith</option>
                <option value="bab">This Bāb</option>
                <option value="collection">This Collection</option>
                <option value="kitab">This Kitāb</option>
                <option value="continuous">Continuous</option>
              </select>
            </label>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button type="button" variant="outline" size="icon" onClick={() => move("previous")} title="Previous hadith">
                <SkipBack />
              </Button>
              {!playing ? (
                <Button type="button" size="lg" onClick={play} className="min-w-28">
                  <Play /> Play
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={pauseOrResume} className="min-w-28">
                  {paused ? <Play /> : <Pause />}
                  {paused ? "Resume" : "Pause"}
                </Button>
              )}
              <Button type="button" variant="outline" size="icon" onClick={() => move("next")} title="Next hadith">
                <SkipForward />
              </Button>
              <Button type="button" variant="destructive" size="icon" onClick={stop} title="Stop listening">
                <Square />
              </Button>
            </div>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Free browser/device voices vary by phone and browser. No hadith database content is changed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
