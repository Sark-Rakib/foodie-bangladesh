import { MapPin, Store, CalendarDays } from "lucide-react";
import { districtName, divisionName } from "@/data/catalog";

const CARD_TEXT = {
  bn: {
    kicker: "খাবারের অভিজ্ঞতা",
    tagline: "বাংলাদেশের স্বাদে, জেলায় জেলায়",
    brand: "ফুডি বাংলাদেশ",
    where: "খাওয়া হয়েছে",
    visit: "ভ্রমণ",
    by: "আমার স্বাদের ডায়েরি",
    photoAlt: "খাবারের ছবি",
  },
  en: {
    kicker: "Food Experience",
    tagline: "Discover Bangladesh, One Bite at a Time",
    brand: "Foodie Bangladesh",
    where: "Tasted at",
    visit: "Visited",
    by: "My Taste Diary",
    photoAlt: "Food photo",
  },
};

export default function ExperiencePreviewCard({ experience, lang = "bn", food = null, className = "" }) {
  const text = CARD_TEXT[lang] ?? CARD_TEXT.bn;
  const image = experience.photo || food?.image || "";
  const district = experience.districtId ? districtName(experience.districtId, lang) : "";
  const division = experience.divisionId ? divisionName(experience.divisionId, lang) : "";
  const place = [district, division].filter(Boolean).join(", ");

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-forest/15 bg-cream shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 bg-forest px-5 py-3.5 text-cream">
        <span className="font-display text-sm font-semibold">{text.brand}</span>
        <span className="text-right text-[11px] text-cream/75">{text.tagline}</span>
      </div>

      {image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={text.photoAlt}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          {text.kicker}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-forest">
          {experience.title || experience.foodName}
        </h3>
        {experience.foodName && experience.title && (
          <p className="mt-1 text-sm font-medium text-mustard-deep">{experience.foodName}</p>
        )}

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/80">
          {experience.story}
        </p>

        <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-xs text-ink/70">
          {experience.shop && (
            <span className="inline-flex items-center gap-2">
              <Store className="h-3.5 w-3.5 text-terracotta" />
              {text.where}: {experience.shop}
            </span>
          )}
          {place && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-terracotta" />
              {place}
            </span>
          )}
          {experience.date && (
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-terracotta" />
              {text.visit}: {experience.date}
            </span>
          )}
        </div>
      </div>

      <div className="bg-terracotta px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-cream">
        {text.by}
      </div>
    </article>
  );
}
