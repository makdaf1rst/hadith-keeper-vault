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
    bookmarks: "Bookmarks",
    announcements: "Announcements",
    otherProjects: "Other Projects",
    contact: "Contact",
    contents: "Contents",
    search: "Search",
    clear: "Clear",
    searchPlaceholder: "Search Arabic, English, a hadith number, or a heading…",
    searchAria: "Search the hadith library",
    allBooks: "All books",
    allCollections: "All collections",
    allChapters: "All chapters",
    allLanguages: "All languages",
    arabic: "Arabic",
    clearFilters: "Clear filters",
    goToHadith: "Go directly to Hadith",
    matchingHeadings: "Matching headings",
    searching: "Searching…",
    searchFailed: "The search could not be completed.",
    noSearchMatch: "No hadith text matched this search.",
    hadith: "Hadith",
    previewOnly: "Preview only — open to read the complete hadith.",
    loading: "Loading…",
    loadingBooks: "Loading books…",
    libraryLoadFailed: "The library could not be loaded.",
    noHadithsImported: "No hadiths imported yet.",
    nothingInBook: "Nothing imported under this book yet.",
    section: "Section",
    noChaptersYet: "No chapters yet.",
    chapterIntroduction: "Chapter introduction",
    bookIntroduction: "Book introduction",
    collectionIntroduction: "Collection introduction",
    importedStats: "hadiths imported of 16,546",
    booksLabel: "Books",
    bilingualCollection: "Bilingual Arabic–English collection",
    chapter: "Chapter",
    babs: "Bābs",
    loadingHadiths: "Loading hadiths…",
    noNumberedHadiths: "No numbered hadiths in this Bāb.",
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
    bookmarks: "বুকমার্ক",
    announcements: "ঘোষণা",
    otherProjects: "অন্যান্য প্রকল্প",
    contact: "যোগাযোগ",
    contents: "সূচিপত্র",
    search: "অনুসন্ধান",
    clear: "মুছুন",
    searchPlaceholder: "আরবি, ইংরেজি, হাদিস নম্বর বা শিরোনাম অনুসন্ধান করুন…",
    searchAria: "হাদিস গ্রন্থাগারে অনুসন্ধান করুন",
    allBooks: "সব কিতাব",
    allCollections: "সব সংগ্রহ",
    allChapters: "সব অধ্যায়",
    allLanguages: "সব ভাষা",
    arabic: "আরবি",
    clearFilters: "ফিল্টার মুছুন",
    goToHadith: "সরাসরি হাদিসে যান",
    matchingHeadings: "মিল পাওয়া শিরোনাম",
    searching: "অনুসন্ধান করা হচ্ছে…",
    searchFailed: "অনুসন্ধান সম্পন্ন করা যায়নি।",
    noSearchMatch: "এই অনুসন্ধানের সাথে কোনো হাদিসের লেখা মেলেনি।",
    hadith: "হাদিস",
    previewOnly: "শুধু প্রিভিউ — সম্পূর্ণ হাদিস পড়তে খুলুন।",
    loading: "লোড হচ্ছে…",
    loadingBooks: "কিতাবগুলো লোড হচ্ছে…",
    libraryLoadFailed: "গ্রন্থাগারটি লোড করা যায়নি।",
    noHadithsImported: "এখনও কোনো হাদিস যোগ করা হয়নি।",
    nothingInBook: "এই কিতাবের অধীনে এখনও কিছু যোগ করা হয়নি।",
    section: "বিভাগ",
    noChaptersYet: "এখনও কোনো অধ্যায় নেই।",
    chapterIntroduction: "অধ্যায়ের ভূমিকা",
    bookIntroduction: "কিতাবের ভূমিকা",
    collectionIntroduction: "সংগ্রহের ভূমিকা",
    importedStats: "টি হাদিস আমদানি হয়েছে, মোট ১৬,৫৪৬",
    booksLabel: "কিতাব",
    bilingualCollection: "আরবি–ইংরেজি দ্বিভাষিক সংগ্রহ",
    chapter: "অধ্যায়",
    babs: "বাব",
    loadingHadiths: "হাদিস লোড হচ্ছে…",
    noNumberedHadiths: "এই বাবে কোনো নম্বরযুক্ত হাদিস নেই।",
  },
} as const;

export function useInterfaceText() {
  const { interfaceLanguage } = useLanguage();
  return interfaceText[interfaceLanguage];
}
