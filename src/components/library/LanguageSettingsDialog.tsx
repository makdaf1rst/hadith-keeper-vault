"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInterfaceText, useLanguage } from "@/lib/language";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LanguageSettingsDialog({ open, onOpenChange }: Props) {
  const {
    interfaceLanguage,
    contentLanguage,
    setInterfaceLanguage,
    setContentLanguage,
  } = useLanguage();
  const t = useInterfaceText();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.languageSettings}</DialogTitle>
          <DialogDescription>{t.languageDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
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
              <option value="bn">{t.bengali}</option>
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
              <option value="bn">{t.arabicBengali}</option>
            </select>
          </label>

          <p className="text-xs leading-5 text-muted-foreground">{t.arabicAlwaysShown}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
