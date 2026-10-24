"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Compass,
  House,
  Languages,
  Map as MapIcon,
  Route,
  Menu,
  Search,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { TOTAL_CATALOG, CATEGORY_COUNTS, FOOD_CATEGORIES, CATALOG } from "@/data/catalog";
import { DIVISIONS_GEO } from "@/data/geo/districtMeta";
import { bnNumber } from "@/utils/foodieHelpers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn, LAYOUT_CONTAINER } from "@/components/ui";

const ICON_SIZE = "h-[18px] w-[18px]";
const STROKE = 1.9;

export default function Header() {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [foodMapOpen, setFoodMapOpen] = useState(false);
  const foodMapRef = useRef(null);
  const foodMapHoverRef = useRef(false);

  const num = (n) => (lang === "bn" ? bnNumber(n) : String(n));

  const links = [
    { href: "/", key: "nav.home", Icon: House },
    { href: "/explore", key: "nav.explore", Icon: Search },
  ];

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const foodMapItems = [
    { href: "/map", key: "nav.foodMapExplore", Icon: MapIcon },
    { href: "/my-journey", key: "nav.foodMapJourney", Icon: Route },
  ];

  const foodMapActive = foodMapItems.some((i) => isActive(i.href));

  useEffect(() => {
    if (!foodMapOpen) return undefined;
    const onDown = (e) => {
      if (foodMapRef.current && !foodMapRef.current.contains(e.target)) setFoodMapOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setFoodMapOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [foodMapOpen]);

  const divisionCount = (id) => CATALOG.filter((f) => f.divisionId === id).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-cream/92 backdrop-blur-md">
      <div className={cn(LAYOUT_CONTAINER, "flex h-16 flex-nowrap items-center justify-between gap-3 lg:gap-4")}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-mustard">
            <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap font-display text-lg font-semibold text-forest">
              {t("brand")}
            </span>
            <span className="block whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-muted">
              {t("brandLatin")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 2xl:flex" aria-label={t("nav.menu")}>
          {links.map(({ href, key, Icon }) => (
            <Navlink key={href} href={href} label={t(key)} Icon={Icon} active={isActive(href)} />
          ))}

          <div
            ref={foodMapRef}
            className="relative"
            onMouseEnter={() => {
              foodMapHoverRef.current = true;
              setFoodMapOpen(true);
            }}
            onMouseLeave={() => {
              foodMapHoverRef.current = false;
              setFoodMapOpen(false);
            }}
          >
            <button
              type="button"
              aria-expanded={foodMapOpen}
              aria-haspopup="true"
              onClick={() => {
                if (foodMapHoverRef.current) {
                  foodMapHoverRef.current = false;
                  return;
                }
                setFoodMapOpen((v) => !v);
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                foodMapActive ? "text-terracotta" : "text-ink/75 hover:text-terracotta"
              }`}
            >
              <MapIcon className={ICON_SIZE} strokeWidth={STROKE} />
              {t("nav.foodMap")}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${foodMapOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-0 top-full z-50 w-64 origin-top pt-2 transition-all duration-200 ease-out ${
                foodMapOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <div className="overflow-hidden rounded-2xl border border-line bg-cream p-1.5 shadow-xl">
                {foodMapItems.map(({ href, key, Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setFoodMapOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "bg-paper text-terracotta" : "text-ink/80 hover:bg-paper hover:text-forest"
                      }`}
                    >
                      <Icon className={ICON_SIZE} strokeWidth={STROKE} />
                      {t(key)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((v) => !v)}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/divisions") ? "text-terracotta" : "text-ink/75 hover:text-terracotta"
              }`}
            >
              <Compass className={ICON_SIZE} strokeWidth={STROKE} />
              {t("nav.divisions")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            {megaOpen && (
              <div className="absolute left-1/2 top-full z-50 w-[640px] -translate-x-1/2 pt-2">
                <div className="grid grid-cols-[1.4fr_1fr] gap-5 rounded-2xl border border-line bg-cream p-5 shadow-xl">
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {t("nav.divisions")}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {DIVISIONS_GEO.map((d) => (
                        <Link
                          key={d.id}
                          href={`/divisions/${d.id}`}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-paper hover:text-forest"
                        >
                          <span>{lang === "en" ? d.name : d.nameBn}</span>
                          <span className="text-[11px] text-muted">{num(divisionCount(d.id))}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/divisions"
                      onClick={() => setMegaOpen(false)}
                      className="mt-3 inline-block text-xs font-semibold text-terracotta hover:underline"
                    >
                      {t("common.viewAll")} →
                    </Link>
                  </div>
                  <div className="rounded-xl bg-paper/60 p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {t("common.category")}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {FOOD_CATEGORIES.map((c) => (
                        <Link
                          key={c.id}
                          href={`/explore?category=${c.id}`}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink/80 transition-colors hover:bg-cream hover:text-forest"
                        >
                          <span>{lang === "en" ? c.labelEn : c.label}</span>
                          <span className="text-[11px] text-muted">{num(CATEGORY_COUNTS[c.id] ?? 0)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <Link
            href="/my-journey"
            className="hidden whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:border-terracotta 2xl:inline-block"
          >
            {t("common.tried")} {num(triedIds.length)}/{num(TOTAL_CATALOG)}
          </Link>
          <Link
            href="/map"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark md:inline-flex"
          >
            <MapIcon className="h-4 w-4" strokeWidth={2.1} />
            {t("nav.exploreMap")}
          </Link>
          <button
            type="button"
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-forest transition-colors hover:border-terracotta 2xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-cream 2xl:hidden">
          <div className={cn(LAYOUT_CONTAINER, "pb-5 pt-3")}>
          <nav className="flex flex-col" aria-label={t("nav.menu")}>
            {links.map(({ href, key, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 border-b border-line/70 py-3 text-sm font-medium transition-colors ${
                  isActive(href) ? "text-terracotta" : "text-ink/80 hover:text-terracotta"
                }`}
              >
                <Icon className={ICON_SIZE} strokeWidth={STROKE} />
                {t(key)}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-b border-line/70 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              <MapIcon className={ICON_SIZE} strokeWidth={STROKE} />
              {t("nav.foodMap")}
            </div>
            {foodMapItems.map(({ href, key, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 border-b border-line/70 py-3 pl-6 text-sm font-medium transition-colors ${
                  isActive(href) ? "text-terracotta" : "text-ink/80 hover:text-terracotta"
                }`}
              >
                <Icon className={ICON_SIZE} strokeWidth={STROKE} />
                {t(key)}
              </Link>
            ))}
            <Link
              href="/divisions"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 border-b border-line/70 py-3 text-sm font-medium transition-colors ${
                isActive("/divisions") ? "text-terracotta" : "text-ink/80 hover:text-terracotta"
              }`}
            >
              <Compass className={ICON_SIZE} strokeWidth={STROKE} />
              {t("nav.divisions")}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 py-3 text-sm font-medium transition-colors ${
                isActive("/about") ? "text-terracotta" : "text-ink/80 hover:text-terracotta"
              }`}
            >
              <BookOpen className={ICON_SIZE} strokeWidth={STROKE} />
              {t("nav.about")}
            </Link>
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted" />
            <LanguageSwitcher variant="menu" />
          </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Navlink({ href, label, Icon, active }) {
  return (
    <Link
      href={href}
      className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? "text-terracotta" : "text-ink/75 hover:text-terracotta"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={ICON_SIZE} strokeWidth={STROKE} />
      {label}
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-terracotta" aria-hidden />
      )}
    </Link>
  );
}
