"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  House,
  Info,
  MapPinned,
  Map as MapIcon,
  Search,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ICON = "h-5 w-5";

export default function MobileBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const primary = [
    { href: "/", key: "nav.home", Icon: House },
    { href: "/map", key: "nav.map", Icon: MapIcon },
    { href: "/my-journey", key: "nav.journey", Icon: MapPinned },
  ];

  const moreLinks = [
    { href: "/explore", key: "nav.explore", Icon: Search },
    { href: "/divisions", key: "nav.divisions", Icon: Compass },
    { href: "/about", key: "nav.about", Icon: Info },
  ];

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-deep/50 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div
          className="fixed inset-x-3 bottom-[72px] z-50 rounded-2xl border border-line bg-cream p-4 shadow-2xl md:hidden"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.moreMenu")}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {t("nav.more")}
            </span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label={t("common.close")}
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-forest hover:bg-paper"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-col">
            {moreLinks.map(({ href, key, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={`flex items-center gap-3 border-b border-line/70 py-3 text-sm font-medium last:border-0 ${
                  isActive(href) ? "text-terracotta" : "text-ink/80"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <LanguageSwitcher variant="menu" />
          </div>
        </div>
      )}

      <nav
        aria-label={t("nav.menu")}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-cream/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {primary.map(({ href, key, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-terracotta" : "text-ink/60"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={t(key)}
                >
                  <Icon className={ICON} strokeWidth={active ? 2.4 : 1.9} />
                  {t(key)}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-label={t("nav.moreMenu")}
              className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                moreOpen ? "text-terracotta" : "text-ink/60"
              }`}
            >
              <UtensilsCrossed
                className={ICON}
                strokeWidth={
                  moreOpen || moreLinks.some(({ href }) => isActive(href)) ? 2.4 : 1.9
                }
              />
              {t("nav.more")}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
