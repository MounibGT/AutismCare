"use client";

import { AlertTriangle, PhoneCall } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EmergencySection() {
  const t = useTranslations("Contact.emergency");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-accent via-muted to-background py-16">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-16 bottom-0 h-56 w-56 translate-y-1/3 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[3rem] border border-border/15 bg-card/80 p-10 text-center shadow-xl backdrop-blur">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("description")}
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/35 bg-muted/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <PhoneCall className="h-4 w-4" />
            <span>{t("callToAction")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
