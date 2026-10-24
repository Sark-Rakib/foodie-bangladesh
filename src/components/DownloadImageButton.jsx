"use client";

import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

/**
 * Turn a name + district into a safe download filename, e.g.
 * "খিচুড়ি" + "ঢাকা" -> "khichuri-dhaka.jpg" style when latin is available.
 */
export function downloadFilename(name, district, src = "") {
  const ext = (() => {
    const fromSrc = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(src);
    if (fromSrc) return fromSrc[1].toLowerCase();
    return "jpg";
  })();
  const slug = (value) =>
    String(value || "")
      .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
  const parts = [slug(name), slug(district)].filter(Boolean);
  const base = parts.length ? parts.join("-") : "foodie-bangladesh";
  return `${base}.${ext}`;
}

/**
 * Downloads an image to the user's device.
 *
 * Both curated photos (same-origin "/images/...") and user uploads (blob: URLs
 * resolved from IndexedDB) are same-origin, so we fetch the bytes and save them
 * via an <a download> anchor with a meaningful filename. This never opens the
 * image in a new tab.
 */
export default function DownloadImageButton({
  src,
  name = "",
  district = "",
  filename,
  className = "",
  compact = false,
}) {
  const { t } = useI18n();
  const [state, setState] = useState("idle"); // idle | busy | done | error

  const download = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!src || state === "busy") return;
    setState("busy");
    try {
      const res = await fetch(src, { mode: "cors", credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || downloadFilename(name, district, src);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      // Last resort: if the bytes can't be fetched (e.g. unexpected CORS),
      // still trigger a real download attempt rather than a new tab.
      try {
        const link = document.createElement("a");
        link.href = src;
        link.download = filename || downloadFilename(name, district, src);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setState("done");
        window.setTimeout(() => setState("idle"), 2200);
      } catch {
        setState("error");
        window.setTimeout(() => setState("idle"), 2600);
      }
    }
  };

  const label =
    state === "error" ? t("districtFood.downloadError") : t("districtFood.downloadImage");

  return (
    <button
      type="button"
      onClick={download}
      disabled={!src || state === "busy"}
      aria-label={label}
      title={label}
      className={
        className ||
        `inline-flex items-center gap-1.5 rounded-full border border-line bg-cream font-semibold text-forest transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-50 ${
          compact ? "h-8 w-8 justify-center" : "px-3 py-1.5 text-[11px]"
        }`
      }
    >
      {state === "busy" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-3.5 w-3.5 text-terracotta" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {!compact && (
        <span>
          {state === "done"
            ? t("districtFood.downloadDone")
            : state === "error"
              ? t("districtFood.downloadError")
              : t("districtFood.downloadImage")}
        </span>
      )}
    </button>
  );
}
