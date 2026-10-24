"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { Container } from "@/components/ui";
import MapEmbed from "@/components/MapEmbed";
import DistrictDirectory from "@/components/DistrictDirectory";

export default function MapView() {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t("map.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">{t("map.subtitle")}</p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="order-2 lg:order-1">
          <MapEmbed
            heightClass="h-[58vh] min-h-[420px] lg:h-[74vh]"
            selectedId={selectedId}
            onSelect={setSelectedId}
            showControls={false}
          />
        </div>
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[74vh] lg:max-h-[calc(100vh-6rem)]">
          <DistrictDirectory selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">{t("map.dataNote")}</p>
    </Container>
  );
}
