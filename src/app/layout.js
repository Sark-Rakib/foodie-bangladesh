import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { FoodieProvider } from "@/components/FoodieProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ফুডি বাংলাদেশ — বাংলাদেশের স্বাদে, জেলায় জেলায়",
    template: "%s | ফুডি বাংলাদেশ",
  },
  description:
    "কাচ্চি থেকে ভাপা পিঠা, চুইঝাল থেকে বগুড়ার দই — আট বিভাগ, চৌষট্টি জেলা, শতাধিক ঐতিহ্যবাহী খাবার। খাবার খুঁজুন, ম্যাপে ঘুরুন, নিজের অভিজ্ঞতা লিখুন।",
  keywords: [
    "বাংলাদেশের খাবার",
    "Bangladeshi food",
    "কাচ্চি বিরিয়ানি",
    "পিঠা",
    "স্ট্রিট ফুড",
    "জেলার খাবার",
    "Foodie Bangladesh",
  ],
  authors: [{ name: "Foodie Bangladesh" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    siteName: "Foodie Bangladesh",
    title: "ফুডি বাংলাদেশ — বাংলাদেশের স্বাদে, জেলায় জেলায়",
    description: "৮ বিভাগ, ৬৪ জেলা, ১০০+ ঐতিহ্যবাহী খাবার — আর আপনার নিজের স্বাদের যাত্রা।",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Foodie Bangladesh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ফুডি বাংলাদেশ",
    description: "৮ বিভাগ, ৬৪ জেলা, ১০০+ ঐতিহ্যবাহী খাবার।",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#173f35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <FoodieProvider>
            <Header />
            <main id="main" className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </FoodieProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
