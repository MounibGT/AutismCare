"use client";

import {
  Briefcase,
  ShieldPlus,
  ClipboardCheck,
  Workflow,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function JoinUsSection() {
  const t = useTranslations("Contact.joinUs");

  const highlights = [
    {
      icon: ShieldPlus,
      title: t("highlights.matching.title"),
      description: t("highlights.matching.description"),
    },
    {
      icon: ClipboardCheck,
      title: t("highlights.support.title"),
      description: t("highlights.support.description"),
    },
    {
      icon: Workflow,
      title: t("highlights.tools.title"),
      description: t("highlights.tools.description"),
    },
    {
      icon: Sparkles,
      title: t("highlights.flexibility.title"),
      description: t("highlights.flexibility.description"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-background to-accent py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-20 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="space-y-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-muted/40 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{t("badge")}</span>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-border/10 bg-card/85 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
