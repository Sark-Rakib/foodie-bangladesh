"use client";

/**
 * Minimal localStorage-backed external store factory.
 * Works with React's useSyncExternalStore and avoids setState-in-effect.
 */
export function createLocalStore(key, { fallback, parse, serialize }) {
  const listeners = new Set();
  let cache = { raw: undefined, value: fallback };

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const getSnapshot = () => {
    const raw = readRaw();
    if (raw !== cache.raw) {
      let value = fallback;
      if (raw != null) {
        try {
          const parsed = parse ? parse(raw) : JSON.parse(raw);
          value = parsed ?? fallback;
        } catch {
          value = fallback;
        }
      }
      cache = { raw, value };
    }
    return cache.value;
  };

  const getServerSnapshot = () => fallback;

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    const onStorage = (e) => {
      if (e.key === key || e.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const write = (value) => {
    let ok = true;
    try {
      window.localStorage.setItem(key, serialize ? serialize(value) : JSON.stringify(value));
    } catch {
      /* storage unavailable or quota exceeded */
      ok = false;
    }
    emit();
    return ok;
  };

  const update = (updater) => write(updater(getSnapshot()));

  return { getSnapshot, getServerSnapshot, subscribe, write, update };
}
