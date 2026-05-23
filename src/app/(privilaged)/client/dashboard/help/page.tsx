"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  BookOpen,
  User,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactOption {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  href: string;
  badge?: string;
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "Comment prendre rendez-vous avec un professionnel ?",
    answer:
      "Pour prendre rendez-vous, accédez à la page 'Mes rendez-vous' dans votre tableau de bord. Cliquez sur 'Nouveau rendez-vous', sélectionnez un professionnel selon vos préférences, choisissez un créneau disponible et validez votre réservation.",
    category: "appointments",
  },
  {
    id: "2",
    question: "Comment payer pour mes séances ?",
    answer:
      "Vous pouvez payer via carte de crédit, débit ou virement bancaire. Lesoptions de paiement sont proposées lors de la réservation. Vos informations de paiement sont sécurisées et stockées de manière chiffrée.",
    category: "billing",
  },
  {
    id: "3",
    question: "Puis-je annuler ou reprogrammer un rendez-vous ?",
    answer:
      "Oui, vous pouvez annuler ou reprogrammer jusqu'à 24 heures avant le rendez-vous. Pour ce faire, allez dans 'Mes rendez-vous', sélectionnez le rendez-vous concerné et cliquez sur 'Modifier' ou 'Annuler'.",
    category: "appointments",
  },
  {
    id: "4",
    question: "Comment accéder à la bibliothèque de ressources ?",
    answer:
      "La bibliothèque de ressources est accessible depuis votre tableau de bord. Vous y trouverez des articles, vidéos, méditations guidées et guides sur divers sujets de santé mentale. Certaines ressources sont gratuites, d'autres payantes.",
    category: "resources",
  },
  {
    id: "5",
    question: "Que faire si j'ai un problème technique pendant une séance ?",
    answer:
      "En cas de problème technique, essayez de rafraîchir votre navigateur ou de redémarrer votre connexion. Si le problème persiste, contactez notre équipe de support via le chat en direct ou par email pour une assistance immédiate.",
    category: "technical",
  },
  {
    id: "6",
    question: "Comment mettre à jour mon profil médical ?",
    answer:
      "Accédez à la section 'Profil' dans votre tableau de bord. Vous pouvez y mettre à jour vos informations personnelles, votre profil médical et vos préférences de traitement. Ces informations aident nos professionnels à mieux vous accompagner.",
    category: "profile",
  },
  {
    id: "7",
    question: "Les séances sont-elles confidentielles ?",
    answer:
      "Absolument. Toutes vos séances et informations personnelles sont strictement confidentielles. Nos professionnels sont bound par le secret professionnel et toutes les données sont chiffrées et protégées.",
    category: "privacy",
  },
  {
    id: "8",
    question: "Comment fonctionne le système de matching avec les professionnels ?",
    answer:
      "Notre système analyse votre profil, vos besoins et préférences pour vous proposer les professionnels les plus adaptés. Vous pouvez également consulter les profils détaillés et choisir vous-même si vous le souhaitez.",
    category: "matching",
  },
  {
    id: "9",
    question: "Puis-je consulter un professionnel pour un proche ?",
    answer:
      "Oui, vous pouvez prendre rendez-vous pour un proche en sélectionnant l'option 'Pour quelqu'un d'autre' lors de la réservation. Vous devrez fournir les informations nécessaires pour le suivi.",
    category: "appointments",
  },
  {
    id: "10",
    question: "Comment demander un remboursement ?",
    answer:
      "Les demandes de remboursement doivent être adressées à notre équipe de support dans les 30 jours suivant la séance. Incluez votre numéro de réservation et la raison de votre demande. Les remboursements sont traités sous 5-10 jours ouvrables.",
    category: "billing",
  },
];

const contactOptions: ContactOption[] = [
  {
    icon: MessageCircle,
    title: "Chat en direct",
    description: "Obtenez une réponse rapide de notre équipe",
    action: "Démarrer une conversation",
    href: "#chat",
    badge: "24/7",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Contactez-nous pour des questions détaillées",
    action: "support@jecheminement.com",
    href: "mailto:support@jecheminement.com",
  },
  {
    icon: Phone,
    title: "Téléphone",
    description: "Parlez à un agent pour une assistance personnalisée",
    action: "1-800-XXX-XXXX",
    href: "tel:1800000000",
    badge: "Lun-Ven 9h-17h",
  },
];

const quickGuides = [
  {
    icon: Calendar,
    title: "Guide de prise de rendez-vous",
    description: "Apprenez à réserver et gérer vos séances",
    duration: "3 min",
    category: "appointments",
  },
  {
    icon: CreditCard,
    title: "Guide de paiement",
    description: "Comprenez les options et processus de paiement",
    duration: "4 min",
    category: "billing",
  },
  {
    icon: Video,
    title: "Guide des séances vidéo",
    description: "Conseils pour une expérience optimale en visioconférence",
    duration: "5 min",
    category: "technical",
  },
  {
    icon: FileText,
    title: "Guide du profil médical",
    description: "Comment remplir et mettre à jour votre profil",
    duration: "3 min",
    category: "profile",
  },
  {
    icon: BookOpen,
    title: "Guide de la bibliothèque",
    description: "Explorez et accédez aux ressources disponibles",
    duration: "4 min",
    category: "resources",
  },
  {
    icon: User,
    title: "Guide de communication",
    description: "Conseils pour maximiser vos séances",
    duration: "6 min",
    category: "communication",
  },
];

