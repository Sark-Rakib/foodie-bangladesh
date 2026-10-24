"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/utils/localStore";
import { deleteImage, idFromRef, putImage, resolveImageUrl, revokeUrl } from "@/utils/idbImageStore";

const STORAGE_KEY = "foodie-bd:district-foods-v1";
const EMPTY = [];

const store = createLocalStore(STORAGE_KEY, {
  fallback: EMPTY,
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return EMPTY;
      const clean = parsed.filter(
        (e) => e && typeof e === "object" && typeof e.id === "string" && typeof e.districtId === "string",
      );
      return clean.length ? clean : EMPTY;
    } catch {
      return EMPTY;
    }
  },
});

export function newDistrictFoodId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `df-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file) {
  if (!file) return { ok: false, reason: "empty" };
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return { ok: false, reason: "type" };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
}

function normalize(entry) {
  return {
    id: entry.id,
    districtId: entry.districtId,
    divisionId: entry.divisionId ?? null,
    name: (entry.name ?? "").trim(),
    description: (entry.description ?? "").trim(),
    shop: (entry.shop ?? "").trim(),
    date: entry.date ?? "",
    imageId: entry.imageId ?? null,
    createdAt: entry.createdAt ?? Date.now(),
    updatedAt: entry.updatedAt ?? Date.now(),
  };
}

export function useDistrictFoods() {
  const foods = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const byDistrict = useCallback(
    (districtId) => foods.filter((f) => f.districtId === districtId),
    [foods],
  );

  const get = useCallback((id) => foods.find((f) => f.id === id) ?? null, [foods]);

  const countByDistrict = useCallback(() => {
    const counts = {};
    for (const f of foods) counts[f.districtId] = (counts[f.districtId] ?? 0) + 1;
    return counts;
  }, [foods]);

  return { foods, byDistrict, get, countByDistrict, count: foods.length };
}

/**
 * Add (or update) a district food entry together with an optional new image Blob.
 * Returns { ok, id } — never reports success when the image failed to save.
 */
export async function saveDistrictFood({ id = null, fields, imageBlob = null, removeImage = false }) {
  const recordId = id ?? newDistrictFoodId();
  const existing = store.getSnapshot().find((f) => f.id === recordId) ?? null;

  let imageId = existing?.imageId ?? null;

  if (removeImage) {
    if (imageId) await deleteImage(imageId);
    imageId = null;
  }

  if (imageBlob) {
    const newImageId = `${recordId}-${Date.now().toString(36)}`;
    const savedRef = await putImage(newImageId, imageBlob);
    if (!savedRef) return { ok: false, reason: "image" };
    if (existing?.imageId) await deleteImage(existing.imageId);
    imageId = idFromRef(savedRef) ?? newImageId;
  }

  const record = normalize({
    ...existing,
    ...fields,
    id: recordId,
    imageId,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  const wrote = store.update((list) =>
    existing ? list.map((f) => (f.id === recordId ? record : f)) : [record, ...list],
  );

  if (!wrote) {
    // Metadata could not be persisted (e.g. storage full). Roll back any image
    // we just wrote so we never orphan blobs behind a failed save.
    if (imageBlob && imageId && imageId !== existing?.imageId) await deleteImage(imageId);
    return { ok: false, reason: "storage" };
  }

  return { ok: true, id: recordId };
}

export async function removeDistrictFood(id) {
  const existing = store.getSnapshot().find((f) => f.id === id) ?? null;
  if (existing?.imageId) await deleteImage(existing.imageId);
  store.update((list) => list.filter((f) => f.id !== id));
}

/**
 * Resolve a single image id to an object URL, revoking it on unmount / change.
 * Returns null while loading or when no image exists.
 */
export function useDistrictFoodImage(imageId) {
  const [state, setState] = useState({ id: null, url: null });
  const urlRef = useRef(null);

  useEffect(() => {
    if (!imageId) return undefined;
    let alive = true;
    resolveImageUrl(imageId).then((next) => {
      if (!alive) {
        revokeUrl(next);
        return;
      }
      if (urlRef.current && urlRef.current !== next) revokeUrl(urlRef.current);
      urlRef.current = next;
      setState({ id: imageId, url: next });
    });
    return () => {
      alive = false;
    };
  }, [imageId]);

  useEffect(
    () => () => {
      if (urlRef.current) revokeUrl(urlRef.current);
    },
    [],
  );

  return imageId && state.id === imageId ? state.url : null;
}

/**
 * Resolve many image ids to a { [id]: url } map in one pass.
 * Revokes previously created URLs when the set changes or on unmount.
 */
export function useResolvedImages(imageIds) {
  const key = useMemo(() => imageIds.filter(Boolean).join("|"), [imageIds]);
  const [state, setState] = useState({ key: "", map: {} });
  const mapRef = useRef({});

  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    const ids = key.split("|");
    const created = {};
    Promise.all(
      ids.map(async (id) => {
        const url = await resolveImageUrl(id);
        if (url) created[id] = url;
      }),
    ).then(() => {
      const previous = mapRef.current;
      if (!alive) {
        Object.values(created).forEach(revokeUrl);
        return;
      }
      for (const [id, url] of Object.entries(previous)) {
        if (created[id] !== url) revokeUrl(url);
      }
      mapRef.current = created;
      setState({ key, map: created });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(
    () => () => {
      Object.values(mapRef.current).forEach(revokeUrl);
    },
    [],
  );

  return state.key === key ? state.map : {};
}

export { store as districtFoodsStore };
