"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useFoodie } from "@/components/FoodieProvider";
import MapBoundary from "@/components/MapBoundary";
import { useI18n } from "@/i18n/LanguageProvider";

const Map = dynamic(() => import("@/components/BangladeshFoodMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[420px] w-full place-items-center rounded-2xl border border-line bg-paper/50 text-sm text-muted">
      …
    </div>
  ),
});

export default function MapEmbed({
  heightClass = "h-[60vh] min-h-[420px]",
  selectedId: selectedProp,
  onSelect: onSelectProp,
  showControls = true,
  displayName = "",
}) {
  const { triedIds } = useFoodie();
  const { t } = useI18n();
  const [internalSelected, setInternalSelected] = useState(null);
  const controlled = selectedProp !== undefined;
  const selected = controlled ? selectedProp : internalSelected;
  const setSelected = controlled ? onSelectProp : setInternalSelected;

  return (
    <MapBoundary fallbackText={t("common.errorBody")} retryText={t("common.retry")}>
<Map
        triedIds={triedIds}
        selectedId={selected}
        onSelect={setSelected}
        heightClass={heightClass}
        showControls={showControls}
        displayName={displayName}
/>
    </MapBoundary>
  );
}
