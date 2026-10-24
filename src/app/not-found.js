"use client";

import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <span className="font-display text-6xl font-semibold text-line">৪০৪</span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-forest">{t("common.notFoundTitle")}</h1>
      <p className="mt-3 text-sm text-ink/65">{t("common.notFoundBody")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep">
          <Home className="h-4 w-4" />
          {t("common.goHome")}
        </Link>
        <Link href="/explore" className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest hover:border-forest hover:bg-forest/5">
          <Compass className="h-4 w-4" />
          {t("nav.explore")}
        </Link>
      </div>
    </div>
  );
}
