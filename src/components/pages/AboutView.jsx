"use client";

import Link from "next/link";
import { Database, Info, ShieldCheck, Target } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { Container, Stat } from "@/components/ui";
import { TOTAL_CATALOG, DIVISIONS_GEO } from "@/data/catalog";

export default function AboutView() {
  const { t, lang } = useI18n();
  const num = (n) => (lang === "en" ? String(n) : String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]));

  const blocks = [
    { icon: Target, title: t("about.whatWeDo"), body: t("about.whatWeDoBody") },
    { icon: Info, title: t("about.journey"), body: t("about.journeyBody") },
    { icon: Database, title: t("about.dataNote"), body: t("about.dataNoteBody") },
    { icon: ShieldCheck, title: t("about.editorialNote"), body: t("about.editorialNoteBody") },
  ];

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t("about.title")}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/70">{t("about.intro")}</p>
      </header>

      <div className="mt-8 flex flex-wrap gap-8 rounded-2xl border border-line bg-cream p-6">
        <Stat value={num(TOTAL_CATALOG)} label={t("home.stat1")} />
        <Stat value={num(DIVISIONS_GEO.length)} label={t("home.stat2")} />
        <Stat value={num(64)} label={t("home.stat3")} />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {blocks.map(({ icon: Icon, title, body }) => (
          <section key={title} className="rounded-2xl border border-line bg-cream p-6">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-mustard/20 text-mustard-deep">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold text-forest">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6">
        <p className="text-sm leading-relaxed text-terracotta-dark">{t("about.disclaimer")}</p>
      </div>

      <Link
        href="/explore"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta-dark"
      >
        {t("about.cta")}
      </Link>
    </Container>
  );
}
