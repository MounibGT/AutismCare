"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Shield,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface GuestPaymentFormProps {
  guestEmail: string;
  guestName: string;
  onSuccess: (paymentMethodId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function GuestPaymentForm({
  guestEmail,
  guestName,
  onSuccess,
  onBack,
  loading: externalLoading,
}: GuestPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const createSetupIntent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - in a real app, this would call your payment backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate getting a setup intent from backend
      setClientSecret("fake_setup_intent_for_" + guestEmail);
    } catch (err) {
      console.error("Error creating setup intent:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize payment form"
      );
    } finally {
      setLoading(false);
    }
  }, [guestEmail]);

  useEffect(() => {
    createSetupIntent();
  }, [createSetupIntent]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setIsComplete(true);
      onSuccess("pm_simulated_method_id");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          Payment Method Verified!
        </h3>
        <p className="text-muted-foreground">
          Proceeding to book your appointment...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Payment Information Required
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Please enter your payment details to continue with booking. Your payment
          will only be processed after your appointment is confirmed by the
          professional.
        </p>
      </div>

      {/* Security Note */}
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Secure Payment
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your payment information is encrypted and secure. We comply with
              PCI DSS standards.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Payment Form */}
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Guest Payment Form</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This is a simulated payment form for guest users. In a real application,
            you would integrate with Stripe Elements or another payment processor here.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full px-3 py-2 border rounded"
                maxLength={19}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border rounded"
                  maxLength={5}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border rounded"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || externalLoading}
            className="flex-1"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
