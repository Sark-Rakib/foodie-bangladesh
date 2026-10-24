"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createLocalStore } from "@/utils/localStore";

const STORAGE_KEY = "foodie-bd:profile-v1";
const EMPTY = { name: "" };

const store = createLocalStore(STORAGE_KEY, {
  fallback: EMPTY,
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return EMPTY;
      return { name: typeof parsed.name === "string" ? parsed.name : "" };
    } catch {
      return EMPTY;
    }
  },
});

export function useProfile() {
  const profile = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const setName = useCallback((name) => {
    store.write({ name: (name ?? "").slice(0, 40) });
  }, []);

  return { profile, name: profile.name, setName };
}

export { store as profileStore };
