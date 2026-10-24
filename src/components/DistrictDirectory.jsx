"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { DIVISIONS_GEO, districtById } from "@/data/geo/districtMeta";
import { districtsInDivision, districtName, divisionName } from "@/data/catalog";
import { useDistrictFoods } from "@/hooks/useDistrictFoods";

// Official division order requested for the selector.
const DIVISION_ORDER = [
  "dhaka",
  "chattogram",
  "rajshahi",
  "khulna",
  "barishal",
  "sylhet",
  "rangpur",
  "mymensingh",
];

// External district selector: every one of the 64 districts, grouped under its
// division, shown as clean accordion cards beside (desktop) or above (mobile)
// the map. Selecting a district highlights it on the map and shows only its
// name there.
export default function DistrictDirectory({ selectedId = null, onSelect }) {
  const { t, lang } = useI18n();
  const { byDistrict } = useDistrictFoods();
  const [query, setQuery] = useState("");
  // Divisions are expanded by default; this tracks the ones the user collapsed.
  const [collapsed, setCollapsed] = useState(() => new Set());
  const searching = query.trim().length > 0;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIVISION_ORDER.map((divisionId) => {
      let districts = districtsInDivision(divisionId);
      if (q) {
        districts = districts.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.nameBn.includes(query.trim()),
        );
      }
      return { divisionId, districts };
    }).filter((g) => g.districts.length > 0);
  }, [query]);

  // The division holding the active district always stays open, so a selection
  // made on the map is visible in the list even if the user collapsed it.
  const selectedDivision = selectedId ? districtById(selectedId)?.divisionId : null;

  const toggle = (divisionId) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(divisionId)) next.delete(divisionId);
      else next.add(divisionId);
      return next;
    });
  };

  const totalShown = groups.reduce((n, g) => n + g.districts.length, 0);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-cream">
      <header className="border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-semibold text-forest">
          {t("map.districtPanelTitle")}
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          {t("map.districtPanelHint")}
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("map.districtPanelSearch")}
            className="w-full rounded-xl border border-line bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-terracotta"
          />
        </div>
      </header>

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {totalShown === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">
            {t("map.districtPanelNoResults")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map(({ divisionId, districts }) => {
              const isOpen =
                searching || divisionId === selectedDivision || !collapsed.has(divisionId);
              const hasSelection = districts.some((d) => d.id === selectedId);
              return (
                <div key={divisionId} className="rounded-xl border border-line bg-paper/40 p-3">
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(divisionId)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-2 text-left text-xs font-bold uppercase tracking-wide text-terracotta"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                      />
                      <span className="flex-1">{divisionName(divisionId, lang)}</span>
                      {hasSelection && (
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-terracotta text-cream">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-forest/70">
                        {districts.length}
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {districts.map((d) => {
                        const active = d.id === selectedId;
                        const foodCount = byDistrict(d.id).length;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => onSelect?.(active ? null : d.id)}
                            aria-pressed={active}
                            className={`flex items-center justify-between gap-1 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                              active
                                ? "border-terracotta bg-terracotta text-cream"
                                : "border-line bg-cream text-forest/80 hover:border-terracotta hover:text-terracotta"
                            }`}
                          >
                            <span className="truncate">{districtName(d.id, lang)}</span>
                            {active ? (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            ) : foodCount > 0 ? (
                              <span className="shrink-0 rounded-full bg-forest/10 px-1.5 text-[10px] font-bold text-forest">
                                {foodCount}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-line px-4 py-2 text-[10px] text-muted">
        {DIVISIONS_GEO.length} {lang === "en" ? "divisions" : "বিভাগ"} ·{" "}
        {lang === "en" ? "64 districts" : "৬৪ জেলা"}
      </footer>
    </section>
  );
}
