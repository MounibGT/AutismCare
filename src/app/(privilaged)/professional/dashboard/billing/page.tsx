"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Filter,
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appointmentsAPI } from "@/lib/api-client";
import { AppointmentResponse } from "@/types/api";

export default function ProfessionalBillingPage() {
  const [activeTab, setActiveTab] = useState<"receivables" | "history">(
    "receivables",
  );
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "visa" | "paypal" | "baridiMobe" | null
  >(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const t = useTranslations("billing");

  // Fetch real appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentsAPI.list();

      setAppointments(response);
    } catch (err: unknown) {
      console.error("Error fetching appointments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  const receivablePayments = appointments.filter(
    (apt) => apt.status === "pending" || apt.payment.status === "processing",
  );
  const paidPayments = appointments.filter(
    (apt) =>
      apt.payment.status === "paid" ||
      apt.payment.status === "refunded" ||
      apt.payment.status === "cancelled",
  );

  const totalReceivables = receivablePayments.reduce(
    (sum, p) => sum + p.payment.professionalPayout,
    0,
  );
  const totalReceived = paidPayments.reduce(
    (sum, p) => sum + p.payment.professionalPayout,
    0,
  );
  const monthlyRevenue = paidPayments
    .filter((p) => {
      const date = new Date(p.payment.paidAt || p.date);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.payment.professionalPayout, 0);

  const getStatusColor = (status: AppointmentResponse["payment"]["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/15 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
      case "processing":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400";
      case "refunded":
        return "bg-red-500/15 text-red-700 dark:text-red-400";
      case "cancelled":
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };


  const getStatusIcon = (status: AppointmentResponse["payment"]["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "refunded":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadReceipt = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `/api/payments/receipt?appointmentId=${appointmentId}`,
      );

      if (!response.ok) {
        let errorMessage = "Failed to download receipt";
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${appointmentId.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading receipt:", err);
      alert(err instanceof Error ? err.message : "Failed to download receipt");
    }
  };

  const displayPayments =
    activeTab === "receivables" ? receivablePayments : paidPayments;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchAppointments} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalReceivables")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {totalReceivables.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalReceived")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {totalReceived.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("monthlyRevenue")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {monthlyRevenue.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <section className="rounded-3xl border border-border/20 bg-card/80 p-7 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-foreground">
            {t("paymentMethods")}
          </h2>
          <Button
            onClick={() => setShowBankDetails(!showBankDetails)}
            variant="outline"
            className="gap-2 rounded-full"
          >
            <Filter className="h-4 w-4" />
            {showBankDetails ? t("hide") : t("show")}
          </Button>
        </div>

        {showBankDetails && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Visa Card */}
              <Card
                className={`cursor-pointer border-2 transition-all ${
                  selectedPaymentMethod === "visa"
                    ? "border-primary bg-primary/5"
                    : "border-border/20 bg-card/70 hover:border-primary/40"
                }`}
                onClick={() => setSelectedPaymentMethod("visa")}
              >
                <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-foreground">Visa</span>
                    {selectedPaymentMethod === "visa" && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("addVisaCard")}
                  </p>
                </div>
              </Card>
              {/* PayPal */}
              <Card
                className={`cursor-pointer border-2 transition-all ${
                  selectedPaymentMethod === "paypal"
                    ? "border-primary bg-primary/5"
                    : "border-border/20 bg-card/70 hover:border-primary/40"
                }`}
                onClick={() => setSelectedPaymentMethod("paypal")}
              >
                <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-blue-400/10 p-3">
                      <Wallet className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="font-medium text-foreground">PayPal</span>
                    {selectedPaymentMethod === "paypal" && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("addPayPal")}
                  </p>
                </div>
              </Card>
              {/* Baridi Mobe */}
              <Card
                className={`cursor-pointer border-2 transition-all ${
                  selectedPaymentMethod === "baridiMobe"
                    ? "border-primary bg-primary/5"
                    : "border-border/20 bg-card/70 hover:border-primary/40"
                }`}
                onClick={() => setSelectedPaymentMethod("baridiMobe")}
              >
                <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-foreground">
                      Baridi Mobe
                    </span>
                    {selectedPaymentMethod === "baridiMobe" && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("addBaridiMobe")}
                  </p>
                </div>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("paymentMethodsNote")}
            </p>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40">
        <button
          onClick={() => setActiveTab("receivables")}
          className={`rounded-t-lg px-6 py-3 font-medium transition ${
            activeTab === "receivables"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("receivables")} ({receivablePayments.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-t-lg px-6 py-3 font-medium transition ${
            activeTab === "history"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("paymentHistory")} ({paidPayments.length})
        </button>
      </div>

      {/* Payments List */}
      {displayPayments.length === 0 ? (
        <div className="rounded-3xl border border-border/20 bg-card/80 p-12 text-center shadow-lg">
          <DollarSign className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-xl text-foreground">
            {activeTab === "receivables"
              ? t("noReceivables")
              : t("noPaymentHistory")}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {displayPayments.map((apt) => (
            <div
              key={apt._id}
              className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg transition hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-light text-foreground">
                        {t("session")} - {apt.clientId.firstName}{" "}
                        {apt.clientId.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(apt.date)}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                        apt.payment.status,
                      )}`}
                    >
                      {getStatusIcon(apt.payment.status)}
                      {t(`status.${apt.status}`)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4 rounded-2xl bg-muted/30 p-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("invoiceNumber")}
                      </p>
                      <p className="font-medium text-foreground">{apt._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("grossAmount")}
                      </p>
                      <p className="font-medium text-foreground">
                        {apt.payment.price.toFixed(2)} $
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("platformFee")}
                      </p>
                      <p className="font-medium text-foreground">
                        -{apt.payment.platformFee.toFixed(2)} $
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("netAmount")}
                      </p>
                      <p className="font-medium text-primary">
                        {apt.payment.professionalPayout.toFixed(2)} $
                      </p>
                    </div>
                    {apt.payment.paidAt && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("paidDate")}
                        </p>
                        <p className="font-medium text-foreground">
                          {formatDate(apt.payment.paidAt)}
                        </p>
                      </div>
                    )}
                    {apt.status === "cancelled" && apt.cancelReason && (
                      <div className="md:col-span-4">
                        <p className="text-xs text-muted-foreground">
                          {t("cancelReason")}
                        </p>
                        <p className="font-medium text-foreground">
                          {apt.cancelReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {apt.payment.status === "paid" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="gap-2 rounded-full"
                        onClick={() => handleDownloadReceipt(apt._id)}
                      >
                        <Download className="h-4 w-4" />
                        {t("downloadInvoice")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}