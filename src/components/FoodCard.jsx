"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin, PenLine } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { useExperiences } from "@/hooks/useExperiences";
import { categoryLabel } from "@/data/catalog";
import TriedButton from "@/components/TriedButton";

export default function FoodCard({ food, onOpen, className = "" }) {
  const { t, lang } = useI18n();
  const { hasTried } = useFoodie();
  const { byFood } = useExperiences();

  const name = lang === "en" ? food.nameEn : food.nameBn;
  const short = lang === "en" ? food.shortEn : food.shortBn;
  const place = [food.locality, lang === "en" ? food.districtEn : food.districtBn]
    .filter(Boolean)
    .join(", ");
  const tried = hasTried(food.id);
  const storyCount = byFood(food.id).length;

  const media = (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
      {food.image ? (
        <Image
          src={food.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted">
          <div className="text-center">
            <ImageOff className="mx-auto h-6 w-6" />
            <p className="mt-2 text-xs">{t("common.noImage")}</p>
          </div>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-forest/85 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur-sm">
        {categoryLabel(food.category, lang)}
      </span>
      {tried && (
        <span className="absolute right-3 top-3 rounded-full bg-terracotta px-2.5 py-1 text-[11px] font-semibold text-cream">
          {t("common.tried")}
        </span>
      )}
      {storyCount > 0 && (
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-semibold text-forest">
          <PenLine className="h-3 w-3" />
          {storyCount}
        </span>
      )}
    </div>
  );

  return (
    <article
      className={`card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-cream ${className}`}
    >
      {onOpen ? (
        <button type="button" onClick={() => onOpen(food)} className="block w-full text-left" aria-label={name}>
          {media}
        </button>
      ) : (
        <Link href={`/foods/${food.slug}`} className="block w-full" aria-label={name}>
          {media}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4">
        {onOpen ? (
          <button type="button" onClick={() => onOpen(food)} className="text-left">
            <h3 className="font-display text-lg font-semibold leading-snug text-forest group-hover:text-terracotta">
              {name}
            </h3>
          </button>
        ) : (
          <Link href={`/foods/${food.slug}`}>
            <h3 className="font-display text-lg font-semibold leading-snug text-forest group-hover:text-terracotta">
              {name}
            </h3>
          </Link>
        )}
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {place}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/70">{short}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <TriedButton foodId={food.id} />
        <Link
          href={`/foods/${food.slug}`}
          className="text-xs font-semibold text-forest transition-colors hover:text-terracotta"
        >
          {t("common.viewDetails")}
        </Link>
      </div>
    </article>
  );
}
