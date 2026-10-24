"use client";

import { MapPin, UtensilsCrossed } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { districtName } from "@/data/catalog";
import BangladeshMapSvg from "@/components/BangladeshMapSvg";

/**
 * The shareable food-map result card.
 * Pure presentation so it can be exported to PNG with html-to-image.
 *
 * Props:
 *  - entries: [{ id, name, districtId, image }]  (image = resolved blob/data URL or "")
 *  - exploredIds: district ids the user has added foods to
 *  - displayName: optional user name
 *  - shareUrl: public site URL shown on the card
 */

const CARD = {
  bn: {
    kicker: "আমার ফুড জার্নি",
    brand: "ফুডি বাংলাদেশ",
    brandLatin: "Foodie Bangladesh",
    districts: "জেলা",
    foods: "খাবার",
    invite: "আপনিও তৈরি করুন নিজের ফুড ম্যাপ",
    tagline: "বাংলাদেশের কোন জেলায় কী খেয়েছেন?",
  },
  en: {
    kicker: "My Food Journey",
    brand: "ফুডি বাংলাদেশ",
    brandLatin: "Foodie Bangladesh",
    districts: "districts",
    foods: "foods",
    invite: "Create your own food map",
    tagline: "What have you eaten across Bangladesh?",
  },
};

export default function FoodMapShareCard({
  entries = [],
  exploredIds = [],
  displayName = "",
  shareUrl = "",
  lang = "bn",
  className = "",
  selectedId = null,
}) {
  const { t } = useI18n();
  const text = CARD[lang] ?? CARD.bn;
  const foods = entries.length;
  const districts = exploredIds.length;
  const selectedLabel = selectedId ? districtName(selectedId, lang) : "";

  const summary = t("share.summaryOne")
    .replace("{foods}", String(foods))
    .replace("{districts}", String(districts));

  const thumbs = entries.filter((e) => e.image).slice(0, 5);
  const names = entries.slice(0, 6);

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-forest/15 bg-cream shadow-lg ${className}`}
    >
      {/* Header band */}
      <div className="flex items-center justify-between gap-3 bg-forest px-6 py-4 text-cream">
        <span className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-deep text-mustard">
            <UtensilsCrossed className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">{text.brand}</span>
            <span className="block text-[9px] uppercase tracking-[0.24em] text-cream/70">
              {text.brandLatin}
            </span>
          </span>
        </span>
        <span className="text-right text-[11px] font-medium text-mustard">{text.kicker}</span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1.05fr_1fr]">
        {/* Map */}
        <div className="relative bg-water p-4">
          <BangladeshMapSvg
            exploredIds={exploredIds}
            className="h-full max-h-[320px] w-full"
            highlightColor="#c65d3a"
            selectedId={selectedId}
            selectedLabel={selectedLabel}
          />
        </div>

        {/* Stats + summary */}
        <div className="flex flex-col justify-center gap-4 border-t border-line p-6 sm:border-l sm:border-t-0">
          {displayName && (
            <p className="font-display text-sm font-semibold text-mustard-deep line-clamp-3">{displayName}</p>
          )}
          <div className="flex gap-6">
            <div>
              <span className="block font-display text-4xl font-semibold leading-none text-forest">
                {foods}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted">
                {text.foods}
              </span>
            </div>
            <div>
              <span className="block font-display text-4xl font-semibold leading-none text-terracotta">
                {districts}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted">
                {text.districts}
              </span>
            </div>
          </div>
          <p className="font-display text-lg font-semibold leading-snug text-forest line-clamp-3">{summary}</p>
          <p className="text-xs leading-relaxed text-ink/60">{text.tagline}</p>
        </div>
      </div>

      {/* Food thumbnails */}
      {thumbs.length > 0 && (
        <div className="flex gap-2 border-t border-line bg-paper/40 px-6 py-4">
          {thumbs.map((e) => (
            <div
              key={e.id}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-cream bg-paper-deep"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image} alt={e.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* District + food names */}
      {names.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-6 pb-4">
          {names.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] text-ink/75"
            >
              <MapPin className="h-3 w-3 text-terracotta" />
              {e.name}
              <span className="text-muted">· {districtName(e.districtId, lang)}</span>
            </span>
          ))}
          {entries.length > names.length && (
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] text-muted">
              +{entries.length - names.length}
            </span>
          )}
        </div>
      )}

      {/* Footer invite */}
      <div className="flex items-center justify-between gap-3 bg-terracotta px-6 py-3.5 text-cream">
        <span className="flex items-center gap-2 text-[11px] font-semibold">
          <MapPin className="h-3.5 w-3.5" />
          {text.invite}
        </span>
        {shareUrl && (
          <span className="text-[11px] font-medium text-cream/80">{shareUrl}</span>
        )}
      </div>
    </article>
  );
}
