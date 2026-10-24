"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { DIVISIONS_GEO, foodsByDivision, districtsInDivision } from "@/data/catalog";
import { formatNumber, levelFor } from "@/utils/foodieHelpers";
import { Container, Breadcrumbs, ProgressBar, EmptyState } from "@/components/ui";
import FoodCard from "@/components/FoodCard";
import FoodDetailsModal from "@/components/FoodDetailsModal";
import ExperienceSection from "@/components/ExperienceSection";

export default function DivisionView({ divisionId }) {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const [active, setActive] = useState(null);
  const num = (n) => formatNumber(n, lang);

  const division = DIVISIONS_GEO.find((d) => d.id === divisionId);
  const districts = districtsInDivision(divisionId);
  const foods = foodsByDivision(divisionId);
  const triedHere = foods.filter((f) => triedIds.includes(f.id)).length;
  const completion = foods.length ? Math.round((triedHere / foods.length) * 100) : 0;

  if (!division) {
    return (
      <Container className="py-16">
        <EmptyState title={t("common.notFoundTitle")} body={t("common.notFoundBody")} />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.divisions"), href: "/divisions" },
          { label: lang === "en" ? division.name : division.nameBn },
        ]}
      />

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          {t("common.division")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {lang === "en" ? division.name : division.nameBn}
        </h1>
        <p className="mt-3 text-sm text-ink/65">
          {num(districts.length)} {t("divisions.districtCount")} · {num(foods.length)} {t("divisions.foodCount")}
        </p>
      </header>

      <div className="mt-8 rounded-2xl border border-line bg-cream p-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>{t("divisions.progress")}</span>
          <span>{num(triedHere)} / {num(foods.length)}</span>
        </div>
        <ProgressBar value={completion} />
        <p className="mt-3 text-sm font-semibold text-forest">
          {t(`levels.l${levelFor(triedHere).index}`)}
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-forest">{t("divisions.famousFoods")}</h2>
        {foods.length === 0 ? (
          <div className="mt-5">
            <EmptyState title={t("district.noFoodYet")} />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} onOpen={setActive} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-forest">{t("divisions.otherDistricts")}</h2>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <li key={d.id}>
              <Link
                href={`/districts/${d.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-3 text-sm text-forest transition-colors hover:border-terracotta hover:text-terracotta"
              >
                {lang === "en" ? d.name : d.nameBn}
                <span className="text-[11px] text-muted">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ExperienceSection divisionId={divisionId} className="mt-14" />

      {active && <FoodDetailsModal food={active} onClose={() => setActive(null)} />}
    </Container>
  );
}
