"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Locale } from "../lib/site-data";

interface SiteContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("zh");
  const hasRestoredPreference = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("matrilink-locale");
    const timer = window.setTimeout(() => {
      if (stored === "en" || stored === "zh") {
        updateLocale(stored);
      }
      hasRestoredPreference.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasRestoredPreference.current) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem("matrilink-locale", locale);
  }, [locale]);

  const setLocale = useCallback((value: Locale) => updateLocale(value), []);
  const toggleLocale = useCallback(
    () => updateLocale((current) => (current === "zh" ? "en" : "zh")),
    [],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useLocale() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useLocale must be used within SiteProvider");
  }
  return context;
}
