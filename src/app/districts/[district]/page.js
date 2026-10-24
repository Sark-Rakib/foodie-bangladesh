import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DISTRICTS_GEO } from "@/data/geo/districtMeta";
import { DISTRICT_INDEX } from "@/data/catalog";
import DistrictView from "@/components/pages/DistrictView";
import { Container } from "@/components/ui";

export function generateStaticParams() {
  return DISTRICTS_GEO.map((d) => ({ district: d.id }));
}

export async function generateMetadata({ params }) {
  const { district } = await params;
  const d = DISTRICT_INDEX[district];
  if (!d) return {};
  return {
    title: `${d.nameBn} জেলার খাবার`,
    description: `${d.nameBn} জেলার বিখ্যাত খাবার ও স্থানীয় স্বাদ — ফুডি বাংলাদেশ।`,
    alternates: { canonical: `/districts/${d.id}` },
  };
}

async function DistrictContent({ params }) {
  const { district } = await params;
  if (!DISTRICT_INDEX[district]) notFound();
  return <DistrictView districtId={district} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<Container className="min-h-[60vh] py-16" />}>
      <DistrictContent params={props.params} />
    </Suspense>
  );
}
