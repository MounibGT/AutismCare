"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusToggleProps {
  variant?: "header" | "full";
}

export default function StatusToggle({ variant = "header" }: StatusToggleProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("offline");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current status on mount
  useEffect(() => {
    fetchCallStatus();
  }, []);

  const fetchCallStatus = async () => {
    try {
      const response = await fetch("/api/users/me/call-status");
      const data = await response.json();
      if (response.ok) {
        setIsOnline(data.isOnline || false);
        setCallStatus(data.callStatus || "offline");
      }
    } catch (error) {
      console.error("Error fetching call status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (online: boolean, status: string) => {
    try {
      const response = await fetch("/api/users/me/call-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOnline: online,
          callStatus: status,
        }),
      });

      if (response.ok) {
        setIsOnline(online);
        setCallStatus(status);
      }
    } catch (error) {
      console.error("Error updating call status:", error);
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "offline") {
      updateStatus(false, "offline");
    } else {
      updateStatus(true, value);
    }
  };

  if (isLoading) {
    return null;
  }

  if (variant === "full") {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-gray-400" />
          )}
          <span className="font-medium">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <Select value={callStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                Available for calls
              </div>
            </SelectItem>
            <SelectItem value="busy">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Busy
              </div>
            </SelectItem>
            <SelectItem value="offline">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-gray-400" />
                Offline
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Header variant - compact toggle
  return (
    <Select value={callStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[140px] h-9">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-400" />
          )}
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Available
          </div>
        </SelectItem>
        <SelectItem value="busy">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Busy
          </div>
        </SelectItem>
        <SelectItem value="offline">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Offline
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
