"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, Video, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface IncomingCall {
  id: string;
  callerId: string;
  callerName: string;
  callerImage?: string;
  type: "video" | "audio";
  createdAt: string;
}

// Time in seconds before call times out
const CALL_TIMEOUT_SECONDS = 60;

export default function IncomingCallNotifier() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CALL_TIMEOUT_SECONDS);

  const checkForIncomingCalls = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const response = await fetch("/api/calls/pending");
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();

      if (response.ok && data.call) {
        setIncomingCall(data.call);
        setPollingActive(true);
        setTimeLeft(CALL_TIMEOUT_SECONDS); // Reset timeout when new call arrives
      }
    } catch (error) {
      // Silently handle network errors - this is expected when the server is unavailable
      console.error("Error checking for calls:", error);
    }
  }, [status]);

  // Countdown timer for call timeout
  useEffect(() => {
    if (!incomingCall) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Call timed out - auto-reject
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingCall]);

  // Handle call timeout (auto-reject)
  const handleTimeout = async () => {
    if (!incomingCall) return;
    
    await fetch(`/api/calls/${incomingCall.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    
    setIncomingCall(null);
  };

  // Poll for incoming calls every 3 seconds
  useEffect(() => {
    if (status === "authenticated") {
      checkForIncomingCalls();
      const interval = setInterval(checkForIncomingCalls, 3000);
      return () => {
        clearInterval(interval);
        setPollingActive(false);
      };
    }
  }, [status, checkForIncomingCalls]);

  const handleAccept = async () => {
    if (!incomingCall) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/calls/${incomingCall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to call page — route based on the caller's actual role
        const sessionRes = await fetch("/api/users/me", {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();

        setIncomingCall(null);
        const callPath =
          sessionData.role === "professional"
            ? `/professional/call/${incomingCall.id}`
            : `/client/call/${incomingCall.id}`;
        router.push(callPath);
      } else {
        alert(data.error || "Failed to accept call");
      }
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to accept call");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!incomingCall) return;

    setIsLoading(true);
    try {
      await fetch(`/api/calls/${incomingCall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
    } catch (error) {
      console.error("Error rejecting call:", error);
    } finally {
      setIncomingCall(null);
      setIsLoading(false);
    }
  };

  // Don't render if not authenticated or no incoming call
  if (status !== "authenticated" || !incomingCall) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="text-center space-y-4">
            {/* Caller Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary animate-pulse">
                  <AvatarImage src={incomingCall.callerImage} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(incomingCall.callerName)}
                  </AvatarFallback>
                </Avatar>
                {incomingCall.type === "video" && (
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full">
                    <Video className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Caller Name */}
            <div>
              <h3 className="text-xl font-semibold">{incomingCall.callerName}</h3>
              <p className="text-muted-foreground text-sm">
                {incomingCall.type === "video" ? "Video Call" : "Audio Call"}
              </p>
            </div>

{/* Call Type Label */}
             <div>
               <p className="text-sm text-muted-foreground">
                 incoming call...
               </p>
               <p className="text-xs text-red-400 mt-1">
                 Call will end in {timeLeft} seconds
               </p>
             </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              {/* Reject Button */}
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14"
                onClick={handleReject}
                disabled={isLoading}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              {/* Accept Button */}
              <Button
                size="lg"
                className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
                onClick={handleAccept}
                disabled={isLoading}
              >
                {incomingCall.type === "video" ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
