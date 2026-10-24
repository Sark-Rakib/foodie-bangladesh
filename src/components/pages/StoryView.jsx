"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { STORIES } from "@/data/stories";
import { Container, Breadcrumbs } from "@/components/ui";
import StoryCard from "@/components/StoryCard";

export default function StoryView({ story }) {
  const { t, lang } = useI18n();
  const title = lang === "en" ? story.titleEn : story.titleBn;
  const summary = lang === "en" ? story.summaryEn : story.summaryBn;
  const body = lang === "en" ? story.bodyEn : story.bodyBn;
  const related = STORIES.filter((s) => s.slug !== story.slug).slice(0, 3);

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("stories.back"), href: "/stories" },
          { label: title },
        ]}
      />

      <article className="mx-auto max-w-3xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
          {t("stories.editorial")}
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/70">{summary}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          {story.readMinutes} {t("common.min")} {t("common.read")} · {story.date}
        </p>

        {story.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-paper">
            <Image src={story.cover} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="mt-8 flex flex-col gap-5">
          {body.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-ink/85">{para}</p>
          ))}
        </div>

        <Link
          href="/stories"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest hover:border-forest hover:bg-forest/5"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("stories.back")}
        </Link>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-forest">{t("stories.related")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
