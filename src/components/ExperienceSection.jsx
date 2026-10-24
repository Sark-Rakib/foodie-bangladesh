"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useExperiences } from "@/hooks/useExperiences";
import ExperienceCard from "@/components/ExperienceCard";
import ExperienceForm from "@/components/ExperienceForm";
import { EmptyState } from "@/components/ui";

export default function ExperienceSection({
  districtId = null,
  divisionId = null,
  showHeading = true,
  className = "",
}) {
  const { t } = useI18n();
  const { experiences } = useExperiences();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const list = districtId
    ? experiences.filter((e) => e.districtId === districtId)
    : divisionId
      ? experiences.filter((e) => e.divisionId === divisionId)
      : experiences;

  const startNew = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <section className={className}>
      {showHeading && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest">{t("journey.myExperiences")}</h2>
            <p className="mt-1 text-sm text-ink/60">{t("experience.formSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            <NotebookPen className="h-4 w-4" />
            {t("common.addExperience")}
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-5 w-5" />}
          title={t("journey.noExperiences")}
          body={t("experience.formSubtitle")}
          action={
            <button
              type="button"
              onClick={startNew}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep"
            >
              {t("common.writeExperience")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onEdit={(e) => {
                setEditing(e);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {open && (
        <ExperienceForm
          initial={editing}
          presetDistrict={districtId}
          presetDivision={divisionId}
          onClose={() => setOpen(false)}
          onSaved={() => setOpen(false)}
        />
      )}
    </section>
  );
}
