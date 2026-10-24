import { Suspense } from "react";
import { notFound } from "next/navigation";
import { STORIES, getStory } from "@/data/stories";
import StoryView from "@/components/pages/StoryView";
import { Container } from "@/components/ui";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return {
    title: story.titleBn,
    description: story.summaryEn || story.summaryBn,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: {
      title: story.titleBn,
      description: story.summaryEn || story.summaryBn,
      images: story.cover ? [{ url: story.cover }] : undefined,
      type: "article",
    },
  };
}

async function StoryContent({ params }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  return <StoryView story={story} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<Container className="min-h-[60vh] py-16" />}>
      <StoryContent params={props.params} />
    </Suspense>
  );
}
