import { FOODS, PAN_DIVISION, PAN_DISTRICT } from "@/data/foods";
import { FOOD_SHORT_EN, FOOD_NOTE_EN } from "@/data/foodsEn";
import { foodImage } from "@/data/foodImages";
import { DISTRICTS_GEO, DIVISIONS_GEO } from "@/data/geo/districtMeta";

export { DISTRICTS_GEO, DIVISIONS_GEO };

/** New taxonomy id (old dataset category -> redesigned category). */
const CATEGORY_MAP = {
  bhat: "rice",
  mangsho: "meat",
  mach: "fish",
  mishti: "sweets",
  pitha: "bakery",
  street: "street",
  nasta: "snacks",
  shobji: "regional",
  pan: "drinks",
};

/** Breads that were filed under snacks but belong to the bakery shelf. */
const CATEGORY_OVERRIDES = {
  bakarkhani: "bakery",
  porota: "bakery",
  luchi: "bakery",
};

export const FOOD_CATEGORIES = [
  { id: "rice", label: "ভাত ও পোলাও", labelEn: "Rice Dishes" },
  { id: "meat", label: "মাংস ও মুরগি", labelEn: "Meat & Poultry" },
  { id: "fish", label: "মাছ", labelEn: "Fish" },
  { id: "sweets", label: "মিষ্টি ও দই", labelEn: "Sweets & Doi" },
  { id: "bakery", label: "পিঠা ও বেকারি", labelEn: "Pitha & Bakery" },
  { id: "snacks", label: "নাশতা ও স্ন্যাকস", labelEn: "Snacks" },
  { id: "street", label: "স্ট্রিট ফুড", labelEn: "Street Food" },
  { id: "drinks", label: "পানীয়", labelEn: "Drinks" },
  { id: "regional", label: "আঞ্চলিক পদ", labelEn: "Regional Specialties" },
];

const CATEGORY_BY_ID = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.id, c]));

const DIVISION_BY_BN = Object.fromEntries(DIVISIONS_GEO.map((d) => [d.nameBn, d.id]));
const DISTRICT_BY_BN = Object.fromEntries(DISTRICTS_GEO.map((d) => [d.nameBn, d.id]));

export const CATALOG = FOODS.map((food) => {
  const category = CATEGORY_OVERRIDES[food.id] ?? CATEGORY_MAP[food.category] ?? "regional";
  const divisionId = DIVISION_BY_BN[food.division] ?? null;
  const districtId = DISTRICT_BY_BN[food.district] ?? null;
  const division = divisionId ? DIVISIONS_GEO.find((d) => d.id === divisionId) : null;
  const district = districtId ? DISTRICTS_GEO.find((d) => d.id === districtId) : null;
  return {
    id: food.id,
    slug: food.id,
    nameBn: food.name,
    nameEn: food.nameEn,
    shortBn: food.short,
    shortEn: FOOD_SHORT_EN[food.id] ?? "",
    noteBn: food.note ?? "",
    noteEn: FOOD_NOTE_EN[food.id] ?? "",
    category,
    divisionId,
    districtId,
    locality: food.locality ?? "",
    divisionBn: division ? division.nameBn : "সব বিভাগ",
    divisionEn: division ? division.name : "All divisions",
    districtBn: district ? district.nameBn : "সব অঞ্চল",
    districtEn: district ? district.name : "All regions",
    tags: food.tags ?? [],
    image: foodImage(food.id),
  };
});

export const CATALOG_BY_SLUG = Object.fromEntries(CATALOG.map((f) => [f.slug, f]));
export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map((f) => [f.id, f]));
export const TOTAL_CATALOG = CATALOG.length;

export const CATEGORY_COUNTS = CATEGORY_COUNTS_BUILD(CATALOG);

function CATEGORY_COUNTS_BUILD(list) {
  const counts = {};
  for (const f of list) counts[f.category] = (counts[f.category] ?? 0) + 1;
  return counts;
}

export function getFood(slug) {
  return CATALOG_BY_SLUG[slug] ?? null;
}

export function categoryLabel(id, lang = "bn") {
  const c = CATEGORY_BY_ID[id];
  if (!c) return id;
  return lang === "en" ? c.labelEn : c.label;
}

export function divisionName(divisionId, lang = "bn") {
  const d = DIVISIONS_GEO.find((x) => x.id === divisionId);
  if (!d) return lang === "en" ? "All divisions" : "সব বিভাগ";
  return lang === "en" ? d.name : d.nameBn;
}

export function districtName(districtId, lang = "bn") {
  const d = DISTRICTS_GEO.find((x) => x.id === districtId);
  if (!d) return lang === "en" ? "All regions" : "সব অঞ্চল";
  return lang === "en" ? d.name : d.nameBn;
}

export function foodsByDivision(divisionId) {
  return CATALOG.filter((f) => f.divisionId === divisionId);
}

export function foodsByDistrict(districtId) {
  return CATALOG.filter((f) => f.districtId === districtId);
}

export function foodsByCategory(categoryId) {
  return CATALOG.filter((f) => f.category === categoryId);
}

/** District-level index used by the map and district pages. */
export const DISTRICT_INDEX = Object.fromEntries(
  DISTRICTS_GEO.map((d) => {
    const foods = CATALOG.filter((f) => f.districtId === d.id);
    return [d.id, { ...d, foods, foodCount: foods.length }];
  }),
);

export function districtsInDivision(divisionId) {
  return DISTRICTS_GEO.filter((d) => d.divisionId === divisionId);
}

export function divisionStats(divisionId) {
  const districts = districtsInDivision(divisionId).length;
  const foods = foodsByDivision(divisionId).length;
  return { districts, foods };
}

export const PAN = { division: PAN_DIVISION, district: PAN_DISTRICT };
