"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import {
  saveDistrictFood,
  validateImageFile,
} from "@/hooks/useDistrictFoods";
import { districtById } from "@/data/geo/districtMeta";
import DistrictFoodImage from "@/components/DistrictFoodImage";

const EMPTY = {
  districtId: "",
  divisionId: "",
  name: "",
  description: "",
  shop: "",
  date: "",
};

export default function DistrictFoodForm({ presetDistrict = null, initial = null, onClose, onSaved }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState(() => (initial ? { ...EMPTY, ...initial } : { ...EMPTY, districtId: presetDistrict ?? "" }));
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const district = useMemo(
    () => districtById(form.districtId || presetDistrict || initial?.districtId || ""),
    [form.districtId, presetDistrict, initial],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.ok) {
      setError(check.reason === "size" ? t("districtFood.imageSizeError") : t("districtFood.imageTypeError"));
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError("");
    setBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const clearNewImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBlob(null);
    setPreviewUrl(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const districtId = form.districtId || presetDistrict || initial?.districtId;
    if (!districtId) {
      setError(t("districtFood.nameRequired"));
      return;
    }
    if (!form.name.trim()) {
      setError(t("districtFood.nameRequired"));
      return;
    }
    const hasExisting = Boolean(initial?.imageId) && !removeImage;
    if (!blob && !hasExisting) {
      setError(t("districtFood.photoRequired"));
      return;
    }

    setSaving(true);
    setError("");
    const result = await saveDistrictFood({
      id: initial?.id ?? null,
      fields: {
        districtId,
        divisionId: district?.divisionId ?? form.divisionId ?? null,
        name: form.name,
        description: form.description,
        shop: form.shop,
        date: form.date,
      },
      imageBlob: blob,
      removeImage,
    });
    setSaving(false);

    if (!result.ok) {
      setError(
        result.reason === "storage"
          ? t("districtFood.saveError")
          : t("districtFood.imageSaveError"),
      );
      return;
    }
    onSaved?.(result.id);
    onClose?.();
  };

  const heading = initial ? t("districtFood.editTitle") : t("districtFood.addTitle");
  const dName = district ? (lang === "en" ? district.name : district.nameBn) : "";

  return (
    <div
      className="fixed inset-0 z-[700] flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-cream/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest">{heading}</h2>
            <p className="text-xs text-muted">
              {dName ? `${t("districtFood.district")}: ${dName}` : t("districtFood.addSubtitle")}
            </p>
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

        <form onSubmit={submit} className="flex flex-col gap-4 p-5">
          <Field label={t("districtFood.foodName")}>
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder={t("districtFood.foodNamePlaceholder")}
              className={inputCls}
              maxLength={80}
              autoFocus
            />
          </Field>

          <Field label={t("districtFood.description")}>
            <textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder={t("districtFood.descriptionPlaceholder")}
              rows={3}
              maxLength={400}
              className={`${inputCls} resize-y`}
            />
          </Field>

          <Field label={t("districtFood.date")}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label={t("districtFood.shop")}>
            <input
              value={form.shop}
              onChange={(e) => set({ shop: e.target.value })}
              placeholder={t("districtFood.shopPlaceholder")}
              className={inputCls}
              maxLength={80}
            />
          </Field>

          <Field label={t("districtFood.photo")} hint={t("districtFood.photoHint")}>
            {(previewUrl || (initial?.imageId && !removeImage)) && (
              <div className="relative mb-2 overflow-hidden rounded-xl border border-line bg-paper">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <DistrictFoodImage imageId={initial.imageId} className="h-44 w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    clearNewImage();
                    setRemoveImage(true);
                  }}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-forest shadow hover:text-terracotta"
                  aria-label={t("districtFood.removePhoto")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-forest hover:border-terracotta">
              <ImagePlus className="h-4 w-4" />
              {previewUrl || (initial?.imageId && !removeImage)
                ? t("districtFood.changePhoto")
                : t("districtFood.choosePhoto")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPick}
                className="hidden"
              />
            </label>
          </Field>

          {error && <p className="text-sm font-medium text-terracotta-dark">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? t("districtFood.update") : t("districtFood.save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-forest hover:bg-paper"
            >
              {t("common.cancel")}
            </button>
          </div>

          <p className="text-[11px] text-muted">{t("districtFood.localNote")}</p>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta";

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-forest">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </label>
  );
}
