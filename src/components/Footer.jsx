"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn, LAYOUT_CONTAINER } from "@/components/ui";

export default function Footer() {
  const { t } = useI18n();

  const columns = [
    {
      title: t("nav.explore"),
      links: [
        { href: "/explore", label: t("nav.explore") },
        { href: "/map", label: t("nav.map") },
        { href: "/divisions", label: t("nav.divisions") },
      ],
    },
    {
      title: t("nav.journey"),
      links: [
        { href: "/my-journey", label: t("nav.journey") },
        { href: "/stories", label: t("nav.stories") },
        { href: "/about", label: t("nav.about") },
      ],
    },
  ];

  return (
    <footer className="mt-14 border-t border-line bg-forest text-cream/80">
      <div className={cn(LAYOUT_CONTAINER, "grid gap-8 py-10 sm:py-12 md:grid-cols-[1.5fr_1fr_1fr]")}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream text-forest">
              <UtensilsCrossed className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-semibold text-cream">{t("brand")}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            {t("about.intro")}
          </p>
          <div className="mt-5">
            <LanguageSwitcher variant="menu" />
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mustard">
              {col.title}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/70 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/15">
        <div className={cn(LAYOUT_CONTAINER, "flex flex-col gap-2 py-6 pb-24 text-xs text-cream/55 md:flex-row md:items-center md:justify-between md:pb-6")}>
          <p>{t("map.dataNote")}</p>
          <p>© Foodie Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
