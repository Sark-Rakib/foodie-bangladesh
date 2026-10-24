"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useFoodie } from "@/components/FoodieProvider";
import { useI18n } from "@/i18n/LanguageProvider";

export default function TriedButton({ foodId, size = "sm", withLabel = true, className = "" }) {
  const { hasTried, toggleTried } = useFoodie();
  const { t } = useI18n();
  const tried = hasTried(foodId);

  const pad = size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <button
      type="button"
      onClick={() => toggleTried(foodId)}
      aria-pressed={tried}
      title={tried ? t("common.unmarkTried") : t("common.markTried")}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors ${pad} ${
        tried
          ? "border-terracotta bg-terracotta text-cream hover:bg-terracotta-dark"
          : "border-forest/25 text-forest hover:border-terracotta hover:text-terracotta"
      } ${className}`}
    >
      {tried ? <CheckCircle2 className={icon} /> : <Circle className={icon} />}
      {withLabel && (tried ? t("common.tried") : t("common.markTried"))}
    </button>
  );
}
