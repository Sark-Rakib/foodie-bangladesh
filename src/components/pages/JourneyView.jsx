"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Languages, Pencil, Store, Trash2, UserRound, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDistrictFoods, useResolvedImages, removeDistrictFood } from "@/hooks/useDistrictFoods";
import { useProfile } from "@/hooks/useProfile";
import { useOrigin } from "@/hooks/useOrigin";
import { useFoodie } from "@/components/FoodieProvider";
import { districtName, divisionName, TOTAL_CATALOG } from "@/data/catalog";
import { formatNumber } from "@/utils/foodieHelpers";
import { Container } from "@/components/ui";
import FoodProgress from "@/components/FoodProgress";
import FoodieLevels from "@/components/FoodieLevels";
import MapEmbed from "@/components/MapEmbed";
import DistrictDirectory from "@/components/DistrictDirectory";
import BangladeshMapSvg from "@/components/BangladeshMapSvg";
import FoodMapShareCard from "@/components/FoodMapShareCard";
import ShareActions from "@/components/ShareActions";
import DistrictFoodImage from "@/components/DistrictFoodImage";
import DistrictFoodForm from "@/components/DistrictFoodForm";

const CARD_LANGS = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
];

export default function JourneyView({ embedded = false }) {
  const { t, lang } = useI18n();
  const { foods } = useDistrictFoods();
  const { triedIds } = useFoodie();
  const { name, setName } = useProfile();
  const origin = useOrigin();
  const cardRef = useRef(null);

  const [cardLang, setCardLang] = useState(lang);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [mapSelection, setMapSelection] = useState(null);
  const [detail, setDetail] = useState(null);

  const num = (n) => formatNumber(n, lang);

  const exploredIds = useMemo(() => [...new Set(foods.map((f) => f.districtId))], [foods]);
  const imageIds = useMemo(() => foods.map((f) => f.imageId), [foods]);
  const imageMap = useResolvedImages(imageIds);

  const entries = useMemo(
    () =>
      foods.map((f) => ({
        id: f.id,
        name: f.name,
        districtId: f.districtId,
        image: imageMap[f.imageId] ?? "",
      })),
    [foods, imageMap],
  );

  // Escape closes the topmost open dialog (detail, then delete confirm).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (confirmId) setConfirmId(null);
      else if (detail) setDetail(null);
      else if (editing) setEditing(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmId, detail, editing]);

  const photoCount = entries.filter((e) => e.image).length;
  const completion = Math.round((triedIds.length / TOTAL_CATALOG) * 100);

  const shareText = t("share.summaryOne")
    .replace("{foods}", String(foods.length))
    .replace("{districts}", String(exploredIds.length));

  return (
    <Container className={embedded ? "py-0" : "py-10 sm:py-14"}>
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
          {t("share.cardKicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {t("foodMap.title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">
          {t("foodMap.subtitle")}
        </p>
      </header>

      {/* District selector + interactive map to add foods */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="order-2 lg:order-1">
          <MapEmbed
            heightClass="h-[45vh] min-h-[300px] lg:h-[70vh]"
            selectedId={mapSelection}
            onSelect={setMapSelection}
            showControls={false}
            displayName={name}
          />
        </div>
        <div className="order-1 lg:order-2 lg:h-[74vh] lg:max-h-[74vh] lg:overflow-hidden">
          <DistrictDirectory selectedId={mapSelection} onSelect={setMapSelection} />
        </div>
      </div>

      {/* Summary tiles */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile value={num(exploredIds.length)} label={t("foodMap.exploredDistricts")} tone="terracotta" />
        <Tile value={num(foods.length)} label={t("foodMap.totalFoods")} tone="forest" />
        <Tile value={num(photoCount)} label={t("foodMap.totalPhotos")} tone="forest" />
        <Tile value={num(triedIds.length)} label={t("journey.triedFoods")} tone="forest" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-cream p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FoodProgress
            value={completion}
            label={`${num(completion)}%`}
            sublabel={`${num(triedIds.length)} / ${num(TOTAL_CATALOG)}`}
          />
          <FoodieLevels />
        </div>
      </div>

      {/* Share card */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-forest">{t("foodMap.preview")}</h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div
            ref={cardRef}
            className="rounded-3xl bg-water p-3"
            style={{ contain: "layout paint" }}
          >
            <FoodMapShareCard
              entries={entries}
              exploredIds={exploredIds}
              displayName={name}
              shareUrl={origin}
              lang={cardLang}
              selectedId={mapSelection}
            />
          </div>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-forest">
                <UserRound className="h-4 w-4 text-terracotta" />
                {t("foodMap.displayName")}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("foodMap.displayNamePlaceholder")}
                maxLength={40}
                className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm outline-none focus:border-terracotta"
              />
            </label>

            <div className="flex flex-col gap-1.5 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-forest">
                <Languages className="h-4 w-4 text-terracotta" />
                {t("foodMap.cardLanguage")}
              </span>
              <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
                {CARD_LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCardLang(code)}
                    aria-pressed={cardLang === code}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      cardLang === code ? "bg-forest text-cream" : "text-forest/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ShareActions
              getNode={() => cardRef.current}
              filename="my-food-map.png"
              sharePath="/share"
              shareText={`${shareText} — Foodie Bangladesh`}
              exportWidth={1080}
              exportHeight={1350}
            />

            <p className="rounded-xl border border-line bg-paper/50 p-3 text-[11px] leading-relaxed text-muted">
              {t("share.facebookNote")}
            </p>
            <p className="text-[11px] leading-relaxed text-muted">{t("share.personalNote")}</p>
          </div>
        </div>
      </section>

      {/* Small static map summary */}
      <section className="mt-14 rounded-2xl border border-line bg-cream p-6">
        <h2 className="font-display text-xl font-semibold text-forest">{t("foodMap.mapHeading")}</h2>
        <p className="mt-1 text-xs text-muted">{t("foodMap.mapHint")}</p>
        <div className="mt-4">
          <BangladeshMapSvg
            exploredIds={exploredIds}
            ariaLabel={`${t("foodMap.mapHeading")} — Foodie Bangladesh`}
            className="mx-auto h-64 w-full max-w-md"
          />
        </div>
      </section>

      {editing && (
        <DistrictFoodForm
          presetDistrict={editing.districtId}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}

      {detail && (
        <div
          className="fixed inset-0 z-[700] flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={detail.name}
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <DistrictFoodImage
                imageId={detail.imageId}
                alt={detail.name}
                className="h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label={t("common.close")}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-forest shadow hover:text-terracotta"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-semibold text-forest">{detail.name}</h3>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-terracotta">
                {districtName(detail.districtId, lang)} · {divisionName(detail.divisionId, lang)}
              </p>
              {detail.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{detail.description}</p>
              )}
              <dl className="mt-4 flex flex-col gap-2">
                {detail.shop && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Store className="h-3.5 w-3.5" />
                    <span>{detail.shop}</span>
                  </div>
                )}
                {detail.date && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{detail.date}</span>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(detail);
                    setDetail(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-terracotta px-4 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-cream"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmId(detail.id);
                    setDetail(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-forest hover:bg-paper"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div
          className="fixed inset-0 z-[700] grid place-items-center bg-forest-deep/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-cream p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-forest">{t("districtFood.deleteConfirm")}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-forest hover:bg-paper"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmId;
                  setConfirmId(null);
                  await removeDistrictFood(id);
                }}
                className="rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-cream hover:bg-terracotta-dark"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function Tile({ value, label, tone = "forest" }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <span
        className={`block font-display text-3xl font-semibold ${
          tone === "terracotta" ? "text-terracotta" : "text-forest"
        }`}
      >
        {value}
      </span>
      <span className="mt-1 block text-xs text-muted">{label}</span>
    </div>
  );
}
