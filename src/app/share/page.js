import Link from "next/link";
import { MapPinned, Share2, UtensilsCrossed } from "lucide-react";
import { Container } from "@/components/ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Share your food map",
  description:
    "Create your own Bangladesh food map — add the foods you have eaten in each district, then download or share your journey.",
  alternates: { canonical: "/share" },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    siteName: "Foodie Bangladesh",
    title: "My Food Map — Foodie Bangladesh",
    description:
      "I'm tracking what I've eaten across Bangladesh's 64 districts. Build your own food map!",
    url: `${SITE_URL}/share`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Foodie Bangladesh food map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Food Map — Foodie Bangladesh",
    description: "Track what you've eaten across Bangladesh's districts.",
    images: ["/og-image.png"],
  },
};

export default function SharePage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-mustard">
          <UtensilsCrossed className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
          Foodie Bangladesh
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Create your own food map 🇧🇩
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
          Which districts of Bangladesh have you eaten your way through? Add a food and a photo
          to each district on the map, then download a beautiful share card or share your journey
          with friends.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/my-journey"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            <Share2 className="h-4 w-4" />
            Build my food map
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest/5"
          >
            <MapPinned className="h-4 w-4" />
            Explore the map
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-muted">
          Note: your food entries and photos are stored privately in your own browser. This public
          page is only the invitation link — it never exposes your personal entries or photos.
        </p>
      </div>
    </Container>
  );
}
