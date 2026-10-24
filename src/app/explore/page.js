import { Suspense } from "react";
import ExploreView from "@/components/pages/ExploreView";

export const metadata = {
  title: "খাবার খুঁজুন",
  description:
    "নাম, বিভাগ, জেলা বা ধরন দিয়ে বাংলাদেশের ঐতিহ্যবাহী খাবার খুঁজুন — আর যেগুলো চেখেছেন তা টিক দিয়ে রাখুন।",
  alternates: { canonical: "/explore" },
};

async function ExploreBody({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const category = typeof sp.category === "string" ? sp.category : "";
  const division = typeof sp.division === "string" ? sp.division : "";
  return <ExploreView initialCategory={category} initialDivision={division} />;
}

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<ExploreView />}>
      <ExploreBody searchParams={searchParams} />
    </Suspense>
  );
}
