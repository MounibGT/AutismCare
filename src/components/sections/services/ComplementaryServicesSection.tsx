"use client";

import { Brain, BookOpenCheck, Sparkle, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ComplementaryServicesSection() {
  const t = useTranslations("Services.complementaryServices");

  const complementary = [
    {
      icon: Brain,
      title: t("services.adhd.title"),
      description: t("services.adhd.description"),
    },
    {
      icon: BookOpenCheck,
      title: t("services.selfLearning.title"),
      description: t("services.selfLearning.description"),
    },
    {
      icon: Video,
      title: t("services.paidContent.title"),
      description: t("services.paidContent.description"),
    },
  ];
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-0 top-16 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
            {t("badge")}
          </p>
          <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-12 mx-auto max-w-4xl">
          <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/TherapyMethodsCalming.jpg"
              alt="Complementary therapeutic services"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {complementary.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 inline-flex items-center gap-3 rounded-full border border-primary/35 bg-muted/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          <Sparkle className="h-4 w-4" />
          <span>{t("badge2")}</span>
        </div>
      </div>
    </section>
  );
}
