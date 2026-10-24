import HomeView from "@/components/pages/HomeView";

export const metadata = {
  title: "ফুডি বাংলাদেশ — বাংলাদেশের স্বাদে, জেলায় জেলায়",
  description:
    "আট বিভাগ, চৌষট্টি জেলা, শতাধিক ঐতিহ্যবাহী খাবার — খাবার খুঁজুন, ম্যাপে ঘুরুন, নিজের স্বাদের অভিজ্ঞতা লিখুন।",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeView />;
}
