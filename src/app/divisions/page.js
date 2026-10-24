import DivisionsView from "@/components/pages/DivisionsView";

export const metadata = {
  title: "বিভাগ ও জেলা",
  description: "আট বিভাগ আর চৌষট্টি জেলার নিজস্ব স্বাদ — বিভাগ ধরে ধরে খাবার ঘুরে দেখুন।",
  alternates: { canonical: "/divisions" },
};

export default function Page() {
  return <DivisionsView />;
}
