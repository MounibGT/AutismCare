"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appointmentsAPI } from "@/lib/api-client";
import { CancelAppointmentDialog } from "@/components/appointments";
import Link from "next/link";
import type { AppointmentResponse } from "@/types/api";

export default function ClientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<AppointmentResponse | null>(null);
  const t = useTranslations("Client.appointments");
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentsAPI.list();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  const openCancelDialog = (appointment: AppointmentResponse) => {
    setAppointmentToCancel(appointment);
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setAppointmentToCancel(null);
  };

  const handleCancelSuccess = () => {
    fetchAppointments();
    closeCancelDialog();
  };

  const handleJoinSession = (appointment: AppointmentResponse) => {
    if (
      appointment.meetingLink &&
      appointment.status === "ongoing" &&
      appointment.payment.status === "paid"
    ) {
      // Refresh the appointment data before opening the link
      fetchAppointments().then(() => {
        // Find the updated appointment
        const updatedAppointment = appointments.find(apt => apt._id === appointment._id);
        if (updatedAppointment?.meetingLink) {
          window.open(updatedAppointment.meetingLink, "_blank");
        } else if (appointment.meetingLink) {
          // Fallback to original if not found
          window.open(appointment.meetingLink, "_blank");
        }
      });
    }
  };

  // Filter appointments into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = apt.date ? new Date(apt.date) : today;
    return (
      aptDate >= today &&
      ["scheduled", "pending", "ongoing"].includes(apt.status)
    );
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = apt.date ? new Date(apt.date) : today;
    return (
      aptDate < today ||
      ["completed", "cancelled", "no-show"].includes(apt.status)
    );
  });

  const currentAppointments =
    activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const getModalityIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/15 text-primary";
      case "completed":
        return "bg-green-500/15 text-green-700 dark:text-green-400";
      case "cancelled":
        return "bg-red-500/15 text-red-700 dark:text-red-400";
      case "no-show":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild className="gap-2 rounded-full">
          <Link href="/appointment">
            <Calendar className="h-4 w-4" />
            {t("requestNew")}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-t-lg px-6 py-3 font-medium transition ${
            activeTab === "upcoming"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("upcoming")}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`rounded-t-lg px-6 py-3 font-medium transition ${
            activeTab === "past"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("past")}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 font-serif text-xl text-red-700">{t("error")}</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <Button
            onClick={fetchAppointments}
            variant="outline"
            className="mt-4"
          >
            {t("retry")}
          </Button>
        </div>
      ) : currentAppointments.length === 0 ? (
        <div className="rounded-3xl border border-border/20 bg-card/80 p-12 text-center shadow-lg">
          <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-xl text-foreground">
            {activeTab === "upcoming" ? t("noUpcoming") : t("noPast")}
          </h3>
          {activeTab === "upcoming" && (
            <Button
              onClick={() => router.push("/appointment")}
              className="mt-6 gap-2 rounded-full"
            >
              <Calendar className="h-4 w-4" />
              {t("requestNew")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg transition hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-light text-foreground">
                        {appointment.date
                          ? formatDate(appointment.date)
                          : "to be scheduled"}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </span>
                        <span>
                          {appointment.duration} {t("minutes")}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  {appointment.professionalId && (
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {appointment.professionalId.firstName}{" "}
                          {appointment.professionalId.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.professionalId.email}
                        </p>
                        {appointment.type === "phone" && appointment.professionalId.phone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.professionalId.phone}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getModalityIcon(appointment.type)}
                      <span>
                        {appointment.type === "in-person"
                          ? "In Person"
                          : appointment.type.charAt(0).toUpperCase() +
                            appointment.type.slice(1)}
                      </span>
                    </div>
                    {appointment.issueType && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Concern:</span>
                        <span>{appointment.issueType}</span>
                      </div>
                    )}
                  </div>

                  {/* Location for in-person sessions */}
                  {appointment.type === "in-person" && appointment.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-4 w-4" />
                        {appointment.location}
                      </a>
                    </div>
                  )}

                  {/* Professional phone for phone sessions */}
                  {appointment.type === "phone" && appointment.professionalId?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <a
                        href={`tel:${appointment.professionalId.phone}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        {appointment.professionalId.phone}
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="rounded-2xl border border-border/20 bg-card/70 p-4">
                      <p className="text-sm font-medium text-foreground">
                        {t("details.notes")}:
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {activeTab === "upcoming" &&
                      appointment.status === "scheduled" && (
                        <>
                          {appointment.type === "video" &&
                            appointment.meetingLink && (
                              <Button
                                onClick={() => {
                                  if (appointment.meetingLink) {
                                    window.open(appointment.meetingLink, "_blank");
                                  }
                                }}
                                className="gap-2 rounded-full"
                              >
                                <Video className="h-4 w-4" />
                                {t("actions.joinSession")}
                              </Button>
                            )}
                          <Button
                            variant="outline"
                            onClick={() => openCancelDialog(appointment)}
                            className="gap-2 rounded-full text-red-600 hover:text-red-700"
                          >
                            {t("actions.cancel")}
                          </Button>
                        </>
                      )}
                    {activeTab === "upcoming" &&
                      appointment.status === "ongoing" &&
                      appointment.type === "video" &&
                      appointment.meetingLink &&
                      appointment.payment.status === "paid" && (
                        <Button
                          onClick={() => handleJoinSession(appointment)}
                          className="gap-2 rounded-full"
                        >
                          <Video className="h-4 w-4" />
                          {t("actions.joinSession")}
                        </Button>
                      )}
                  </div>
                </div>

                {/* More Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {appointment.type === "phone" &&
                      appointment.professionalId?.phone && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`tel:${appointment.professionalId.phone}`}
                            className="flex items-center cursor-pointer"
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Call Professional
                          </a>
                        </DropdownMenuItem>
                      )}
                    {appointment.type === "in-person" &&
                      appointment.location && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center cursor-pointer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Open in Google Maps
                          </a>
                        </DropdownMenuItem>
                      )}
                    {appointment.meetingLink &&
                      (appointment.status === "scheduled" ||
                        appointment.status === "ongoing") && (
                        <DropdownMenuItem
                          onClick={() => {
                            // Refresh data before opening
                            fetchAppointments().then(() => {
                              const updated = appointments.find(apt => apt._id === appointment._id);
                              const link = updated?.meetingLink || appointment.meetingLink;
                              if (link) {
                                window.open(link, "_blank");
                              }
                            });
                          }}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Open meeting link
                        </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Appointment Dialog */}
      {appointmentToCancel && (
        <CancelAppointmentDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          appointmentId={appointmentToCancel._id}
          appointmentDate={appointmentToCancel.date}
          appointmentTime={appointmentToCancel.time}
          amount={appointmentToCancel.payment.price}
          isPaid={appointmentToCancel.payment.status === "paid"}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
