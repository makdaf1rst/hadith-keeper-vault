"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type InterfaceLanguage = "en" | "bn";
export type ContentLanguage = "en" | "bn";

type LanguageContextValue = {
  interfaceLanguage: InterfaceLanguage;
  contentLanguage: ContentLanguage;
  setInterfaceLanguage: (language: InterfaceLanguage) => void;
  setContentLanguage: (language: ContentLanguage) => void;
};

const INTERFACE_KEY = "jami-interface-language";
const CONTENT_KEY = "jami-content-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key) as T | null;
  return value && allowed.includes(value) ? value : fallback;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [interfaceLanguage, setInterfaceLanguageState] = useState<InterfaceLanguage>("en");
  const [contentLanguage, setContentLanguageState] = useState<ContentLanguage>("en");

  useEffect(() => {
    setInterfaceLanguageState(readStored(INTERFACE_KEY, ["en", "bn"] as const, "en"));
    setContentLanguageState(readStored(CONTENT_KEY, ["en", "bn"] as const, "en"));
  }, []);

  const setInterfaceLanguage = (language: InterfaceLanguage) => {
    setInterfaceLanguageState(language);
    if (typeof window !== "undefined") window.localStorage.setItem(INTERFACE_KEY, language);
  };

  const setContentLanguage = (language: ContentLanguage) => {
    setContentLanguageState(language);
    if (typeof window !== "undefined") window.localStorage.setItem(CONTENT_KEY, language);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = interfaceLanguage === "bn" ? "bn" : "en";
    }
  }, [interfaceLanguage]);

  const value = useMemo(
    () => ({
      interfaceLanguage,
      contentLanguage,
      setInterfaceLanguage,
      setContentLanguage,
    }),
    [interfaceLanguage, contentLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within LanguageProvider");
  return value;
}

const interfaceText = {
  en: {
    settings: "Settings",
    languageSettings: "Language settings",
    languageDescription:
      "Choose the language of the website interface and the translation shown with the Arabic hadith text.",
    interfaceLanguage: "Interface language",
    contentLanguage: "Content language",
    english: "English",
    bengali: "বাংলা",
    arabicEnglish: "Arabic + English",
    arabicBengali: "Arabic + বাংলা",
    arabicAlwaysShown: "The original Arabic text will always remain visible.",
  },
  bn: {
    settings: "সেটিংস",
    languageSettings: "ভাষার সেটিংস",
    languageDescription:
      "ওয়েবসাইটের ইন্টারফেসের ভাষা এবং আরবি হাদিসের সাথে প্রদর্শিত অনুবাদের ভাষা নির্বাচন করুন।",
    interfaceLanguage: "ইন্টারফেসের ভাষা",
    contentLanguage: "কনটেন্টের ভাষা",
    english: "English",
    bengali: "বাংলা",
    arabicEnglish: "আরবি + English",
    arabicBengali: "আরবি + বাংলা",
    arabicAlwaysShown: "মূল আরবি লেখা সবসময় দৃশ্যমান থাকবে।",
  },
} as const;

export function useInterfaceText() {
  const { interfaceLanguage } = useLanguage();
  return interfaceText[interfaceLanguage];
}
