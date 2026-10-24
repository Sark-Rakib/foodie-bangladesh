"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "foodie-bd:tried-v1";
const listeners = new Set();
const EMPTY = [];

let cache = { raw: null, value: EMPTY };

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw) {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const clean = parsed.filter((x) => typeof x === "string");
    return clean.length ? clean : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  const raw = readRaw();
  if (cache.raw !== raw) {
    cache = { raw, value: parse(raw) };
  }
  return cache.value;
}

function getServerSnapshot() {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  emit();
}

export function useFoodieProgress() {
  const triedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTried = useCallback((id) => {
    const current = getSnapshot();
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  const markTried = useCallback((id) => {
    const current = getSnapshot();
    if (!current.includes(id)) write([...current, id]);
  }, []);

  const clearAll = useCallback(() => write([]), []);

  const hasTried = useCallback((id) => triedIds.includes(id), [triedIds]);

  return { triedIds, toggleTried, markTried, clearAll, hasTried };
}
