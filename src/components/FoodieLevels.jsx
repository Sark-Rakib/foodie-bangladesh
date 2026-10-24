"use client";

import { Award, Lock } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { LEVELS, levelFor, progressWithinLevel, formatNumber } from "@/utils/foodieHelpers";
import { TOTAL_CATALOG } from "@/data/catalog";
import { ProgressBar } from "@/components/ui";

export default function FoodieLevels({ compact = false }) {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const count = triedIds.length;
  const { index, next } = levelFor(count);
  const pct = progressWithinLevel(count);
  const num = (n) => formatNumber(n, lang);

  return (
    <div className="rounded-2xl border border-line bg-cream p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {t("journey.levelTitle")}
          </p>
          <h3 className="mt-1.5 font-display text-xl font-semibold text-forest">
            {t(`levels.l${index}`)}
          </h3>
          <p className="mt-1 text-sm text-ink/60">{t(`levels.d${index}`)}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mustard/25 text-mustard-deep">
          <Award className="h-5 w-5" />
        </div>
      </div>

      {next ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {t("journey.progressToNext")} {num(next.min - count)}
            </span>
            <span>{t(`levels.l${index + 1}`)}</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      ) : (
        <div className="mt-5">
          <ProgressBar value={100} tone="forest" />
          <p className="mt-2 text-xs text-forest">{t("levels.d4")}</p>
        </div>
      )}

      {!compact && (
        <ul className="mt-5 grid gap-1.5 border-t border-line pt-4 sm:grid-cols-2">
          {LEVELS.map((lvl, i) => {
            const reached = count >= lvl.min;
            return (
              <li
                key={lvl.key}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                  i === index ? "bg-paper font-semibold text-forest" : reached ? "text-forest/80" : "text-muted"
                }`}
              >
                {reached ? (
                  <Award className="h-3.5 w-3.5 text-mustard-deep" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                <span className="flex-1">{t(`levels.l${i}`)}</span>
                <span className="text-[11px] text-muted">
                  {i === 0 ? "0" : `${num(lvl.min)}`}
                  {i === LEVELS.length - 1 ? "+" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        {t("common.triedCount")}: {num(count)} / {num(TOTAL_CATALOG)}
      </p>
    </div>
  );
}
