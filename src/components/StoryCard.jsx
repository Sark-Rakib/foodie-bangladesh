"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function StoryCard({ story }) {
  const { t, lang } = useI18n();
  const title = lang === "en" ? story.titleEn : story.titleBn;
  const summary = lang === "en" ? story.summaryEn : story.summaryBn;

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream">
      <Link href={`/stories/${story.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-paper">
        {story.cover ? (
          <Image
            src={story.cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted">{t("common.noImage")}</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-semibold text-terracotta">
          {t("stories.editorial")}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-forest group-hover:text-terracotta">
          <Link href={`/stories/${story.slug}`}>{title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/70">{summary}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Clock className="h-3.5 w-3.5" />
          {story.readMinutes} {t("common.min")} {t("common.read")}
        </p>
      </div>
    </article>
  );
}