const categories = [
  { id: "all", label: "Tous" },
  { id: "appointments", label: "Rendez-vous" },
  { id: "billing", label: "Facturation" },
  { id: "technical", label: "Technique" },
  { id: "profile", label: "Profil" },
  { id: "resources", label: "Ressources" },
  { id: "privacy", label: "Confidentialité" },
  { id: "matching", label: "Matching" },
];

export default function ClientHelpPage() {
  const t = useTranslations("Client.help");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    subject: "",
    message: "",
    priority: "normal",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactFormData({ subject: "", message: "", priority: "normal" });
      setShowContactForm(false);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="rounded-3xl border border-border/20 bg-linear-to-br from-primary/10 via-card to-card/80 p-8 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              {t("badge")}
            </div>
            <h1 className="font-serif text-3xl font-light text-foreground lg:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="rounded-3xl bg-card/70 p-6 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">{t("responseTime")}</p>
            <p className="mt-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("averageResponse")}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="grid gap-6 md:grid-cols-3">
        {contactOptions.map(({ icon: Icon, title, description, action, href, badge }) => (
          <a
            key={title}
            href={href}
            className="group relative overflow-hidden rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                {badge && (
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                    {badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <span>{action}</span>
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </a>
        ))}
      </section>

      {/* Search and Category Filter */}
      <section className="rounded-3xl border border-border/20 bg-card/60 p-6 shadow-inner">
        <div className="space-y-4">
          <div className="relative flex items-center">
            <MessageSquare className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-border/40 bg-card/80 py-4 pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border/40 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-border/20 bg-card/80 p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-light text-foreground">
                {t("faqTitle")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredFaqs.length} {t("results")}
              </span>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-border/20 bg-card/60 transition hover:border-primary/30"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="pr-4 font-medium text-foreground">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="border-t border-border/20 px-5 pb-5 pt-3">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/40 bg-card/60 p-8 text-center">
                <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">{t("noResults")}</p>
              </div>
            )}
          </section>

          {/* Contact Form */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-light text-foreground">
                {t("contactTitle")}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContactForm(!showContactForm)}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {showContactForm ? t("hideForm") : t("showForm")}
              </Button>
            </div>

            {showContactForm && (
              <>
                {formSubmitted ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-8 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
                    <p className="mt-4 font-medium text-foreground">{t("formSuccess")}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t("formSuccessDesc")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("subjectLabel")}
                      </label>
                      <Input
                        value={contactFormData.subject}
                        onChange={(e) =>
                          setContactFormData({ ...contactFormData, subject: e.target.value })
                        }
                        placeholder={t("subjectPlaceholder")}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("messageLabel")}
                      </label>
                      <Textarea
                        value={contactFormData.message}
                        onChange={(e) =>
                          setContactFormData({ ...contactFormData, message: e.target.value })
                        }
                        placeholder={t("messagePlaceholder")}
                        rows={5}
                        required
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("priorityLabel")}
                      </label>
                      <div className="flex gap-3">
                        {["low", "normal", "high"].map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() =>
                              setContactFormData({ ...contactFormData, priority })
                            }
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              contactFormData.priority === priority
                                ? priority === "high"
                                  ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                  : priority === "normal"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : "border-border/40 bg-card/80 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {t(`priority.${priority}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full gap-2 rounded-full py-5 text-base">
                      <Send className="h-4 w-4" />
                      {t("submitButton")}
                    </Button>
                  </form>
                )}
              </>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Guides */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
            <h3 className="font-serif text-xl font-light text-foreground mb-5">
              {t("guidesTitle")}
            </h3>
            <div className="space-y-4">
              {quickGuides.map((guide) => (
                <div
                  key={guide.title}
                  className="group flex items-start gap-4 rounded-2xl border border-border/20 bg-card/60 p-4 transition hover:border-primary/30"
                >
                  <div className="rounded-full bg-primary/10 p-2.5">
                    <guide.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {guide.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">{guide.description}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{guide.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Support Hours */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
            <h3 className="font-serif text-xl font-light text-foreground mb-4">
              {t("hoursTitle")}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("chat")}</span>
                <span className="font-medium text-foreground">24/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("email")}</span>
                <span className="font-medium text-foreground">{t("emailHours")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("phone")}</span>
                <span className="font-medium text-foreground">{t("phoneHours")}</span>
              </div>
            </div>
          </section>

          {/* Emergency Notice */}
          <section className="rounded-3xl border border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/30 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t("emergencyTitle")}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("emergencyDesc")}
                </p>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Tel: 1-800-XXX-XXXX
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}