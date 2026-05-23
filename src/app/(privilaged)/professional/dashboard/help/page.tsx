"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  BookOpen,
  Users,
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
  Briefcase,
  DollarSign,
  UserCheck,
  Settings,
  BarChart3,
  FileCheck,
  Shield,
  TrendingUp,
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
    question: "Comment activer mon statut en ligne pour recevoir des clients ?",
    answer:
      "Pour activer votre statut en ligne, accédez à votre profil professionnel. Dans la section 'Disponibilité', basculez le commutateur 'Disponible pour les nouveaux clients'. Votre profil sera visible dans les résultats de matching pour les nouveaux clients.",
    category: "profile",
  },
  {
    id: "2",
    question: "Comment fonctionne le système de propositions de créneaux ?",
    answer:
      "Lorsqu'un client réserve un créneau que vous avez suggéré, vous recevez une notification. Vous pouvez alors accepter ou refuser la demande. Les créneaux acceptés sont automatiquement ajoutés à votre calendrier et le client est notifié.",
    category: "scheduling",
  },
  {
    id: "3",
    question: "Comment gérer mes tarifs et conditions de paiement ?",
    answer:
      "Accédez à la section 'Facturation' dans votre tableau de bord. Vous pouvez y définir vos tarifs par type de séance, vos conditions d'annulation et vos préférences de paiement. Les modifications prennent effet immédiatement pour les nouvelles réservations.",
    category: "billing",
  },
  {
    id: "4",
    question: "Comment activer le service de paiement intégré ?",
    answer:
      "Pour activer les paiements intégrés, allez dans 'Facturation' > 'Méthodes de paiement'. Cliquez sur 'Ajouter une méthode' et suivez les instructions pour connecter votre compte Stripe. Une fois vérifié, vous pourrez recevoir les paiements directement sur votre compte.",
    category: "billing",
  },
  {
    id: "5",
    question: "Comment fonctionne le matching automatique avec les clients ?",
    answer:
      "Notre algorithme analyse le profil des clients en fonction de leurs besoins, préférences et situation. Il vous propose les clients qui correspondent le mieux à votre expertise, vos approches thérapeutiques et votre disponibilité. Vous pouvez accepter ou refuser chaque proposition.",
    category: "clients",
  },
  {
    id: "6",
    question: "Comment suivre et gérer mes revenus ?",
    answer:
      "La section 'Facturation' vous offre un tableau de bord complet avec vos revenus, les paiements en attente, les transactions récentes et vos rapports mensuels. Vous pouvez télécharger des rapports détaillés et suivre l'évolution de votre activité.",
    category: "billing",
  },
  {
    id: "7",
    question: "Comment créer et gérer mes propositions de créneaux ?",
    answer:
      "Dans la section 'Calendrier', utilisez la fonction 'Proposer des créneaux'. Sélectionnez les dates et heures disponibles, définissez le type de séance et le tarif. Vos propositions sont envoyées aux clients matched qui peuvent ensuite réserver.",
    category: "scheduling",
  },
  {
    id: "8",
    question: "Comment obtenir mon certificat de pratique ?",
    answer:
      "Une fois votre inscription approuvée et votre profil vérifié, vous pouvez télécharger votre certificat de pratique depuis la section 'Profil' > 'Documents'. Ce certificat confirme votre statut de professionnel sur la plateforme.",
    category: "profile",
  },
  {
    id: "9",
    question: "Comment fonctionne le système de confidentialité des données ?",
    answer:
      "Toutes les informations des clients sont chiffrées et protégées. Vous n'avez accès qu'aux informations nécessaires pour la séance. Les enregistrements audio/vidéo ne sont jamais stockés. Toutes les données sont supprimées conformément à notre politique de rétention.",
    category: "privacy",
  },
  {
    id: "10",
    question: "Comment puis-je accéder à mes statistiques et analyses ?",
    answer:
      "La section 'Analyses' (disponible prochainement) vous permettra de suivre vos performances, l'évolution de votre clientèle et vos indicateurs de satisfaction. Actuellement, vous pouvez consulter un résumé de vos statistiques dans votre tableau de bord.",
    category: "analytics",
  },
  {
    id: "11",
    question: "Comment gérer les demandes de remboursement des clients ?",
    answer:
      "Les demandes de remboursement sont automatiquement signalées. Vous pouvez les consulter dans la section 'Facturation'. Chaque demande inclut les détails de la séance et la raison du client. Vous pouvez accepter ou contester le remboursement dans un délai de 5 jours.",
    category: "billing",
  },
  {
    id: "12",
    question: "Comment mettre à jour mes informations professionnelles ?",
    answer:
      "Accédez à 'Mon Profil' dans votre tableau de bord. Vous pouvez y modifier vos informations personnelles, votre bio, vos tarifs, vos horaires et vos approches thérapeutiques. Les modifications importantes sont soumises à une vérification avant publication.",
    category: "profile",
  },
];

