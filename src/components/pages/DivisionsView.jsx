"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { DIVISIONS_GEO, foodsByDivision, districtsInDivision } from "@/data/catalog";
import { formatNumber } from "@/utils/foodieHelpers";
import { Container } from "@/components/ui";

export default function DivisionsView() {
  const { t, lang } = useI18n();
  const num = (n) => formatNumber(n, lang);

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t("divisions.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">{t("divisions.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {DIVISIONS_GEO.map((d) => {
          const districts = districtsInDivision(d.id);
          const foods = foodsByDivision(d.id);
          return (
            <section key={d.id} className="rounded-2xl border border-line bg-cream p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-forest">
                    {lang === "en" ? d.name : d.nameBn}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {num(districts.length)} {t("divisions.districtCount")} · {num(foods.length)} {t("divisions.foodCount")}
                  </p>
                </div>
                <Link
                  href={`/divisions/${d.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-forest/25 px-3.5 py-2 text-xs font-semibold text-forest hover:border-terracotta hover:text-terracotta"
                >
                  {t("divisions.view")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {districts.map((dist) => (
                  <li key={dist.id}>
                    <Link
                      href={`/districts/${dist.id}`}
                      className="inline-block rounded-full border border-line bg-paper/50 px-2.5 py-1 text-[11px] text-ink/75 transition-colors hover:border-terracotta hover:text-terracotta"
                    >
                      {lang === "en" ? dist.name : dist.nameBn}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
