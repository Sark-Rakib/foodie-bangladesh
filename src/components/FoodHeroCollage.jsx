"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";
import { CATALOG_BY_ID } from "@/data/catalog";

const HERO_FOOD_IDS = [
  "kacchi-biryani",
  "bhapa-pitha",
  "ilish-bhapa",
  "bogura-doi",
  "roshmalai",
  "mejbani-beef",
  "chotpoti",
  "tehari",
];

export default function FoodHeroCollage() {
  const { lang } = useI18n();
  const foods = HERO_FOOD_IDS.map((id) => CATALOG_BY_ID[id]).filter((f) => f?.image);
  if (foods.length < 4) return null;

  const [main, second, third, fourth] = foods;
  const name = (f) => (lang === "en" ? f.nameEn : f.nameBn);

  return (
    <div className="relative aspect-square w-full max-w-xl justify-self-center lg:justify-self-end">
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-orbit hero-orbit--slow" aria-hidden="true">
        <span className="hero-dot" />
      </div>
      <div className="hero-orbit hero-orbit--fast" aria-hidden="true">
        <span className="hero-dot hero-dot--mustard" />
      </div>

      <div className="hero-tile hero-tile--main fade-up">
        <Image
          src={main.image}
          alt={name(main)}
          fill
          priority
          sizes="(max-width: 1024px) 70vw, 40vw"
          className="object-cover"
        />
        <span className="hero-tag">{name(main)}</span>
      </div>

      <div className="hero-tile hero-tile--tl float-a">
        <Image src={second.image} alt={name(second)} fill sizes="20vw" className="object-cover" />
      </div>

      <div className="hero-tile hero-tile--br float-b">
        <Image src={third.image} alt={name(third)} fill sizes="20vw" className="object-cover" />
      </div>

      <div className="hero-tile hero-tile--bl float-c">
        <Image src={fourth.image} alt={name(fourth)} fill sizes="18vw" className="object-cover" />
      </div>

      <div className="hero-badge" aria-hidden="true">
        <span className="hero-badge__num">{foods.length}+</span>
        <span className="hero-badge__label">
          {lang === "en" ? "tastes to add" : "স্বাদ যোগ করুন"}
        </span>
      </div>
    </div>
  );
}
