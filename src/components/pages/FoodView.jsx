"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageOff, MapPin, PenLine, Tag } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { CATALOG, categoryLabel } from "@/data/catalog";
import { Container, Breadcrumbs, Pill } from "@/components/ui";
import TriedButton from "@/components/TriedButton";
import ExperienceForm from "@/components/ExperienceForm";
import FoodCard from "@/components/FoodCard";

export default function FoodView({ food }) {
  const { t, lang } = useI18n();
  const [formOpen, setFormOpen] = useState(false);

  const name = lang === "en" ? food.nameEn : food.nameBn;
  const alt = lang === "en" ? food.nameBn : food.nameEn;
  const short = lang === "en" ? food.shortEn : food.shortBn;
  const note = lang === "en" ? food.noteEn : food.noteBn;
  const district = lang === "en" ? food.districtEn : food.districtBn;
  const division = lang === "en" ? food.divisionEn : food.divisionBn;

  const related = CATALOG.filter((f) => f.category === food.category && f.id !== food.id).slice(0, 4);

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.explore"), href: "/explore" },
          { label: name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-paper">
          {food.image ? (
            <Image src={food.image} alt={name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted">
              <div className="text-center">
                <ImageOff className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">{t("common.noImage")}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="forest">{categoryLabel(food.category, lang)}</Pill>
            <Pill>{division}</Pill>
            {food.districtId ? (
              <Link href={`/districts/${food.districtId}`}>
                <Pill className="hover:border-terracotta hover:text-terracotta">
                  <MapPin className="h-3.5 w-3.5" />
                  {[food.locality, district].filter(Boolean).join(", ")}
                </Pill>
              </Link>
            ) : (
              <Pill>
                <MapPin className="h-3.5 w-3.5" />
                {district}
              </Pill>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold text-forest sm:text-4xl">{name}</h1>
          <p className="mt-1 text-sm uppercase tracking-[0.16em] text-muted">{alt}</p>

          <p className="mt-5 text-base leading-relaxed text-ink/80">{short}</p>

          {note && (
            <div className="mt-5 rounded-2xl border border-line bg-paper/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">{t("common.edit_note")}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{note}</p>
            </div>
          )}

          {food.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted" />
              {food.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">#{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <TriedButton foodId={food.id} size="md" />
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
            >
              <PenLine className="h-4 w-4" />
              {t("food.experience")}
            </button>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest/5"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("food.backToExplore")}
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-forest">{t("food.related")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        </section>
      )}

      {formOpen && (
        <ExperienceForm presetFood={food} onClose={() => setFormOpen(false)} onSaved={() => setFormOpen(false)} />
      )}
    </Container>
  );
}
