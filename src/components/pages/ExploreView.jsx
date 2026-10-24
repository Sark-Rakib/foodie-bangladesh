"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { CATALOG, FOOD_CATEGORIES, DIVISIONS_GEO, districtsInDivision } from "@/data/catalog";
import { formatNumber } from "@/utils/foodieHelpers";
import FoodCard from "@/components/FoodCard";
import FoodDetailsModal from "@/components/FoodDetailsModal";
import ExperienceForm from "@/components/ExperienceForm";
import { Container, EmptyState } from "@/components/ui";

export default function ExploreView({ initialCategory = "", initialDivision = "" }) {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [divisionId, setDivisionId] = useState(initialDivision);
  const [districtId, setDistrictId] = useState("");
  const [tried, setTried] = useState("all");
  const [sort, setSort] = useState("name");
  const [active, setActive] = useState(null);
  const [formFood, setFormFood] = useState(null);
  const num = (n) => formatNumber(n, lang);

  const triedSet = useMemo(() => new Set(triedIds), [triedIds]);
  const districts = divisionId ? districtsInDivision(divisionId) : [];

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = CATALOG.filter((f) => {
      if (category && f.category !== category) return false;
      if (divisionId && f.divisionId !== divisionId) return false;
      if (districtId && f.districtId !== districtId) return false;
      if (tried === "tried" && !triedSet.has(f.id)) return false;
      if (tried === "not" && triedSet.has(f.id)) return false;
      if (query) {
        const hay = `${f.nameBn} ${f.nameEn} ${f.districtBn} ${f.districtEn} ${f.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "district") return (lang === "en" ? a.districtEn : a.districtBn).localeCompare(lang === "en" ? b.districtEn : b.districtBn);
      if (sort === "division") return (lang === "en" ? a.divisionEn : a.divisionBn).localeCompare(lang === "en" ? b.divisionEn : b.divisionBn);
      return (lang === "en" ? a.nameEn : a.nameBn).localeCompare(lang === "en" ? b.nameEn : b.nameBn);
    });
    return list;
  }, [q, category, divisionId, districtId, tried, sort, triedSet, lang]);

  const hasFilters = q || category || divisionId || districtId || tried !== "all" || sort !== "name";

  const clearAll = () => {
    setQ("");
    setCategory("");
    setDivisionId("");
    setDistrictId("");
    setTried("all");
    setSort("name");
  };

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t("explore.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">{t("explore.subtitle")}</p>
      </header>

      <div className="mt-8 rounded-2xl border border-line bg-cream p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("common.searchFood")}
              className="w-full rounded-xl border border-line bg-paper/50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-terracotta"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setDistrictId(""); }} className={selectCls}>
              <option value="">{t("map.allDivisions")}</option>
              {DIVISIONS_GEO.map((d) => (
                <option key={d.id} value={d.id}>{lang === "en" ? d.name : d.nameBn}</option>
              ))}
            </select>
            <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!divisionId} className={selectCls}>
              <option value="">{t("experience.district")}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{lang === "en" ? d.name : d.nameBn}</option>
              ))}
            </select>
            <select value={tried} onChange={(e) => setTried(e.target.value)} className={selectCls}>
              <option value="all">{t("explore.allFoods")}</option>
              <option value="tried">{t("explore.onlyTried")}</option>
              <option value="not">{t("explore.onlyNotTried")}</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
              <option value="name">{t("explore.sortName")}</option>
              <option value="district">{t("explore.sortDistrict")}</option>
              <option value="division">{t("explore.sortDivision")}</option>
            </select>
          </div>
        </div>

        <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={!category} onClick={() => setCategory("")}>{t("common.all")}</Chip>
          {FOOD_CATEGORIES.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {lang === "en" ? c.labelEn : c.label}
            </Chip>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("common.showing")} {num(results.length)} / {num(CATALOG.length)}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 font-semibold text-terracotta hover:underline">
              <X className="h-3.5 w-3.5" />
              {t("explore.clearFilters")}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title={t("explore.emptyTitle")}
            body={t("explore.emptyBody")}
            action={
              <button type="button" onClick={clearAll} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep">
                {t("explore.clearFilters")}
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((food) => (
              <FoodCard key={food.id} food={food} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      {active && (
        <FoodDetailsModal
          food={active}
          onClose={() => setActive(null)}
          onWriteExperience={(food) => { setActive(null); setFormFood(food); }}
        />
      )}
      {formFood && (
        <ExperienceForm presetFood={formFood} onClose={() => setFormFood(null)} onSaved={() => setFormFood(null)} />
      )}
    </Container>
  );
}

const selectCls =
  "rounded-xl border border-line bg-paper/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-terracotta disabled:opacity-50";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-forest bg-forest text-cream" : "border-line bg-cream text-forest/75 hover:border-terracotta hover:text-terracotta"
      }`}
    >
      {children}
    </button>
  );
}
