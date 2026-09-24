"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useInterfaceText, useLanguage } from "@/lib/language";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LanguageSettingsDialog({ open, onOpenChange }: Props) {
  const {
    interfaceLanguage,
    contentLanguage,
    bengaliPreviewUnlocked,
    bengaliPreviewChecking,
    unlockBengaliPreview,
    setInterfaceLanguage,
    setContentLanguage,
  } = useLanguage();
  const t = useInterfaceText();
  const [accessCode, setAccessCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  async function unlockPreview(event: React.FormEvent) {
    event.preventDefault();
    if (!accessCode.trim()) return;
    setUnlocking(true);
    setUnlockError(null);
    const result = await unlockBengaliPreview(accessCode.trim());
    setUnlocking(false);
    if (!result.ok) {
      setUnlockError(result.error ?? "Unable to unlock Bengali preview.");
      return;
    }
    setAccessCode("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.languageSettings}</DialogTitle>
          <DialogDescription>{t.languageDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {!bengaliPreviewUnlocked && !bengaliPreviewChecking ? (
            <form
              onSubmit={unlockPreview}
              className="space-y-3 rounded-md border border-border bg-muted/30 p-4"
            >
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">Bangla private preview</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The Bangla edition is currently under quality control. Enter the temporary
                    preview access code to view it.
                  </p>
                </div>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Preview access code"
                aria-label="Bangla preview access code"
              />
              {unlockError ? (
                <p className="text-xs text-destructive">{unlockError}</p>
              ) : null}
              <Button type="submit" size="sm" disabled={unlocking || !accessCode.trim()}>
                {unlocking ? "Unlocking…" : "Unlock Bangla preview"}
              </Button>
            </form>
          ) : null}

          {bengaliPreviewUnlocked ? (
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              Bangla private preview is unlocked on this browser for 7 days.
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">{t.interfaceLanguage}</span>
            <select
              value={interfaceLanguage}
              onChange={(event) =>
                setInterfaceLanguage(event.target.value === "bn" ? "bn" : "en")
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="en">{t.english}</option>
              <option value="bn" disabled={!bengaliPreviewUnlocked}>
                {t.bengali}{!bengaliPreviewUnlocked ? " — Private preview" : ""}
              </option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">{t.contentLanguage}</span>
            <select
              value={contentLanguage}
              onChange={(event) =>
                setContentLanguage(event.target.value === "bn" ? "bn" : "en")
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="en">{t.arabicEnglish}</option>
              <option value="bn" disabled={!bengaliPreviewUnlocked}>
                {t.arabicBengali}{!bengaliPreviewUnlocked ? " — Private preview" : ""}
              </option>
            </select>
          </label>

          <p className="text-xs leading-5 text-muted-foreground">{t.arabicAlwaysShown}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
