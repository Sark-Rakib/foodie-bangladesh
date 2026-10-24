import AboutView from "@/components/pages/AboutView";

export const metadata = {
  title: "পরিচিতি",
  description: "ফুডি বাংলাদেশ কী, কোথা থেকে তথ্য, আর আপনার লেখা অভিজ্ঞতা কোথায় থাকে — সব এক নজরে।",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutView />;
}
