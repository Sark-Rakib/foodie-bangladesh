import StoriesView from "@/components/pages/StoriesView";

export const metadata = {
  title: "খাবারের গল্প",
  description: "রান্নাঘর, ঋতু আর স্মৃতি নিয়ে সম্পাদকীয় অণুগল্প — পিঠা, বিরিয়ানি, ইলিশ আর চায়ের আড্ডা।",
  alternates: { canonical: "/stories" },
};

export default function Page() {
  return <StoriesView />;
}
