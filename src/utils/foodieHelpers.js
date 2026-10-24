import { FOODS, CATEGORIES, DIVISIONS, PAN_DIVISION } from "@/data/foods";
import { foodImage } from "@/data/foodImages";

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]));
export const TOTAL_FOODS = FOODS.length;

/**
 * Level thresholds match the product spec:
 * 0 -> in the making, 1-20 -> beginner, 21-50 -> certified,
 * 51-80 -> master, 81+ -> ultimate legend.
 * Titles and blurbs live in the i18n dictionary under `levels`.
 */
export const LEVELS = [
  { key: "l0", min: 0 },
  { key: "l1", min: 1 },
  { key: "l2", min: 21 },
  { key: "l3", min: 51 },
  { key: "l4", min: 81 },
];

export function levelFor(count) {
  let current = LEVELS[0];
  let next = LEVELS[1] ?? null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (count >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  return { index: LEVELS.indexOf(current), current, next };
}

export function progressWithinLevel(count) {
  const { current, next } = levelFor(count);
  if (!next) return 100;
  const span = next.min - current.min;
  return Math.round(((count - current.min) / span) * 100);
}

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function divisionLabel(id) {
  return DIVISIONS.find((d) => d.id === id)?.label ?? id;
}

export function districtLabel(food) {
  return food.district;
}

export function placeLabel(food) {
  const bits = [];
  if (food.locality) bits.push(food.locality);
  bits.push(food.district === "বিভিন্ন অঞ্চল" ? food.division : food.district);
  return bits.join(", ");
}

export function foodThumb(food) {
  return foodImage(food.id);
}

export function topDivision(triedIds) {
  const counts = {};
  for (const id of triedIds) {
    const food = FOOD_BY_ID[id];
    if (!food || food.division === PAN_DIVISION) continue;
    counts[food.division] = (counts[food.division] || 0) + 1;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}

export function topCategory(triedIds) {
  const counts = {};
  for (const id of triedIds) {
    const food = FOOD_BY_ID[id];
    if (!food) continue;
    counts[food.category] = (counts[food.category] || 0) + 1;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}

export function divisionCoverage(triedIds) {
  const covered = new Set();
  for (const id of triedIds) {
    const food = FOOD_BY_ID[id];
    if (food && food.division !== PAN_DIVISION) covered.add(food.division);
  }
  return { covered: covered.size, total: DIVISIONS.length };
}

const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const ID_INDEX = Object.fromEntries(FOODS.map((f, i) => [f.id, i]));

/** Encode tried-food ids as a compact base36 bitset string. */
export function encodeTriedIds(triedIds) {
  const bits = new Array(FOODS.length).fill("0");
  for (const id of triedIds) {
    const idx = ID_INDEX[id];
    if (idx !== undefined) bits[idx] = "1";
  }
  const joined = bits.join("");
  let value = 0n;
  for (const ch of joined) value = (value << 1n) | BigInt(ch === "1" ? 1 : 0);
  let out = "";
  let v = value;
  do {
    out = ID_CHARS[Number(v % 36n)] + out;
    v /= 36n;
  } while (v > 0n);
  return out;
}

export function decodeTriedIds(code) {
  if (!code || typeof code !== "string") return [];
  let value = 0n;
  for (const ch of code.toLowerCase()) {
    const digit = ID_CHARS.indexOf(ch);
    if (digit < 0) return [];
    value = value * 36n + BigInt(digit);
  }
  const bits = value.toString(2).padStart(FOODS.length, "0");
  const ids = [];
  for (let i = 0; i < FOODS.length; i++) {
    if (bits[bits.length - FOODS.length + i] === "1") ids.push(FOODS[i].id);
  }
  return ids;
}

export function shareUrlFor(code) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  if (code) url.searchParams.set("c", code);
  return url.toString();
}

export function bnNumber(n) {
  return String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
}

export function formatNumber(n, lang = "bn") {
  return lang === "en" ? String(n) : bnNumber(n);
}
