import MyJourneyView from "@/components/pages/JourneyView";

export const metadata = {
  title: "আমার খাবার-যাত্রা",
  description:
    "যা খেয়েছেন তার হিসাব, ফুডি লেভেল আর আপনার লেখা অভিজ্ঞতা — সব এক জায়গায়।",
  alternates: { canonical: "/my-journey" },
};

export default function Page() {
  return <MyJourneyView />;
}
