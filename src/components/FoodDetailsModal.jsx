"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin, PenLine, Tag, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { categoryLabel } from "@/data/catalog";
import TriedButton from "@/components/TriedButton";

export default function FoodDetailsModal({ food, onClose, onWriteExperience }) {
  const { t, lang } = useI18n();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!food) return null;

  const name = lang === "en" ? food.nameEn : food.nameBn;
  const alt = lang === "en" ? food.nameBn : food.nameEn;
  const short = lang === "en" ? food.shortEn : food.shortBn;
  const note = lang === "en" ? food.noteEn : food.noteBn;
  const district = lang === "en" ? food.districtEn : food.districtBn;
  const division = lang === "en" ? food.divisionEn : food.divisionBn;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper">
          {food.image ? (
            <Image src={food.image} alt={name} fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted">
              <div className="text-center">
                <ImageOff className="mx-auto h-7 w-7" />
                <p className="mt-2 text-sm">{t("common.noImage")}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-forest transition-colors hover:bg-cream"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-forest px-2.5 py-1 font-medium text-cream">
              {categoryLabel(food.category, lang)}
            </span>
            <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-forest">
              {division}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-forest">
              <MapPin className="h-3.5 w-3.5" />
              {[food.locality, district].filter(Boolean).join(", ")}
            </span>
          </div>

          <h2 className="mt-4 font-display text-3xl font-semibold text-forest">{name}</h2>
          <p className="mt-1 text-sm uppercase tracking-[0.16em] text-muted">{alt}</p>

          <p className="mt-5 text-base leading-relaxed text-ink/80">{short}</p>

          {note && (
            <div className="mt-5 rounded-2xl border border-line bg-paper/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                {t("food.about")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{note}</p>
            </div>
          )}

          {food.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted" />
              {food.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <TriedButton foodId={food.id} size="md" />
            {onWriteExperience && (
              <button
                type="button"
                onClick={() => onWriteExperience(food)}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
              >
                <PenLine className="h-4 w-4" />
                {t("common.writeExperience")}
              </button>
            )}
            <Link
              href={`/foods/${food.slug}`}
              onClick={onClose}
              className="rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest/5"
            >
              {t("common.viewDetails")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
