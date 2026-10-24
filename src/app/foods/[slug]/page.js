import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CATALOG, getFood } from "@/data/catalog";
import FoodView from "@/components/pages/FoodView";
import { Container } from "@/components/ui";

export function generateStaticParams() {
  return CATALOG.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const food = getFood(slug);
  if (!food) return {};
  const description = (food.shortEn || food.shortBn || "").slice(0, 155);
  return {
    title: `${food.nameBn} (${food.nameEn})`,
    description,
    alternates: { canonical: `/foods/${food.slug}` },
    openGraph: {
      title: `${food.nameBn} — ${food.nameEn}`,
      description,
      images: food.image ? [{ url: food.image }] : undefined,
    },
  };
}

async function FoodContent({ params }) {
  const { slug } = await params;
  const food = getFood(slug);
  if (!food) notFound();
  return <FoodView food={food} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<Container className="min-h-[60vh] py-16" />}>
      <FoodContent params={props.params} />
    </Suspense>
  );
}
