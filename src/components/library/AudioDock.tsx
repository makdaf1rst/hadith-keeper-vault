import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chapterAudioUrl, nextTrack, playableSrc, type AudioTrack } from "@/lib/audio";
import type { ContentLanguage } from "@/lib/language";
import { toBengaliDigits } from "@/lib/normalize";

/**
 * One <audio> element for the whole app, shown as a floating glass pill above the page.
 * Playback survives navigation, and because it's the same element the browser keeps
 * allowing auto-advance after the first tap.
 */
type Track = AudioTrack;
type State = { track: Track | null; paused: boolean };

const GAP_MS = 1000; // silence between one hadith and the next
const SEEK_S = 10;
const MAX_SKIPS = 3; // hadiths in a row with no narration before giving up
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SPEED_KEY = "jk-audio-speed";

let state: State = { track: null, paused: true };
let el: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

export const usePlayer = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

function toggle() {
  if (!el) return;
  if (el.paused) el.play().catch(() => {});
  else el.pause();
}

/** Starts this hadith in the dock, or pauses/resumes it if it's already the one loaded. */
export function playHadith(n: number, lang: ContentLanguage) {
  if (state.track?.n === n && state.track.lang === lang && !state.track.chapter) toggle();
  else set({ track: { n, lang, dir: 1 } });
}

/** Starts this chapter clip, or pauses/resumes it if it's already loaded. */
export function playChapter(id: string, firstHadith: number, lang: ContentLanguage) {
  if (state.track?.chapter === id && state.track.lang === lang) toggle();
  else set({ track: { n: firstHadith, lang, dir: 1, chapter: id } });
}

function step(dir: 1 | -1) {
  const t = state.track;
  if (!t) return;
  const track = nextTrack(t, dir);
  if (track) set({ track });
}

function seek(by: number) {
  if (el) el.currentTime = Math.max(0, el.currentTime + by); // the browser clamps the end
}

