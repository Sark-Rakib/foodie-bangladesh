"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { STORIES } from "@/data/stories";
import { Container } from "@/components/ui";
import StoryCard from "@/components/StoryCard";

export default function StoriesView() {
  const { t } = useI18n();

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t("stories.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">{t("stories.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
    </Container>
  );
}
