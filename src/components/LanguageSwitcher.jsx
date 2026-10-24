"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function LanguageSwitcher({ variant = "inline" }) {
  const { lang, setLang, t } = useI18n();

  if (variant === "menu") {
    return (
      <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-1">
        {["bn", "en"].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              lang === code ? "bg-forest text-cream" : "text-forest/70 hover:text-terracotta"
            }`}
          >
            {code === "bn" ? "বাংলা" : "English"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      aria-label={t("nav.language")}
      title={t("nav.language")}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:border-terracotta hover:text-terracotta"
    >
      <Languages className="h-3.5 w-3.5" />
      {lang === "bn" ? "EN" : "বাংলা"}
    </button>
  );
}
