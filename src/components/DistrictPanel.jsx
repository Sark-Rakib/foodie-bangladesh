"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Pencil, Plus, Store, Trash2, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDistrictFoods, removeDistrictFood, useDistrictFoodImage } from "@/hooks/useDistrictFoods";
import { divisionName } from "@/data/catalog";
import { formatNumber } from "@/utils/foodieHelpers";
import DistrictFoodImage from "@/components/DistrictFoodImage";
import DownloadImageButton from "@/components/DownloadImageButton";
import DistrictFoodForm from "@/components/DistrictFoodForm";

export default function DistrictPanel({ district, curatedFoods = [], onClose }) {
  const { t, lang } = useI18n();
  const { byDistrict } = useDistrictFoods();
  const entries = byDistrict(district.id);
  const num = (n) => formatNumber(n, lang);
  const name = lang === "en" ? district.name : district.nameBn;
  const division = divisionName(district.divisionId, lang);

  const [form, setForm] = useState(null); // { mode: "add" | "edit", entry }
  const [detail, setDetail] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const dialogRef = useRef(null);

  // Escape closes the topmost open layer: an open child dialog first, then
  // the panel itself.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (confirmId) setConfirmId(null);
      else if (detail) setDetail(null);
      else if (!form) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [form, detail, confirmId, onClose]);

  // Move focus into an open dialog and restore it on close.
  useEffect(() => {
    if (!detail && !confirmId) return undefined;
    const previous = document.activeElement;
    const node = dialogRef.current;
    node?.focus?.();
    return () => {
      if (previous instanceof HTMLElement) previous.focus?.();
    };
  }, [detail, confirmId]);

  return (
    <>
      <div
        className="pointer-events-auto absolute inset-x-3 bottom-3 z-[500] max-h-[70%] overflow-y-auto rounded-2xl border border-line bg-cream/97 p-4 shadow-2xl backdrop-blur sm:bottom-auto sm:left-3 sm:top-3 sm:max-h-[calc(100%-1.5rem)] sm:w-[340px]"
        role="region"
        aria-label={name}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
              {t("districtFood.districtLabel")}
            </p>
            <h3 className="font-display text-xl font-semibold text-forest">{name}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {lang === "en" ? `${district.nameBn} · ${division}` : `${district.name} · ${division}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-forest hover:bg-paper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-paper px-2.5 py-1 font-medium text-forest">
            {num(curatedFoods.length)} {t("common.foodsCount")}
          </span>
          <span className="rounded-full bg-terracotta/15 px-2.5 py-1 font-medium text-terracotta-dark">
            {num(entries.length)} {t("districtFood.entriesCount")}
          </span>
        </div>

        {curatedFoods.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {curatedFoods.slice(0, 4).map((f) => (
              <li key={f.id}>
                <Link
                  href={`/foods/${f.slug}`}
                  className="inline-block rounded-full border border-line px-2.5 py-1 text-[11px] text-ink/75 hover:border-terracotta hover:text-terracotta"
                >
                  {lang === "en" ? f.nameEn : f.nameBn}
                </Link>
              </li>
            ))}
            {curatedFoods.length > 4 && (
              <li className="inline-block px-1 py-1 text-[11px] text-muted">
                +{num(curatedFoods.length - 4)}
              </li>
            )}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {t("districtFood.myEntries")}
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: "add", entry: null })}
            className="inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1.5 text-[11px] font-semibold text-cream hover:bg-terracotta-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("districtFood.addButton")}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-line bg-paper/50 p-3 text-xs text-muted">
            {t("districtFood.empty")} {t("districtFood.emptyHint")}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                districtName={name}
                onView={() => setDetail(entry)}
                onEdit={() => setForm({ mode: "edit", entry })}
                onDelete={() => setConfirmId(entry.id)}
              />
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <Link
            href={`/districts/${district.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream hover:bg-forest-deep"
          >
            <MapPin className="h-3.5 w-3.5" />
            {t("map.exploreDistrict")}
          </Link>
        </div>
      </div>

      {form && (
        <DistrictFoodForm
          presetDistrict={district.id}
          initial={form.mode === "edit" ? form.entry : null}
          onClose={() => setForm(null)}
          onSaved={() => setForm(null)}
        />
      )}

      {detail && (
        <DetailDialog
          entry={detail}
          districtName={name}
          division={division}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setForm({ mode: "edit", entry: detail });
            setDetail(null);
          }}
          onDelete={() => {
            setConfirmId(detail.id);
            setDetail(null);
          }}
          dialogRef={dialogRef}
        />
      )}

      {confirmId && (
        <div
          className="fixed inset-0 z-[700] grid place-items-center bg-forest-deep/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmId(null)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="w-full max-w-sm rounded-2xl bg-cream p-5 shadow-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-forest">{t("districtFood.deleteConfirm")}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-forest hover:bg-paper"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmId;
                  setConfirmId(null);
                  await removeDistrictFood(id);
                }}
                className="rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-cream hover:bg-terracotta-dark"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EntryRow({ entry, districtName, onView, onEdit, onDelete }) {
  const { t } = useI18n();
  const imageUrl = useDistrictFoodImage(entry.imageId);

  return (
    <li className="flex gap-3 rounded-xl border border-line bg-paper/40 p-2">
      <button
        type="button"
        onClick={onView}
        className="h-14 w-14 shrink-0 overflow-hidden rounded-lg"
        aria-label={t("districtFood.viewEntry")}
      >
        <DistrictFoodImage imageId={entry.imageId} alt={entry.name} className="h-14 w-14 object-cover" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest">{entry.name}</p>
        {entry.description && (
          <p className="line-clamp-2 text-[11px] text-muted">{entry.description}</p>
        )}
        {entry.date && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted">
            <CalendarDays className="h-3 w-3" />
            {entry.date}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {imageUrl && (
          <DownloadImageButton
            src={imageUrl}
            name={entry.name}
            district={districtName}
            compact
          />
        )}
        <button
          type="button"
          onClick={onEdit}
          aria-label={t("common.edit")}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-forest hover:border-terracotta hover:text-terracotta"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("common.delete")}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-forest hover:border-terracotta hover:text-terracotta"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function DetailDialog({ entry, districtName, division, onClose, onEdit, onDelete, dialogRef }) {
  const { t } = useI18n();
  const imageUrl = useDistrictFoodImage(entry.imageId);

  return (
    <div
      className="fixed inset-0 z-[700] flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={entry.name}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream shadow-2xl outline-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <DistrictFoodImage
            imageId={entry.imageId}
            alt={entry.name}
            className="h-56 w-full object-cover"
          />
          {imageUrl && (
            <DownloadImageButton
              src={imageUrl}
              name={entry.name}
              district={districtName}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-[11px] font-semibold text-forest shadow hover:text-terracotta"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-forest shadow hover:text-terracotta"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold text-forest">{entry.name}</h3>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-terracotta">
            {districtName} · {division}
          </p>
          {entry.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{entry.description}</p>
          )}
          <dl className="mt-4 flex flex-col gap-2">
            {entry.shop && (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Store className="h-3.5 w-3.5" />
                <span>{entry.shop}</span>
              </div>
            )}
            {entry.date && (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{entry.date}</span>
              </div>
            )}
          </dl>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-terracotta px-4 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-cream"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("common.edit")}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-forest hover:bg-paper"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
