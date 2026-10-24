"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = () =>
  typeof window !== "undefined" ? window.location.origin : "";

const getServerSnapshot = () => "";

/**
 * Reads the browser origin without causing a hydration mismatch:
 * the server renders "" and the client fills it in after hydration.
 */
export function useOrigin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
