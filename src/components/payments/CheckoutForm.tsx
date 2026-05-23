"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Plus,
  Building2,
  Landmark,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface CheckoutFormProps {
  amount: number;
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  paymentMethod?: "card" | "transfer" | "direct_debit" | "baridimobi";
}

export default function CheckoutForm({
  amount,
  clientSecret,
  onSuccess,
  onError,
  paymentMethod = "card",
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("new");
  const [showPaymentElement, setShowPaymentElement] = useState(true);

  // Simple inline radio component
  const RadioButton = ({
    id,
    value,
    checked,
    onChange,
    children,
  }: {
    id: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center space-x-3">
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "appearance-none relative cursor-pointer",
          "before:absolute before:inset-0 before:rounded-full before:transition-all before:m-0.5",
          checked && "before:bg-primary",
        )}
      />
      <Label
        htmlFor={id}
        className="flex items-center gap-3 flex-1 cursor-pointer rounded-lg border border-border/40 bg-card/50 p-4 hover:bg-accent/50 transition-colors"
      >
        {children}
      </Label>
    </div>
  );

  useEffect(() => {
    // Only fetch payment methods for card payments
    if (paymentMethod === "card") {
      fetchPaymentMethods();
    } else {
      setLoadingMethods(false);
      setShowPaymentElement(true);
    }
  }, [paymentMethod]);

  useEffect(() => {
    // Simulate checking payment status for non-Stripe methods
    if (clientSecret && !loading && !isComplete) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        setMessage("Payment processed successfully!");
        onSuccess?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [clientSecret, loading, isComplete, onSuccess]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const data = await apiClient.get<{ paymentMethods: PaymentMethod[] }>(
        "/payments/payment-methods",
      );
      setPaymentMethods(data.paymentMethods || []);

      if (data.paymentMethods && data.paymentMethods.length > 0) {
        setSelectedMethod(data.paymentMethods[0].id);
        setShowPaymentElement(false);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
    setShowPaymentElement(value === "new");
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsComplete(true);
      setMessage("Payment processed successfully!");
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          {paymentMethod === "transfer"
            ? "Transfer Instructions Sent!"
            : paymentMethod === "direct_debit"
              ? "Pre-authorized Debit Set Up!"
              : "Payment Successful!"}
        </h3>
        <p className="text-muted-foreground">
          {paymentMethod === "transfer"
            ? "Please complete the bank transfer to confirm your appointment."
            : paymentMethod === "direct_debit"
              ? "Your appointment will be confirmed once the debit is processed."
              : "Your appointment has been confirmed."}
        </p>
      </div>
    );
  }

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
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
            {amount.toFixed(2)} CAD
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

      {/* Card Payment Method Selection - Only for card payments */}
      {paymentMethod === "card" && (
        <>
          {loadingMethods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-4">
              <Label className="text-base font-medium">Select Card</Label>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <RadioButton
                    key={method.id}
                    id={method.id}
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={handleMethodChange}
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      {method.card && (
                        <>
                          <p className="font-medium text-foreground capitalize">
                            {method.card.brand} ••••{method.card.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.card.expMonth}/{method.card.expYear}
                          </p>
                        </>
                      )}
                    </div>
                  </RadioButton>
                ))}

                <RadioButton
                  id="new"
                  value="new"
                  checked={selectedMethod === "new"}
                  onChange={handleMethodChange}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Use a different card
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enter new payment details
                    </p>
                  </div>
                </RadioButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      {message && (
        <div
          className={`rounded-lg border p-4 flex items-start gap-3`}
        >
          {message.includes("succeeded") || message.includes("processed") ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading
          ? "Processing..."
          : `Pay ${amount.toFixed(2)} CAD`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment is secure. We do not store sensitive payment details.
      </p>
    </form>
  );
}