function readSpeed() {
  try {
    const v = Number(localStorage.getItem(SPEED_KEY));
    return SPEEDS.includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

const clock = (s: number, bn: boolean) => {
  const v = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return bn ? toBengaliDigits(v) : v;
};

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35 [&_svg]:size-[18px]";

export function AudioDock() {
  const { track, paused } = usePlayer();
  const ref = useRef<HTMLAudioElement>(null);
  const gap = useRef<number | undefined>(undefined);
  const skips = useRef(0);
  const followed = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    el = ref.current;
    setSpeed(readSpeed());
    // lock screen / headphone controls; browsers without an action throw, so each is guarded
    const actions: [MediaSessionAction, () => void][] = [
      ["play", toggle],
      ["pause", toggle],
      ["seekbackward", () => seek(-SEEK_S)],
      ["seekforward", () => seek(SEEK_S)],
      ["previoustrack", () => step(-1)],
      ["nexttrack", () => step(1)],
    ];
    for (const [action, handler] of actions) {
      try {
        navigator.mediaSession?.setActionHandler(action, handler);
      } catch {
        // unsupported action
      }
    }
    return () => {
      el = null;
    };
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  // Load and play whenever the track changes.
  useEffect(() => {
    window.clearTimeout(gap.current);
    const audio = ref.current;
    if (!audio || !track) return;
    let live = true;
    let blob = "";
    setTime(0);
    setDuration(0);
    const source = track.chapter
      ? Promise.resolve(chapterAudioUrl(track.chapter, track.lang))
      : playableSrc(track.n, track.lang);
    void source.then((src) => {
      if (src.startsWith("blob:")) blob = src;
      if (!live) return void (blob && URL.revokeObjectURL(blob));
      audio.src = src;
      audio.playbackRate = speed;
      audio.play().catch(() => {}); // autoplay blocked: stays paused, the play button resumes
    });
    if ("mediaSession" in navigator && typeof MediaMetadata !== "undefined") {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.chapter
          ? track.lang === "bn"
            ? "অধ্যায়ের ভূমিকা"
            : "Chapter introduction"
          : track.lang === "bn"
            ? `হাদিস ${toBengaliDigits(track.n)}`
            : `Hadith ${track.n}`,
        artist: "Al-Jāmiʿ al-Kāmil",
      });
    }
    return () => {
      live = false;
      if (blob) URL.revokeObjectURL(blob);
    };
    // speed is applied separately; reloading the track on a speed change would restart it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // If the reader is on the page of the hadith that just finished, the page follows along.
  useEffect(() => {
    const prev = followed.current;
    followed.current = track?.n ?? null;
    if (track && prev != null && prev !== track.n && pathname === `/hadith/${prev}`) {
      void navigate({ to: "/hadith/$number", params: { number: String(track.n) } });
    }
    // pathname is read, not watched: moving to another page must not trigger a jump
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  function onEnded() {
    // A locked phone can suspend the page once audio stops, and the timer would never fire.
    if (document.hidden) step(1);
    else gap.current = window.setTimeout(() => step(1), GAP_MS);
  }

  function onError() {
    const t = state.track;
    if (!t) return;
    if (t.chapter) {
      set({ track: { n: t.n, lang: t.lang, dir: 1 } });
      return;
    }
    // ponytail: a media error can't tell "no narration" (404) from offline; both skip, then stop
    if (++skips.current > MAX_SKIPS) {
      skips.current = 0;
      el?.pause();
      toast.error(t.lang === "bn" ? "অডিও চালানো যাচ্ছে না।" : "Couldn't load the audio.");
      return;
    }
    step(t.dir);
  }

  function close() {
    window.clearTimeout(gap.current);
    el?.pause();
    el?.removeAttribute("src");
    el?.load();
    set({ track: null, paused: true });
  }

  function chooseSpeed(value: string) {
    const v = Number(value);
    setSpeed(v);
    try {
      localStorage.setItem(SPEED_KEY, String(v));
    } catch {
      // storage blocked: speed still applies for this session
    }
  }

  const bn = track?.lang === "bn";
  const say = (en: string, b: string) => (bn ? b : en);

  return (
    <>
      <audio
        ref={ref}
        preload="auto"
        onPlay={() => {
          window.clearTimeout(gap.current);
          set({ paused: false });
        }}
        onPause={() => set({ paused: true })}
        onPlaying={() => (skips.current = 0)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        onEnded={onEnded}
        onError={onError}
      />
      {track ? (
        <>
          {/* keeps the end of the page clear of the floating pill */}
          <div aria-hidden className="h-24" />
          <section
            aria-label={say("Audio player", "অডিও প্লেয়ার")}
            className="glass fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-full px-5 pt-1.5 pb-2 font-sans [.app_&]:bottom-[calc(5rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger className={iconButton} aria-label={say("More", "আরও")}>
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="font-sans">
                  <DropdownMenuLabel>{say("Playback speed", "গতি")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={String(speed)} onValueChange={chooseSpeed}>
                    {SPEEDS.map((s) => (
                      <DropdownMenuRadioItem key={s} value={String(s)}>
                        {bn ? toBengaliDigits(s) : s}×
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className={iconButton}
                aria-label={say("Previous hadith", "আগের হাদিস")}
                disabled={!nextTrack(track, -1)}
                onClick={() => step(-1)}
              >
                <SkipBack />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={say("Back 10 seconds", "১০ সেকেন্ড পিছনে")}
                onClick={() => seek(-SEEK_S)}
              >
                <RotateCcw />
              </button>
              <button
                type="button"
                className={`${iconButton} size-11! bg-primary text-primary-foreground! hover:bg-primary/90 [&_svg]:size-5! [&_svg]:fill-current`}
                aria-label={paused ? say("Play", "চালান") : say("Pause", "থামান")}
                onClick={toggle}
              >
                {paused ? <Play /> : <Pause />}
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={say("Forward 10 seconds", "১০ সেকেন্ড সামনে")}
                onClick={() => seek(SEEK_S)}
              >
                <RotateCw />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={say("Next hadith", "পরের হাদিস")}
                disabled={!nextTrack(track, 1)}
                onClick={() => step(1)}
              >
                <SkipForward />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={say("Close player", "প্লেয়ার বন্ধ করুন")}
                onClick={close}
              >
                <X />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
              <span>{clock(time, bn)}</span>
              <input
                type="range"
                aria-label={say("Position", "অবস্থান")}
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(time, duration || 0)}
                onChange={(e) => {
                  if (el) el.currentTime = Number(e.target.value);
                }}
                className="h-1 flex-1 cursor-pointer accent-primary"
              />
              <span>{clock(duration, bn)}</span>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
