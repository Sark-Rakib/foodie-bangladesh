"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { DISTRICT_INDEX, DIVISIONS_GEO, districtsInDivision, divisionName } from "@/data/catalog";
import { formatNumber } from "@/utils/foodieHelpers";
import { Container, Breadcrumbs, EmptyState } from "@/components/ui";
import FoodCard from "@/components/FoodCard";
import FoodDetailsModal from "@/components/FoodDetailsModal";
import ExperienceSection from "@/components/ExperienceSection";

export default function DistrictView({ districtId }) {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const [active, setActive] = useState(null);
  const num = (n) => formatNumber(n, lang);

  const district = DISTRICT_INDEX[districtId];
  if (!district) {
    return (
      <Container className="py-16">
        <EmptyState title={t("common.notFoundTitle")} body={t("common.notFoundBody")} />
      </Container>
    );
  }

  const division = DIVISIONS_GEO.find((d) => d.id === district.divisionId);
  const siblings = districtsInDivision(district.divisionId).filter((d) => d.id !== districtId);
  const triedHere = district.foods.filter((f) => triedIds.includes(f.id)).length;

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.divisions"), href: "/divisions" },
          { label: division ? (lang === "en" ? division.name : division.nameBn) : "", href: `/divisions/${district.divisionId}` },
          { label: lang === "en" ? district.name : district.nameBn },
        ]}
      />

      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          <MapPin className="h-3.5 w-3.5" />
          {t("district.inDivision")}: {divisionName(district.divisionId, lang)}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {lang === "en" ? district.name : district.nameBn}
        </h1>
        <p className="mt-3 text-sm text-ink/65">
          {num(district.foods.length)} {t("common.foodsCount")} · {t("district.triedHere")} {num(triedHere)}
        </p>
        <Link
          href="/map"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/25 px-4 py-2 text-xs font-semibold text-forest hover:border-terracotta hover:text-terracotta"
        >
          <MapPin className="h-3.5 w-3.5" />
          {t("district.center")}
        </Link>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-forest">{t("district.famousFoods")}</h2>
        {district.foods.length === 0 ? (
          <div className="mt-5">
            <EmptyState title={t("district.noFoodYet")} body={t("map.noFoodYet")} />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {district.foods.map((food) => (
              <FoodCard key={food.id} food={food} onOpen={setActive} />
            ))}
          </div>
        )}
      </section>

      <ExperienceSection districtId={districtId} className="mt-14" />

      {siblings.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-forest">{t("district.otherDistrict")}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {siblings.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/districts/${d.id}`}
                  className="inline-block rounded-full border border-line bg-cream px-3.5 py-1.5 text-sm text-forest transition-colors hover:border-terracotta hover:text-terracotta"
                >
                  {lang === "en" ? d.name : d.nameBn}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {active && <FoodDetailsModal food={active} onClose={() => setActive(null)} />}
    </Container>
  );
}