const contactOptions: ContactOption[] = [
  {
    icon: MessageCircle,
    title: "Chat en direct",
    description: "Assistance technique et administrative",
    action: "Démarrer une conversation",
    href: "#chat",
    badge: "24/7",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Questions détaillées et dokumentation",
    action: "support.pro@jecheminement.com",
    href: "mailto:support.pro@jecheminement.com",
  },
  {
    icon: Phone,
    title: "Ligne professionnelle",
    description: "Support dédié aux professionnels",
    action: "1-800-XXX-XXXX",
    href: "tel:1800000000",
    badge: "Lun-Ven 8h-18h",
  },
];

const quickGuides = [
  {
    icon: UserCheck,
    title: "Guide d'onboarding",
    description: "Complétez votre profil étape par étape",
    duration: "10 min",
    category: "getting-started",
  },
  {
    icon: Calendar,
    title: "Guide de planification",
    description: "Configurez vos disponibilité et créneaux",
    duration: "5 min",
    category: "scheduling",
  },
  {
    icon: DollarSign,
    title: "Guide de facturation",
    description: "Paramétrez vos tarifs et paiements",
    duration: "7 min",
    category: "billing",
  },
  {
    icon: Users,
    title: "Guide client",
    description: "Gérez vos clients et propositions",
    duration: "6 min",
    category: "clients",
  },
  {
    icon: BarChart3,
    title: "Guide analytique",
    description: "Comprenez vos statistiques",
    duration: "4 min",
    category: "analytics",
  },
  {
    icon: Shield,
    title: "Guide conformité",
    description: "Assurance et obligations légales",
    duration: "8 min",
    category: "compliance",
  },
];

const categories = [
  { id: "all", label: "Tous" },
  { id: "profile", label: "Profil" },
  { id: "scheduling", label: "Planification" },
  { id: "billing", label: "Facturation" },
  { id: "clients", label: "Clients" },
  { id: "analytics", label: "Analyses" },
  { id: "privacy", label: "Confidentialité" },
  { id: "compliance", label: "Conformité" },
];

const professionalStats = [
  { label: "Profil vérifié", value: "100%" },
  { label: "Taux de satisfaction", value: "98%" },
  { label: "Réponse moyenne", value: "< 2h" },
];

export default function ProfessionalHelpPage() {
  const t = useTranslations("Client.help");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    subject: "",
    message: "",
    priority: "normal",
    type: "general",
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
      setContactFormData({ subject: "", message: "", priority: "normal", type: "general" });
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
              <Briefcase className="h-4 w-4" />
              {t("badge")}
            </div>
            <h1 className="font-serif text-3xl font-light text-foreground lg:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="space-y-4 rounded-3xl bg-card/70 p-6">
            <p className="text-sm font-medium text-foreground">{t("statsTitle")}</p>
            <div className="grid gap-3">
              {professionalStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-medium text-primary">{stat.value}</span>
                </div>
              ))}
            </div>
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
                        {t("typeLabel")}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["general", "technical", "billing", "compliance"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setContactFormData({ ...contactFormData, type })}
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              contactFormData.type === type
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/40 bg-card/80 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {t(`type.${type}`)}
                          </button>
                        ))}
                      </div>
                    </div>

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

          {/* Resources */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
            <h3 className="font-serif text-xl font-light text-foreground mb-4">
              {t("resourcesTitle")}
            </h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/60 p-4 transition hover:border-primary/30"
              >
                <FileCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Guide des politiques</p>
                  <p className="text-xs text-muted-foreground">PDF - 2.5 MB</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/60 p-4 transition hover:border-primary/30"
              >
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Protection des données</p>
                  <p className="text-xs text-muted-foreground">PDF - 1.8 MB</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/60 p-4 transition hover:border-primary/30"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Meilleures pratiques</p>
                  <p className="text-xs text-muted-foreground">PDF - 3.2 MB</p>
                </div>
              </a>
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

          {/* Important Notice */}
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t("importantTitle")}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("importantDesc")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}