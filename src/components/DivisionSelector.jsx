"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { DIVISIONS_GEO } from "@/data/geo/districtMeta";

export default function DivisionSelector({ value, onChange, className = "" }) {
  const { t, lang } = useI18n();

  const options = [{ id: "", label: t("map.allDivisions") }].concat(
    DIVISIONS_GEO.map((d) => ({ id: d.id, label: lang === "en" ? d.name : d.nameBn })),
  );

  return (
    <div className={`hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 ${className}`}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id || "all"}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "border-forest bg-forest text-cream"
                : "border-line bg-cream text-forest/75 hover:border-terracotta hover:text-terracotta"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
