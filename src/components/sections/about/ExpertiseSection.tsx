"use client";

import { ShieldCheck, LibraryBig } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ExpertiseSection() {
  const t = useTranslations("About.expertise");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-background to-muted py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-0 top-20 h-48 w-48 -translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-10 top-1/3 h-80 w-80 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              <ShieldCheck className="h-5 w-5 text-foreground" />
              <span>{t("badge")}</span>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("description1")}
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("description2")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/ProfessionalTherapistPortraitWoman.jpg"
                  alt="Professional therapist"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/ProfessionalTherapistPortraitMan.jpg"
                  alt="Professional therapist"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ExpertiseCard
                icon={<ShieldCheck className="h-6 w-6 text-card" />}
                title={t("cards.confidentiality.title")}
                description={t("cards.confidentiality.description")}
              />
              <ExpertiseCard
                icon={<LibraryBig className="h-6 w-6 text-card" />}
                title={t("cards.quality.title")}
                description={t("cards.quality.description")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExpertiseCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-card/80 p-6 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-foreground p-3">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
