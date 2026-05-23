"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Landmark,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type PaymentMethodType = "card" | "acss_debit";

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    description: "Add a card for instant payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "acss_debit",
    label: "Pre-authorized Debit",
    description: "Link your Canadian bank account",
    icon: <Landmark className="h-5 w-5" />,
  },
];

export default function AddPaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [selectedType, setSelectedType] = useState<PaymentMethodType>("card");
  const [typeSelected, setTypeSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleContinue = () => {
    setTypeSelected(true);
  };

  const handleBack = () => {
    if (typeSelected) {
      setTypeSelected(false);
      setError(null);
      setIsComplete(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to add payment method
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setIsComplete(true);
      onSuccess?.();
    } catch (err) {
      console.error("Error adding payment method:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add payment method"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const getIcon = () => {
    return selectedType === "acss_debit" ? (
      <Landmark className="h-5 w-5 text-primary" />
    ) : (
      <CreditCard className="h-5 w-5 text-primary" />
    );
  };

  const getLabel = () => {
    return selectedType === "acss_debit"
      ? "Pre-authorized Debit"
      : "Credit/Debit Card";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-light">
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            {typeSelected
              ? "Enter your payment details below"
              : "Choose a payment method type to add"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Payment Method Type Selection */}
          {!typeSelected && !loading && (
            <div className="space-y-6">
              <div className="space-y-3">
                {paymentMethodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedType(option.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                      selectedType === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/40 bg-card/50 hover:bg-accent/50",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full p-2.5",
                        selectedType === option.id
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
                        selectedType === option.id
                          ? "border-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {selectedType === option.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Preparing form...</p>
            </div>
          )}

          {!loading && error && typeSelected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Error
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleBack} className="w-full">
                Go Back
              </Button>
            </div>
          )}

          {!loading && !error && typeSelected && !isComplete && (
            <div className="space-y-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Change payment method type
                </button>
              <div className="p-4">
                <h3 className="font-medium mb-4">
                  {selectedType === "card" ? "Add Credit/Debit Card" : "Link Bank Account"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedType === "acss_debit"
                    ? "Link your Canadian bank account for pre-authorized debits. No charge will be made now."
                    : "This card will be saved for future payments. No charge will be made now."}
                </p>
                
                {/* Simulated form fields */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-2">
                    {selectedType === "acss_debit" ? "Bank Account Details" : "Card Details"}
                  </label>
                  
                  {selectedType === "acss_debit" ? (
                    <>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Account Holder Name"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Institution Number (3 digits)"
                          className="w-full px-3 py-2 border rounded"
                          maxLength={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Transit Number (5 digits)"
                          className="w-full px-3 py-2 border rounded"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Account Number (7-12 digits)"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div className="flex space-x-3 space-y-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="flex-1 px-3 py-2 border rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="w-20 px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Billing Postal Code"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading
                    ? selectedType === "acss_debit"
                      ? "Linking..."
                      : "Adding..."
                    : selectedType === "acss_debit"
                      ? "Link Bank Account"
                      : "Add Card"}
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && isComplete && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  {selectedType === "acss_debit"
                    ? "Bank Account Linked!"
                    : "Payment Method Added!"}
                </h3>
                <p className="text-muted-foreground">
                  {selectedType === "acss_debit"
                    ? "Your bank account has been linked successfully for pre-authorized debits."
                    : "Your payment method has been saved successfully."}
                </p>
              </div>
              
              <Button
                onClick={handleSuccess}
                className="w-full mt-6"
                size="lg"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
