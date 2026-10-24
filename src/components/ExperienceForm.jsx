"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useExperiences } from "@/hooks/useExperiences";
import { DIVISIONS_GEO } from "@/data/geo/districtMeta";
import { districtsInDivision } from "@/data/catalog";
import ExperiencePreviewCard from "@/components/ExperiencePreviewCard";
import DownloadImageButton from "@/components/DownloadImageButton";

const EMPTY_FORM = {
  divisionId: "",
  districtId: "",
  foodId: null,
  foodName: "",
  title: "",
  story: "",
  shop: "",
  date: "",
  photo: "",
  lang: "bn",
};

export default function ExperienceForm({
  initial = null,
  presetFood = null,
  presetDivision = null,
  presetDistrict = null,
  onClose,
  onSaved,
}) {
  const { t, lang } = useI18n();
  const { add, update } = useExperiences();
  const previewRef = useRef(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => {
    if (initial) return { ...EMPTY_FORM, ...initial };
    return {
      ...EMPTY_FORM,
      lang,
      foodId: presetFood?.id ?? null,
      foodName: presetFood ? (lang === "en" ? presetFood.nameEn : presetFood.nameBn) : "",
      divisionId: presetFood?.divisionId ?? presetDivision ?? "",
      districtId: presetFood?.districtId ?? presetDistrict ?? "",
    };
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const districts = useMemo(
    () => (form.divisionId ? districtsInDivision(form.divisionId) : []),
    [form.divisionId],
  );

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onDivision = (value) => {
    set({ divisionId: value, districtId: "" });
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ photo: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.story.trim().length < 20 || form.story.length > 600) {
      setError(t("experience.requiredError"));
      return;
    }
    setError("");
    const payload = {
      ...form,
      divisionId: form.divisionId || null,
      districtId: form.districtId || null,
      title: form.title.trim(),
      story: form.story.trim(),
      foodName: form.foodName.trim(),
      shop: form.shop.trim(),
    };
    if (initial) {
      update(initial.id, payload);
    } else {
      add(payload);
    }
    onSaved?.();
    onClose();
  };

  const previewExperience = {
    ...form,
    divisionId: form.divisionId || null,
    districtId: form.districtId || null,
    title: form.title || (lang === "en" ? "Untitled" : "শিরোনামহীন"),
  };

  const heading = initial ? t("experience.update") : t("experience.save");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("experience.formTitle")}
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-cream/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest">{t("experience.formTitle")}</h2>
            <p className="text-xs text-muted">{t("experience.formSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-forest hover:bg-paper"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("experience.division")}>
                <select value={form.divisionId} onChange={(e) => onDivision(e.target.value)} className={inputCls}>
                  <option value="">{t("map.allDivisions")}</option>
                  {DIVISIONS_GEO.map((d) => (
                    <option key={d.id} value={d.id}>
                      {lang === "en" ? d.name : d.nameBn}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("experience.district")}>
                <select
                  value={form.districtId}
                  onChange={(e) => set({ districtId: e.target.value })}
                  className={inputCls}
                  disabled={!form.divisionId}
                >
                  <option value="">{t("common.all")}</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {lang === "en" ? d.name : d.nameBn}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={t("experience.foodName")}>
              <input
                value={form.foodName}
                onChange={(e) => set({ foodName: e.target.value })}
                placeholder={t("experience.foodNamePlaceholder")}
                className={inputCls}
              />
            </Field>

            <Field label={t("experience.title")}>
              <input
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder={t("experience.titlePlaceholder")}
                className={inputCls}
                maxLength={80}
              />
            </Field>

            <Field label={t("experience.story")} hint={t("experience.storyLength")}>
              <textarea
                value={form.story}
                onChange={(e) => set({ story: e.target.value })}
                placeholder={t("experience.storyPlaceholder")}
                rows={5}
                className={`${inputCls} resize-y`}
                maxLength={600}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("experience.shop")} (${t("common.optional")})`}>
                <input
                  value={form.shop}
                  onChange={(e) => set({ shop: e.target.value })}
                  placeholder={t("experience.shopPlaceholder")}
                  className={inputCls}
                />
              </Field>
              <Field label={`${t("experience.visitDate")} (${t("common.optional")})`}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set({ date: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("experience.photo")} (${t("common.optional")})`}>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-forest hover:border-terracotta">
                  <ImagePlus className="h-4 w-4" />
                  {form.photo ? t("experience.removePhoto") : t("experience.choosePhoto")}
                  <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                </label>
                {form.photo && (
                  <button
                    type="button"
                    onClick={() => set({ photo: "" })}
                    className="ml-2 text-xs text-muted underline"
                  >
                    {t("experience.removePhoto")}
                  </button>
                )}
                <p className="mt-1.5 text-[11px] text-muted">{t("experience.photoNote")}</p>
              </Field>
              <Field label={t("experience.language")}>
                <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
                  {["bn", "en"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => set({ lang: code })}
                      aria-pressed={form.lang === code}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        form.lang === code ? "bg-forest text-cream" : "text-forest/70"
                      }`}
                    >
                      {code === "bn" ? "বাংলা" : "English"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {error && <p className="text-sm font-medium text-terracotta-dark">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {t("experience.previewCard")}
            </p>
            <div ref={previewRef} className="rounded-2xl bg-paper/40 p-3">
              <ExperiencePreviewCard experience={previewExperience} lang={form.lang} food={presetFood} />
            </div>
            <p className="text-[11px] text-muted">{t("experience.previewNote")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
              >
                {heading}
              </button>
              <DownloadImageButton
                getNode={() => previewRef.current}
                filename={`${form.foodName || "foodie-bangladesh"}.png`.replace(/\s+/g, "-").toLowerCase()}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta disabled:opacity-50";

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-forest">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </label>
  );
}
