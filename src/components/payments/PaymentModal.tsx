"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  CreditCard,
  Building2,
  Landmark,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type PaymentMethodType =
  | "card"
  | "transfer"
  | "direct_debit"
  | "baridimobi";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  amount: number;
  professionalName: string;
  appointmentDate?: string;
  onSuccess?: () => void;
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
    description: "Pay instantly with your card",
    icon: <CreditCard className="h-5 w-5" />,
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
  {
    id: "baridimobi",
    label: "Baridi Mobi",
    description: "Pay with Baridi Mobi",
    icon: <Building2 className="h-5 w-5" />,
  },
];

export default function PaymentModal({
  open,
  onOpenChange,
  appointmentId,
  amount,
  professionalName,
  appointmentDate,
  onSuccess,
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>("card");
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const createPaymentIntent = useCallback(
    async (method: PaymentMethodType) => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - in a real app, this would call your payment backend
        // For now, we'll simulate a successful response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate getting a client secret from backend
        setClientSecret("fake_client_secret_for_" + method);
        setPaymentInitiated(true);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize payment"
        );
      } finally {
        setLoading(false);
      }
    },
    [appointmentId],
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setClientSecret("");
      setPaymentInitiated(false);
      setError(null);
      setSelectedPaymentMethod("card");
    }
  }, [open]);

  const handleContinue = () => {
    createPaymentIntent(selectedPaymentMethod);
  };

  const handleBack = () => {
    setPaymentInitiated(false);
    setClientSecret("");
    setError(null);
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-light">
            Complete Payment
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span>Session with {professionalName}</span>
            <span className="text-sm">{appointmentDate}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Payment Method Selection */}
          {!paymentInitiated && !loading && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">
                     Amount to pay
                   </span>
                   <span className="text-2xl font-semibold text-foreground">
                     {amount.toFixed(2)} CAD
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Select Payment Method
                </Label>
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
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md font-medium transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Preparing payment...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Payment Error
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={handleBack}
                className="w-full border border-border hover:bg-accent h-10 px-4 rounded-md font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && paymentInitiated && (
            <div className="space-y-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Change payment method
                </button>
              {/* Simulate payment processing */}
              <div className="p-4">
                <p>Processing {selectedPaymentMethod} payment...</p>
                <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
                <p className="text-sm">
                  This is a simulated payment. In a real application, 
                  you would integrate with your payment processor here.
                </p>
                <button
                  onClick={handleSuccess}
                  className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
