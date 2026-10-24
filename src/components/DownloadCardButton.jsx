"use client";

import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Exports a DOM section to a share-card style PNG and downloads it.
 *
 * Mirrors ShareActions' approach: inline every <img> (including blob: URLs from
 * IndexedDB uploads) as data URLs first, since html-to-image can't fetch them,
 * then render the live node so the layout is identical to what the user sees.
 */
/**
 * Exports a DOM section to a share-card style PNG and downloads it.
 *
 * Mirrors ShareActions' approach: inline every <img> (including blob: URLs from
 * IndexedDB uploads) as data URLs first, since html-to-image cannot fetch them,
 * then render the live node so the layout is identical to what the user sees.
 *
 * Optionally specify `exportWidth` and `exportHeight` to force a fixed canvas
 * size for the exported image, independent of the node's natural responsive width.
 */
export default function DownloadCardButton({
  getNode,
  filename = "foodie-bangladesh-map.png",
  className = "",
  label,
  exportWidth,
  exportHeight,
}) {
  const { t } = useI18n();
  const [state, setState] = useState("idle"); // idle | busy | done | error

  const handleDownload = async () => {
    const node = typeof getNode === "function" ? getNode() : getNode?.current;
    if (!node || state === "busy") return;
    setState("busy");
    const restore = [];
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.currentSrc || img.src;
          if (!src || src.startsWith("data:")) return;
          try {
            const res = await fetch(src, { mode: "cors", credentials: "same-origin" });
            if (!res.ok) throw new Error(String(res.status));
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            restore.push({ img, src, srcset: img.getAttribute("srcset") });
            img.removeAttribute("srcset");
            img.src = dataUrl;
          } catch {
            /* leave as-is */
          }
        }),
      );

      const { toPng } = await import("html-to-image");
      const options = {
        pixelRatio: 3,
        backgroundColor: "#faf7f0",
        onImageErrorHandler: () => undefined,
      };
      if (exportWidth != null) options.width = exportWidth;
      if (exportHeight != null) options.height = exportHeight;
      const dataUrl = await toPng(node, options);
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[html-to-image]", e);
      setState("error");
      window.setTimeout(() => setState("idle"), 2600);
    } finally {
      for (const { img, src, srcset } of restore) {
        img.src = src;
        if (srcset) img.setAttribute("srcset", srcset);
      }
    }
  };

  const text =
    state === "error"
      ? t("districtFood.downloadError")
      : state === "done"
        ? t("districtFood.downloadDone")
        : label || t("districtFood.downloadCard");

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={state === "busy"}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-forest transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-50"
      }
    >
      {state === "busy" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-4 w-4 text-terracotta" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{text}</span>
    </button>
  );
}
