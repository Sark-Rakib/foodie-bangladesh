"use client";

import { useRef, useState } from "react";
import { Eye, PenLine, Trash2, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useExperiences } from "@/hooks/useExperiences";
import { districtName, divisionName, getFood } from "@/data/catalog";
import ExperiencePreviewCard from "@/components/ExperiencePreviewCard";
import DownloadImageButton from "@/components/DownloadImageButton";

export default function ExperienceCard({ experience, onEdit }) {
  const { t, lang } = useI18n();
  const { remove } = useExperiences();
  const [viewing, setViewing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const previewRef = useRef(null);

  const food = experience.foodId ? getFood(experience.foodId) : null;
  const district = experience.districtId ? districtName(experience.districtId, lang) : "";
  const division = experience.divisionId ? divisionName(experience.divisionId, lang) : "";
  const place = [district, division].filter(Boolean).join(", ");

  return (
    <article className="rounded-2xl border border-line bg-cream p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-forest">{experience.title}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {[experience.foodName, place, experience.date].filter(Boolean).join(" · ")}
          </p>
        </div>
        {experience.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={experience.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/75">{experience.story}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs">
        <button
          type="button"
          onClick={() => setViewing(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold text-forest hover:border-terracotta hover:text-terracotta"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("common.preview")}
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(experience)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold text-forest hover:border-terracotta hover:text-terracotta"
          >
            <PenLine className="h-3.5 w-3.5" />
            {t("journey.editStory")}
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold text-terracotta-dark hover:bg-terracotta/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("journey.deleteStory")}
        </button>
        {confirmDelete && (
          <span className="inline-flex items-center gap-2 text-ink/70">
            {t("journey.deleteConfirm")}
            <button
              type="button"
              onClick={() => {
                remove(experience.id);
                setConfirmDelete(false);
              }}
              className="font-semibold text-terracotta-dark underline"
            >
              {t("common.delete")}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="underline">
              {t("common.cancel")}
            </button>
          </span>
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setViewing(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-4 shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-forest">{t("experience.previewCard")}</h3>
              <button
                type="button"
                onClick={() => setViewing(false)}
                aria-label={t("common.close")}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-forest hover:bg-paper"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div ref={previewRef}>
              <ExperiencePreviewCard experience={experience} lang={experience.lang} food={food} />
            </div>
            <div className="mt-4">
              <DownloadImageButton
                getNode={() => previewRef.current}
                filename={`${experience.foodName || experience.title || "experience"}.png`
                  .replace(/\s+/g, "-")
                  .toLowerCase()}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
