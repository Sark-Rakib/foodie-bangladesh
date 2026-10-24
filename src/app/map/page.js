import MapView from "@/components/pages/MapView";

export const metadata = {
  title: "খাবারের ম্যাপ",
  description:
    "বাংলাদেশের ইন্টারঅ্যাকটিভ খাবারের ম্যাপ — জেলায় ক্লিক করে দেখুন সেখানে কী খাওয়া হয় আর আপনার অভিজ্ঞতা যোগ করুন।",
  alternates: { canonical: "/map" },
};

export default function Page() {
  return <MapView />;
}
