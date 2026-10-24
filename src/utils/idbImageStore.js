"use client";

/**
 * IndexedDB-backed image store for user-uploaded food photos.
 *
 * Large base64 image data must NOT live in localStorage (quota + parse cost),
 * so images are stored as Blobs here and only a small reference ("idb:<id>")
 * is kept in the localStorage metadata records.
 *
 * The API is promise-based and safe to call from any client component.
 * It degrades gracefully (resolves null / no-ops) when IndexedDB is unavailable.
 */

const DB_NAME = "foodie-bd-media";
const DB_VERSION = 1;
const STORE = "images";

export const IMAGE_REF_PREFIX = "idb:";

let dbPromise = null;

function hasIndexedDB() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDB() {
  if (!hasIndexedDB()) return Promise.resolve(null);
  if (!indexedDB) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function tx(db, mode, fn) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE, mode);
      const store = transaction.objectStore(STORE);
      const result = fn(store);
      transaction.oncomplete = () => resolve(result?.result ?? result);
      transaction.onerror = () => resolve(null);
      transaction.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function imageRef(id) {
  return id ? `${IMAGE_REF_PREFIX}${id}` : "";
}

export function isImageRef(value) {
  return typeof value === "string" && value.startsWith(IMAGE_REF_PREFIX);
}

export function idFromRef(value) {
  return isImageRef(value) ? value.slice(IMAGE_REF_PREFIX.length) : null;
}

/** Persist a Blob and return its reference string ("idb:<id>"). */
export async function putImage(id, blob) {
  const db = await openDB();
  if (!db) return null;
  await tx(db, "readwrite", (store) => store.put({ id, blob, savedAt: Date.now() }));
  return imageRef(id);
}

export async function getImage(id) {
  const db = await openDB();
  if (!db || !id) return null;
  const row = await tx(db, "readonly", (store) => store.get(id));
  return row?.blob ?? null;
}

/** Resolve an image reference to an object URL the browser can render. */
export async function resolveImageUrl(ref) {
  if (!ref || typeof ref !== "string") return null;
  // The metadata record stores either a prefixed ref ("idb:<id>") or a bare id.
  const id = isImageRef(ref) ? idFromRef(ref) : ref;
  const blob = await getImage(id);
  if (!blob) return null;
  try {
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function deleteImage(id) {
  const db = await openDB();
  if (!db || !id) return;
  await tx(db, "readwrite", (store) => store.delete(id));
}

export function revokeUrl(url) {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}
