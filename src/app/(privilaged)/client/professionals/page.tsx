"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Video, Phone, MapPin, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface Professional {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  specialty: string;
  bio: string;
  location?: string;
  language?: string;
  isOnline: boolean;
  callStatus: "available" | "busy" | "offline";
  lastSeen?: string;
}

export default function ProfessionalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("Client.professionals");
  const tGeneral = useTranslations("General");

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [callingTo, setCallingTo] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [initiatedCallId, setInitiatedCallId] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (availabilityFilter !== "all") params.set("availability", availabilityFilter);

      const response = await fetch(`/api/professionals?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProfessionals(data.professionals);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, availabilityFilter]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Update call status when user comes online
  useEffect(() => {
    if (session?.user?.id) {
      const updateStatus = async () => {
        try {
          await fetch("/api/users/me/call-status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isOnline: true, callStatus: "available" }),
          });
        } catch (error) {
          console.error("Error updating status:", error);
        }
      };

      updateStatus();

      // Update status when leaving
      const handleBeforeUnload = () => {
        navigator.sendBeacon(
          "/api/users/me/call-status",
          JSON.stringify({ isOnline: false, callStatus: "offline" })
        );
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [session]);

  const handleCall = async (professional: Professional) => {
    if (professional.callStatus !== "available" || !professional.isOnline) {
      setCallError("This professional is not available for calls");
      return;
    }

    setCallingTo(professional.id);
    setCallError(null);

    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: professional.id,
          type: "video",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCallError(data.error || "Failed to initiate call");
        return;
      }

      // Call initiated successfully - redirect to call page
      if (data.call && data.call.id) {
        setInitiatedCallId(data.call.id);
        // Redirect to call page
        router.push(`/client/call/${data.call.id}`);
      } else {
        alert(`Call initiated to ${professional.name}. Waiting for acceptance...`);
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      setCallError("Failed to initiate call");
    } finally {
      setCallingTo(null);
    }
  };

  const getAvailabilityBadge = (status: string, isOnline: boolean) => {
    if (status === "available" && isOnline) {
      return <Badge className="bg-green-500">Available</Badge>;
    }
    if (status === "busy") {
      return <Badge className="bg-red-500">Busy</Badge>;
    }
    return <Badge className="bg-gray-500">Offline</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif text-foreground mb-2">
            {t("title") || "Find a Professional"}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle") || "Browse and connect with mental health professionals"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder") || "Search by name or specialty..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tGeneral("all") || "All"}</SelectItem>
              <SelectItem value="available">{tGeneral("available") || "Available"}</SelectItem>
              <SelectItem value="busy">{tGeneral("busy") || "Busy"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Call Error */}
        {callError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {callError}
          </div>
        )}

        {/* Professionals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("noProfessionals") || "No professionals found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.image} />
                        <AvatarFallback>
                          {getInitials(professional.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {professional.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {professional.specialty}
                        </CardDescription>
                      </div>
                    </div>
                    {getAvailabilityBadge(professional.callStatus, professional.isOnline)}
                  </div>
                </CardHeader>
                <CardContent>
                  {professional.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {professional.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {professional.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {professional.location}
                      </div>
                    )}
                    {professional.language && (
                      <div className="flex items-center gap-1">
                        <span className="uppercase">{professional.language}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleCall(professional)}
                      disabled={
                        callingTo === professional.id ||
                        professional.callStatus !== "available" ||
                        !professional.isOnline
                      }
                    >
                      <Video className="h-4 w-4" />
                      {callingTo === professional.id
                        ? tGeneral("calling") || "Calling..."
                        : tGeneral("videoCall") || "Video Call"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/book?professional=${professional.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {tGeneral("book") || "Book"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Calendar({ className, mr }: { className?: string; mr?: number }) {
  return (
    <Clock className={`${className} ${mr ? `mr-${mr}` : ""}`} />
  );
}
