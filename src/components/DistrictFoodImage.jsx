"use client";

import { useState } from "react";
import { useDistrictFoodImage } from "@/hooks/useDistrictFoods";

/**
 * Renders an image whose source is an IndexedDB reference ("idb:<id>").
 * Shows a graceful placeholder while loading, when the image is missing, or
 * when the stored blob can no longer be decoded.
 */
export default function DistrictFoodImage({ imageId, alt = "", className = "", fallback = null }) {
  const url = useDistrictFoodImage(imageId);
  const [brokenUrl, setBrokenUrl] = useState(null);

  if (!url || url === brokenUrl) {
    return (
      fallback ?? (
        <div
          className={`grid place-items-center bg-paper-deep text-muted ${className}`}
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-wide">…</span>
        </div>
      )
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} onError={() => setBrokenUrl(url)} />;
}
