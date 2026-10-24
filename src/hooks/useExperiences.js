"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createLocalStore } from "@/utils/localStore";

const STORAGE_KEY = "foodie-bd:experiences-v1";
const EMPTY = [];

const store = createLocalStore(STORAGE_KEY, {
  fallback: EMPTY,
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return EMPTY;
      const clean = parsed.filter((e) => e && typeof e === "object" && typeof e.id === "string");
      return clean.length ? clean : EMPTY;
    } catch {
      return EMPTY;
    }
  },
});

export function newExperienceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useExperiences() {
  const experiences = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const add = useCallback((entry) => {
    const now = Date.now();
    const record = {
      id: newExperienceId(),
      foodId: entry.foodId ?? null,
      foodName: entry.foodName ?? "",
      divisionId: entry.divisionId ?? null,
      districtId: entry.districtId ?? null,
      title: entry.title ?? "",
      story: entry.story ?? "",
      shop: entry.shop ?? "",
      date: entry.date ?? "",
      photo: entry.photo ?? "",
      lang: entry.lang === "en" ? "en" : "bn",
      createdAt: now,
      updatedAt: now,
    };
    store.update((list) => [record, ...list]);
    return record.id;
  }, []);

  const update = useCallback((id, patch) => {
    store.update((list) =>
      list.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)),
    );
  }, []);

  const remove = useCallback((id) => {
    store.update((list) => list.filter((e) => e.id !== id));
  }, []);

  const byDistrict = useCallback(
    (districtId) => experiences.filter((e) => e.districtId === districtId),
    [experiences],
  );

  const byFood = useCallback(
    (foodId) => experiences.filter((e) => e.foodId === foodId),
    [experiences],
  );

  const get = useCallback((id) => experiences.find((e) => e.id === id) ?? null, [experiences]);

  return { experiences, count: experiences.length, add, update, remove, byDistrict, byFood, get };
}

export { store as experiencesStore };
