"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Eye,
  Filter,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentModal } from "@/components/payments";
import { apiClient, appointmentsAPI } from "@/lib/api-client";
import { AppointmentResponse } from "@/types/api";

export default function ClientBillingPage() {
  const [activeTab, setActiveTab] = useState<"owed" | "history">("owed");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "visa" | "paypal" | "baridiMobe" | null
  >(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{id: string; type: string}[]>([]);

   const t = useTranslations("billing");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentsAPI.list();
      setAppointments(response);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchAppointments();
    setShowPaymentModal(false);
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

  const owedPayments = appointments.filter(
    (p) => p.payment.status === "pending" || p.payment.status === "processing",
  );
  const paidPayments = appointments.filter((p) => p.payment.status === "paid");

  const totalOwed = owedPayments.reduce((sum, p) => sum + p.payment.price, 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.payment.price, 0);

  const getStatusColor = (status: AppointmentResponse["payment"]["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/15 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
      case "refunded":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400";
      case "cancelled":
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400";
      case "processing":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: AppointmentResponse["payment"]["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "refunded":
        return <Wallet className="h-4 w-4" />;
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

  const displayPayments = activeTab === "owed" ? owedPayments : paidPayments;

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
              <p className="text-sm text-muted-foreground">{t("totalOwed")}</p>
              <p className="text-2xl font-light text-foreground">
                {totalOwed.toFixed(2)} $
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
              <p className="text-sm text-muted-foreground">{t("totalPaid")}</p>
              <p className="text-2xl font-light text-foreground">
                {totalPaid.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("paymentMethods")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {paymentMethods.length}
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
          onClick={() => setActiveTab("owed")}
          className={`rounded-t-lg px-6 py-3 font-medium transition ${
            activeTab === "owed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("paymentsOwed")} ({owedPayments.length})
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
          <Wallet className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-xl text-foreground">
            {activeTab === "owed" ? t("noPaymentsOwed") : t("noPaymentHistory")}
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
                        {t("session")} - {apt.professionalId?.firstName}{" "}
                        {apt.professionalId?.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {apt.date ? formatDate(apt.date) : "to be scheduled"}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                        apt.payment.status,
                      )}`}
                    >
                      {getStatusIcon(apt.payment.status)}
                      {t(`status.${apt.payment.status}`)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4 rounded-2xl bg-muted/30 p-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("invoiceNumber")}
                      </p>
                      <p className="font-medium text-foreground">{apt._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("amount")}
                      </p>
                      <p className="font-medium text-foreground">
                        {apt.payment.price.toFixed(2)} $
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {apt.payment.status === "paid" && (
                      <Button
                        variant="outline"
                        className="gap-2 rounded-full"
                        onClick={() => handleDownloadReceipt(apt._id)}
                      >
                        <Download className="h-4 w-4" />
                        {t("downloadReceipt")}
                      </Button>
                    )}
                    {apt.status === "scheduled" && apt.payment.status === "pending" && (
                      <Button
                        className="gap-2 rounded-full"
                        onClick={() => handlePayNow(apt)}
                      >
                        <CreditCard className="h-4 w-4" />
                        {t("payNow")}
                      </Button>
                    )}
                    {(apt.payment.status === "pending" && apt.status === "pending") && (
                      <div className="text-sm text-muted-foreground italic">
                        {t("awaitingConfirmation") ||
                          "Awaiting professional confirmation before payment"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedAppointment && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          appointmentId={selectedAppointment._id}
          amount={selectedAppointment.payment.price}
          professionalName={`${selectedAppointment.professionalId?.firstName} ${selectedAppointment.professionalId?.lastName}`}
          appointmentDate={selectedAppointment.date}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
