"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  Home,
  Download,
  Building2,
  Landmark,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

type PaymentMethodType =
  | "card"
  | "transfer"
  | "direct_debit"
  | "baridimobi"
  | "paypal";

interface AppointmentDetails {
  appointmentId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  therapyType: string;
  price: number;
  guestName: string;
  guestEmail: string;
  professionalName: string;
  alreadyPaid?: boolean;
  paidAt?: string;
}

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  paymentMethod: PaymentMethodType;
}

const paymentMethodOptions: {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Pay instantly with your Visa or Mastercard",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Secure PayPal checkout for quick payment",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "baridimobi",
    label: "Baridi Mobi",
    description: "Pay securely with Tunisian Baridi Mobi",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: "transfer",
    label: "Bank Transfer",
    description: "Transfer from your bank account",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: "direct_debit",
    label: "Pre-authorized Debit",
    description: "Automatic debit from your account",
    icon: <Landmark className="h-5 w-5" />,
  },
];

function CheckoutForm({
  amount,
  onSuccess,
  onError,
  paymentMethod,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An error occurred");
      onError(error.message || "Payment failed");
      setLoading(false);
    } else if (paymentIntent) {
      if (paymentIntent.status === "succeeded") {
        setMessage("Payment successful!");
        onSuccess();
      } else if (paymentIntent.status === "processing") {
        setMessage(
          "Your payment is being processed. We'll notify you once it's complete.",
        );
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else if (paymentIntent.status === "requires_action") {
        setMessage("Please complete the additional verification step.");
        setLoading(false);
      } else {
        setMessage("Payment processing...");
        setLoading(false);
      }
    }
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case "paypal":
        return <Shield className="h-5 w-5 text-primary" />;
      case "baridimobi":
        return <Wallet className="h-5 w-5 text-primary" />;
      case "transfer":
        return <Building2 className="h-5 w-5 text-primary" />;
      case "direct_debit":
        return <Landmark className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "paypal":
        return "PayPal Payment";
      case "baridimobi":
        return "Baridi Mobi Payment";
      case "transfer":
        return "Bank Transfer";
      case "direct_debit":
        return "Pre-authorized Debit";
      default:
        return "Card Payment";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Amount to pay</span>
          <span className="text-2xl font-semibold text-foreground">
            ${amount.toFixed(2)} CAD
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getPaymentMethodIcon()}
          <span>{getPaymentMethodLabel()}</span>
        </div>
      </div>

      {/* Payment Method Instructions */}
      {paymentMethod === "transfer" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Bank Transfer Instructions
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Complete the payment form below to receive bank transfer
                instructions. Your appointment will be confirmed once we receive
                the funds (typically 1-3 business days).
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "direct_debit" && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Landmark className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Pre-authorized Debit (PAD)
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Authorize a one-time debit from your Canadian bank account.
                Processing typically takes 3-5 business days. You will receive a
                confirmation email.
              </p>
            </div>
          </div>
        </div>
      )}
      {paymentMethod === "baridimobi" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Baridi Mobi Checkout
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You will be redirected to Baridi Mobi to complete the payment.
                Once the transaction is finished, you will return to the site.
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod !== "baridimobi" && paymentMethod !== "transfer" && (
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      )}

      {message &&
        !message.includes("successful") &&
        !message.includes("processing") && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
          </div>
        )}

      {message &&
        (message.includes("successful") || message.includes("processing")) && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {message}
            </p>
          </div>
        )}

      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === "transfer" ? (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Get Transfer Instructions - ${amount.toFixed(2)} CAD
          </>
        ) : paymentMethod === "direct_debit" ? (
          <>
            <Landmark className="mr-2 h-4 w-4" />
            Authorize Debit - ${amount.toFixed(2)} CAD
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${amount.toFixed(2)} CAD
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>
          {paymentMethod === "transfer"
            ? "You'll receive bank transfer instructions after submitting."
            : paymentMethod === "direct_debit"
              ? "By authorizing, you agree to a one-time debit from your account."
              : "Secured by Stripe"}
        </span>
      </div>
    </form>
  );
}

function GuestPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawToken = searchParams.get("token");
  const guestToken = searchParams.get("guestToken") || rawToken;
  const paypalOrderId =
    searchParams.get("paymentMethod") === "paypal" ? rawToken : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapturingPaypal, setIsCapturingPaypal] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null,
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>("card");
  const [paymentMethodSelected, setPaymentMethodSelected] = useState(false);
  const [creatingIntent, setCreatingIntent] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!guestToken) {
      setError("Invalid payment link. Please check the link and try again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/guest?token=${guestToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load appointment details");
      }

      setAppointment(data);

      // Check if already paid
      if (data.alreadyPaid) {
        setAlreadyPaid(true);
      }
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load payment details",
      );
    } finally {
      setLoading(false);
    }
  }, [guestToken]);

  const baridimobiStatus =
    searchParams.get("paymentMethod") === "baridimobi"
      ? searchParams.get("status")
      : null;
  const baridimobiTransactionId =
    searchParams.get("paymentMethod") === "baridimobi"
      ? searchParams.get("transaction_id") || searchParams.get("transactionid")
      : null;
  const baridimobiReference =
    searchParams.get("paymentMethod") === "baridimobi"
      ? searchParams.get("reference")
      : null;

  useEffect(() => {
    const captureExternalIfNeeded = async () => {
      if (paypalOrderId && guestToken) {
        setIsCapturingPaypal(true);
        try {
          const captureResponse = await fetch(
            `/api/payments/guest/paypal-capture?guestToken=${guestToken}&orderId=${paypalOrderId}`,
          );
          const captureData = await captureResponse.json();

          if (!captureResponse.ok) {
            throw new Error(captureData.error || "Failed to capture PayPal payment");
          }

          setPaymentSuccess(true);
          setError(null);
        } catch (err) {
          console.error("PayPal capture error:", err);
          setError(err instanceof Error ? err.message : "PayPal capture failed");
        } finally {
          setIsCapturingPaypal(false);
          setLoading(false);
        }
      } else if (baridimobiStatus && guestToken) {
        setIsCapturingPaypal(true);
        try {
          const callbackResponse = await fetch(
            `/api/payments/guest/baridimobi-callback?guestToken=${guestToken}&status=${encodeURIComponent(
              baridimobiStatus,
            )}&transactionId=${encodeURIComponent(
              baridimobiTransactionId || "",
            )}&reference=${encodeURIComponent(baridimobiReference || "")}`,
          );
          const callbackData = await callbackResponse.json();

          if (!callbackResponse.ok) {
            throw new Error(callbackData.error || "Failed to verify Baridi Mobi payment");
          }

          setPaymentSuccess(true);
          setError(null);
        } catch (err) {
          console.error("Baridi Mobi callback error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Baridi Mobi payment verification failed",
          );
        } finally {
          setIsCapturingPaypal(false);
          setLoading(false);
          const cleanedUrl = new URL(window.location.href);
          cleanedUrl.searchParams.delete("paymentMethod");
          cleanedUrl.searchParams.delete("status");
          cleanedUrl.searchParams.delete("transaction_id");
          cleanedUrl.searchParams.delete("transactionid");
          cleanedUrl.searchParams.delete("reference");
          router.replace(cleanedUrl.toString());
        }
      } else {
        fetchAppointment();
      }
    };

    captureExternalIfNeeded();
  }, [fetchAppointment, guestToken, paypalOrderId, baridimobiStatus, baridimobiTransactionId, baridimobiReference, router]);

  const createPaymentIntent = async (method: PaymentMethodType) => {
    if (!guestToken) return;

    try {
      setCreatingIntent(true);
      setError(null);

      const intentResponse = await fetch("/api/payments/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: guestToken, paymentMethod: method }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.error || "Failed to initialize payment");
      }

      if (intentData.redirectUrl) {
        window.location.href = intentData.redirectUrl;
        return;
      }

      setClientSecret(intentData.clientSecret);
      setPaymentMethodSelected(true);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize payment",
      );
    } finally {
      setCreatingIntent(false);
    }
  };

  const handleContinueToPayment = () => {
    createPaymentIntent(selectedPaymentMethod);
  };

  const handleBackToMethodSelection = () => {
    setPaymentMethodSelected(false);
    setClientSecret(null);
    setError(null);
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDownloadReceipt = async () => {
    if (!appointment) return;

    try {
      setDownloadingReceipt(true);
      const response = await fetch(
        `/api/payments/receipt?appointmentId=${appointment.appointmentId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to download receipt");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${appointment.appointmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading receipt:", err);
      setError("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0f172a",
      borderRadius: "8px",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (alreadyPaid && appointment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl bg-card border border-border/40 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-serif font-light text-foreground mb-2">
            Payment Already Complete
          </h1>
          <p className="text-muted-foreground mb-6">
            This appointment has already been paid. Your session is confirmed!
          </p>

          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Professional</p>
                  <p className="font-medium text-foreground">
                    {appointment.professionalName}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.time}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Amount Paid
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${appointment.price.toFixed(2)} CAD
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="w-full"
            >
              {downloadingReceipt ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl bg-card border border-border/40 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-serif font-light text-foreground mb-2">
            Payment Error
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl bg-card border border-border/40 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-serif font-light text-foreground mb-2">
            {selectedPaymentMethod === "transfer"
              ? "Transfer Instructions Sent!"
              : selectedPaymentMethod === "direct_debit"
                ? "Pre-authorized Debit Set Up!"
                : selectedPaymentMethod === "baridimobi"
                  ? "Baridi Mobi Payment Complete!"
                  : "Payment Successful!"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {selectedPaymentMethod === "transfer"
              ? "Please complete the bank transfer to confirm your appointment. You will receive the transfer instructions via email."
              : selectedPaymentMethod === "direct_debit"
                ? "Your pre-authorized debit has been set up. Your appointment will be confirmed once the payment is processed."
                : selectedPaymentMethod === "baridimobi"
                  ? "Your Baridi Mobi payment was received. Your appointment is confirmed."
                  : "Your payment has been processed successfully. You will receive a confirmation email with your session details shortly."}
          </p>

          {appointment && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Professional
                    </p>
                    <p className="font-medium text-foreground">
                      {appointment.professionalName}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-foreground">
                      {formatDate(appointment.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-light text-foreground mb-2">
            Complete Your Payment
          </h1>
          <p className="text-muted-foreground">
            Your appointment has been confirmed. Complete your payment to secure
            your session.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Appointment Details */}
          {appointment && (
            <div className="rounded-xl bg-card border border-border/40 p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Appointment Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Professional
                    </p>
                    <p className="font-medium text-foreground">
                      {appointment.professionalName}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">
                      {appointment.time} ({appointment.duration} minutes)
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-semibold text-foreground">
                    ${appointment.price.toFixed(2)} CAD
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection or Payment Form */}
          <div className="rounded-xl bg-card border border-border/40 p-6">
            {!paymentMethodSelected ? (
              <>
                <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  Select Payment Method
                </h2>

                <div className="space-y-4">
                  <div className="space-y-3">
                    {paymentMethodOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(option.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                          selectedPaymentMethod === option.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border/40 bg-card/50 hover:bg-accent/50",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-full p-2.5",
                            selectedPaymentMethod === option.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {option.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                            selectedPaymentMethod === option.id
                              ? "border-primary"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {selectedPaymentMethod === option.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleContinueToPayment}
                    disabled={creatingIntent}
                    className="w-full"
                    size="lg"
                  >
                    {creatingIntent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                    {selectedPaymentMethod === "card" && (
                      <CreditCard className="h-5 w-5" />
                    )}
                    {selectedPaymentMethod === "transfer" && (
                      <Building2 className="h-5 w-5" />
                    )}
                    {selectedPaymentMethod === "direct_debit" && (
                      <Landmark className="h-5 w-5" />
                    )}
                    Payment Information
                  </h2>
                  <button
                    onClick={handleBackToMethodSelection}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change method
                  </button>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                {clientSecret && appointment && (
                  <Elements
                    options={{
                      clientSecret,
                      appearance,
                    }}
                    stripe={stripePromise}
                  >
                    <CheckoutForm
                      amount={appointment.price}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      paymentMethod={selectedPaymentMethod}
                    />
                  </Elements>
                )}
              </>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Your payment information is encrypted and securely processed by
            Stripe. We never store your card details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GuestPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <GuestPaymentContent />
    </Suspense>
  );
}
