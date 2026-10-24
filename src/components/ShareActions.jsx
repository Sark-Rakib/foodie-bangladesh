"use client";

import { useState } from "react";
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

function FacebookGlyph({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

/**
 * Read a Blob into a data URL. Used to inline food photos before export, since
 * the image export library cannot fetch/decode blob: URLs on its own.
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Real sharing actions for the food-map card.
 *
 * Honest constraints: Facebook's Share Dialog cannot upload a browser-generated
 * PNG. So "Share on Facebook" opens the official Share Dialog with a public URL
 * (never claims it uploaded the image), and we also offer Download PNG / Copy
 * link / Copy text as separate, verifiable actions.
 */
export default function ShareActions({
  getNode,
  filename = "my-food-map.png",
  sharePath = "/",
  shareText = "",
  className = "",
  exportWidth = 1080,
  exportHeight = 1350,
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState("");

  const copy = async (value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      /* fall through to legacy path */
    }
    try {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  };

  const flash = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath}`
      : `${SITE_URL}${sharePath}`;

  const handleDownload = async () => {
    const node = typeof getNode === "function" ? getNode() : getNode?.current;
    if (!node || busy) return;
    setBusy(true);
    setFailed(false);
    const restore = [];
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      // html-to-image cannot fetch/decode blob: image URLs, which would abort
      // the export. Temporarily swap every <img> to an inline data URL, render
      // the *live* node (so layout is identical), then restore.
      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.currentSrc || img.src;
          if (!src || src.startsWith("data:")) return;
          try {
            const res = await fetch(src, { mode: "cors" });
            if (!res.ok) throw new Error(String(res.status));
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            restore.push({ img, src, srcset: img.getAttribute("srcset") });
            img.removeAttribute("srcset");
            img.src = dataUrl;
          } catch {
            /* leave as-is; html-to-image will placeholder it */
          }
        }),
      );

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: "#faf7f0",
        onImageErrorHandler: () => undefined,
        width: exportWidth,
        height: exportHeight,
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[html-to-image]", e);
      setFailed(true);
    } finally {
      for (const { img, src, srcset } of restore) {
        img.src = src;
        if (srcset != null) img.setAttribute("srcset", srcset);
      }
      setBusy(false);
    }
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(publicUrl);
    const quote = encodeURIComponent(shareText);
    const dialog = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    window.open(dialog, "facebook-share", "width=650,height=620,noopener,noreferrer");
    flash(t("share.shareHint"));
  };

  const handleCopyLink = async () => {
    const ok = await copy(publicUrl);
    flash(ok ? t("share.copied") : t("share.copyFailed"));
  };

  const handleCopyText = async () => {
    const ok = await copy(shareText || publicUrl);
    flash(ok ? t("share.copied") : t("share.copyFailed"));
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? t("share.generating") : t("share.download")}
        </button>

        <button
          type="button"
          onClick={handleFacebook}
          className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f63d4]"
        >
          <FacebookGlyph className="h-4 w-4" />
          {t("share.facebook")}
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-terracotta hover:text-terracotta"
        >
          <Share2 className="h-4 w-4" />
          {t("share.copyLink")}
        </button>

        <button
          type="button"
          onClick={handleCopyText}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-terracotta hover:text-terracotta"
        >
          <Copy className="h-4 w-4" />
          {t("share.copyText")}
        </button>
      </div>

      {toast && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-forest">
          <Check className="h-3.5 w-3.5 text-terracotta" />
          {toast}
        </p>
      )}
      {failed && <p className="mt-3 text-xs text-terracotta-dark">{t("share.generateError")}</p>}
    </div>
  );
}
