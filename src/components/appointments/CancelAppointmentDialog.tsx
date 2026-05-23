"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  appointmentDate?: string;
  appointmentTime?: string;
  amount: number;
  isPaid: boolean;
  onSuccess?: () => void;
}

const CANCELLATION_FEE_PERCENTAGE = 15; // 15%
const HOURS_FOR_FREE_CANCELLATION = 24;

export default function CancelAppointmentDialog({
  open,
  onOpenChange,
  appointmentId,
  appointmentDate,
  appointmentTime,
  amount,
  isPaid,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refundDetails, setRefundDetails] = useState<{
    originalAmount: number;
    cancellationFee: number;
    refundAmount: number;
  } | null>(null);

  // Calculate hours until appointment
  const appointmentDateTime = (() => {
    // Parse the date (might be ISO string or date string)
    if (!appointmentDate || !appointmentTime) return null;
    const dateObj = new Date(appointmentDate);

    // Parse time string (format: "HH:MM")
    const [hours, minutes] = appointmentTime.split(":").map(Number);

    // Set the time on the date
    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj;
  })();

  const now = new Date();
  const hoursUntilAppointment = appointmentDateTime
    ? (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    : 0;

  const isFreeCancel = hoursUntilAppointment >= HOURS_FOR_FREE_CANCELLATION;
  const cancellationFee = isFreeCancel
    ? 0
    : amount * (CANCELLATION_FEE_PERCENTAGE / 100);
  const refundAmount = isFreeCancel ? amount : amount - cancellationFee;

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.patch(`/appointments/${appointmentId}`, {
        status: "cancelled",
        cancelReason: reason || "No reason provided",
      });

      // Show success state with calculated refund details
      setSuccess(true);
      if (isPaid) {
        setRefundDetails({
          originalAmount: amount,
          cancellationFee: cancellationFee,
          refundAmount: refundAmount,
        });
      }

      // Close after 3 seconds
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        setReason("");
        setSuccess(false);
        setRefundDetails(null);
      }, 3000);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setError(
        err instanceof Error ? err.message : "Failed to cancel appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-light">
            {success ? "Appointment Cancelled" : "Cancel Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointmentDate} at {appointmentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {success ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-lg font-medium text-green-800 dark:text-green-200">
                      Appointment Cancelled Successfully
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      You will receive a confirmation email shortly
                    </p>
                  </div>
                </div>
              </div>

              {refundDetails && (
                <div className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Refund Summary</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Original Amount:
                      </span>
                      <span className="font-medium text-foreground">
                        ${refundDetails.originalAmount.toFixed(2)} CAD
                      </span>
                    </div>

                    {refundDetails.cancellationFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Cancellation Fee:
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -${refundDetails.cancellationFee.toFixed(2)} CAD
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="font-medium text-foreground">
                        Refund Amount:
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${refundDetails.refundAmount.toFixed(2)} CAD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/40">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      The refund will be processed to your original payment
                      method within 5-10 business days.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Warning Message */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Cancellation Policy
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {isFreeCancel ? (
                        <>
                          You can cancel this appointment for free since
                          it&apos;s more than {HOURS_FOR_FREE_CANCELLATION}{" "}
                          hours away.
                        </>
                      ) : (
                        <>
                          Cancellations within {HOURS_FOR_FREE_CANCELLATION}{" "}
                          hours are subject to a {CANCELLATION_FEE_PERCENTAGE}%
                          cancellation fee.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Until Appointment */}
              <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    Time Until Appointment
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {hoursUntilAppointment >= 24
                    ? `${Math.floor(hoursUntilAppointment / 24)} days, ${Math.floor(hoursUntilAppointment % 24)} hours`
                    : `${Math.floor(hoursUntilAppointment)} hours, ${Math.floor((hoursUntilAppointment % 1) * 60)} minutes`}
                </p>
              </div>

              {/* Refund Details - Only show if paid */}
              {isPaid && (
                <div className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Refund Details</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Original Amount:
                      </span>
                      <span className="font-medium text-foreground">
                        ${amount.toFixed(2)} CAD
                      </span>
                    </div>

                    {!isFreeCancel && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Cancellation Fee ({CANCELLATION_FEE_PERCENTAGE}%):
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -${cancellationFee.toFixed(2)} CAD
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="font-medium text-foreground">
                        Refund Amount:
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${refundAmount.toFixed(2)} CAD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/40">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      The refund will be processed to your original payment
                      method within 5-10 business days.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for Cancellation{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Let us know why you're cancelling..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!success && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
