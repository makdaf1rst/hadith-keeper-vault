import { BookOpenText, Minus, Plus, Type, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/lib/language";
import {
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  type ReaderSettings,
} from "@/lib/reader-settings";

type Props = {
  settings: ReaderSettings;
  update: (patch: Partial<ReaderSettings>) => void;
};

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={`${label} −`}
          disabled={value <= SCALE_MIN}
          onClick={() => onChange(value - SCALE_STEP)}
        >
          <Minus />
        </Button>
        <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">
          {Math.round(value * 100)}%
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={`${label} +`}
          disabled={value >= SCALE_MAX}
          onClick={() => onChange(value + SCALE_STEP)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export function ReaderControls({ settings, update }: Props) {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" aria-label={bn ? "লেখার আকার" : "Text size"}>
            <Type className="size-4" />
            <span className="hidden sm:inline">{bn ? "লেখার আকার" : "Text size"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <Stepper
            label={bn ? "আরবি" : "Arabic"}
            value={settings.arabicScale}
            onChange={(arabicScale) => update({ arabicScale })}
          />
          <Stepper
            label={bn ? "অনুবাদ" : "Translation"}
            value={settings.translationScale}
            onChange={(translationScale) => update({ translationScale })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update({ arabicScale: 1, translationScale: 1 })}
          >
            {bn ? "ডিফল্টে ফিরুন" : "Reset"}
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        variant={settings.readerMode ? "default" : "outline"}
        size="sm"
        aria-pressed={settings.readerMode}
        aria-label={bn ? "রিডার মোড" : "Reader mode"}
        onClick={() => update({ readerMode: !settings.readerMode })}
      >
        {settings.readerMode ? <X className="size-4" /> : <BookOpenText className="size-4" />}
        <span className="hidden sm:inline">
          {settings.readerMode
            ? bn ? "রিডার মোড বন্ধ" : "Exit reader mode"
            : bn ? "রিডার মোড" : "Reader mode"}
        </span>
      </Button>
    </div>
  );
}
