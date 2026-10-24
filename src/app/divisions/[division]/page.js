import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DIVISIONS_GEO } from "@/data/geo/districtMeta";
import { foodsByDivision, districtsInDivision } from "@/data/catalog";
import DivisionView from "@/components/pages/DivisionView";
import { Container } from "@/components/ui";

export function generateStaticParams() {
  return DIVISIONS_GEO.map((d) => ({ division: d.id }));
}

export async function generateMetadata({ params }) {
  const { division } = await params;
  const d = DIVISIONS_GEO.find((x) => x.id === division);
  if (!d) return {};
  const foods = foodsByDivision(d.id).length;
  return {
    title: `${d.nameBn} বিভাগের খাবার`,
    description: `${d.nameBn} বিভাগের ${districtsInDivision(d.id).length} জেলার ঐতিহ্যবাহী ${foods}টি খাবার — খুঁজুন ও অভিজ্ঞতা লিখুন।`,
    alternates: { canonical: `/divisions/${d.id}` },
  };
}

async function DivisionContent({ params }) {
  const { division } = await params;
  if (!DIVISIONS_GEO.some((d) => d.id === division)) notFound();
  return <DivisionView divisionId={division} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<Container className="min-h-[60vh] py-16" />}>
      <DivisionContent params={props.params} />
    </Suspense>
  );
}
