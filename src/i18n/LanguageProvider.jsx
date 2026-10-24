"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { createLocalStore } from "@/utils/localStore";
import { DEFAULT_LANG, LANGS, getDict } from "./dictionary";

const langStore = createLocalStore("foodie-bd:lang-v1", {
  fallback: DEFAULT_LANG,
  parse: (raw) => (LANGS.includes(raw) ? raw : DEFAULT_LANG),
  serialize: (value) => value,
});

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const lang = useSyncExternalStore(
    langStore.subscribe,
    langStore.getSnapshot,
    langStore.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (LANGS.includes(next)) langStore.write(next);
  }, []);

  const toggle = useCallback(() => {
    langStore.write(langStore.getSnapshot() === "bn" ? "en" : "bn");
  }, []);

  const t = useCallback(
    (path, fallback) => {
      const value = path
        .split(".")
        .reduce((node, key) => (node && node[key] != null ? node[key] : undefined), getDict(lang));
      return value != null ? value : (fallback ?? path);
    },
    [lang],
  );

  const tr = useCallback(
    (pair) => {
      if (!pair) return "";
      return lang === "en" ? (pair.en ?? pair.bn ?? "") : (pair.bn ?? pair.en ?? "");
    },
    [lang],
  );

  const value = { lang, setLang, toggle, t, tr };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return ctx;
}

export { langStore };
