"use client";

import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { appointmentsAPI } from "@/lib/api-client";
import { AppointmentResponse } from "@/types/api";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  lastSession: string;
  totalSessions: number;
  issueType: string;
  joinedDate: string;
  address?: string;
  age?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientDetailsModal({
  isOpen,
  onClose,
  client,
}: ClientDetailsModalProps) {
  const t = useTranslations("Dashboard.clientModal");
  const [sessions, setSessions] = useState<AppointmentResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (client) {
      const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
          const data = await appointmentsAPI.list({
            clientId: client.id,
          });
          setSessions(data);
        } catch (error) {
          console.error("Failed to fetch sessions:", error);
          setSessions([]);
        } finally {
          setSessionsLoading(false);
        }
      };
      fetchSessions();
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const getStatusBadge = (status: Client["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-light ${styles[status]}`}
      >
        {t(`overview.${status}`)}
      </span>
    );
  };

  const getSessionStatusBadge = (status: AppointmentResponse["status"]) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      scheduled: "bg-blue-100 text-blue-700",
      "no-show": "bg-orange-100 text-orange-700",
      ongoing: "bg-purple-100 text-purple-700",
      pending: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-light ${styles[status]}`}
      >
        {t(`sessions.${status}`)}
      </span>
    );
  };

  const getPaymentStatusBadge = (
    paymentStatus: AppointmentResponse["payment"]["status"],
  ) => {
    const styles = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      overdue: "bg-orange-100 text-orange-700",
      cancelled: "bg-red-100 text-red-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-brown-100 text-brown-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-light ${styles[paymentStatus]}`}
      >
        {t(`sessions.${paymentStatus}`)}
      </span>
    );
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-serif">
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">
                {client.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(client.status)}
                <span className="text-sm text-muted-foreground font-light">
                  {formatShortDate(client.joinedDate)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Information */}
          <div className="rounded-xl bg-card p-6">
            <h3 className="text-lg font-serif font-light text-foreground mb-4">
              {t("overview.contactInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-light mb-1">
                      {t("overview.email")}
                    </p>
                    <p className="text-sm text-foreground">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-light mb-1">
                      {t("overview.phone")}
                    </p>
                    <p className="text-sm text-foreground">{client.phone}</p>
                  </div>
                </div>

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Address
                      </p>
                      <p className="text-sm text-foreground">
                        {client.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-light mb-1">
                      {t("overview.issueType")}
                    </p>
                    <p className="text-sm text-foreground">
                      {client.issueType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-light mb-1">
                      {t("overview.totalSessions")}
                    </p>
                    <p className="text-sm text-foreground">
                      {client.totalSessions} {t("overview.sessions")}
                    </p>
                  </div>
                </div>

                {client.age && (
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Age
                      </p>
                      <p className="text-sm text-foreground">
                        {client.age} years old
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {client.emergencyContact && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-sm font-light text-muted-foreground mb-3">
                  Emergency Contact
                </p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-light mb-1">
                      Name
                    </p>
                    <p className="text-sm text-foreground">
                      {client.emergencyContact}
                    </p>
                  </div>
                  {client.emergencyPhone && (
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-foreground">
                        {client.emergencyPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="rounded-xl bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-light text-foreground">
                {t("sessions.title")}
              </h3>
              <button className="text-sm text-primary hover:text-primary/80 font-light transition-colors">
                {t("sessions.viewNotes")}
              </button>
            </div>

            <div className="space-y-3">
              {sessionsLoading ? (
                <p className="text-center text-muted-foreground">
                  Loading sessions...
                </p>
              ) : sessions.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No sessions found
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className="rounded-lg bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-medium text-foreground">
                            {session.type}
                          </p>
                          {getSessionStatusBadge(session.status)}
                          {getPaymentStatusBadge(session.payment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-light mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatShortDate(session.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {session.duration} {t("sessions.duration")}
                            </span>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground font-light">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-foreground font-light transition-colors hover:text-muted-foreground rounded-full"
            >
              {t("actions.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
