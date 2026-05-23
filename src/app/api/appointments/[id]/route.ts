import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import {
  sendGuestPaymentConfirmation,
  sendMeetingLinkNotification,
  sendCancellationNotification,
  sendRefundConfirmation,
} from "@/lib/notifications";

// Generate a secure payment token for guest users
function generatePaymentToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get the base URL for payment links
function getBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

// Cancellation fee configuration
const CANCELLATION_FEE_PERCENTAGE = 0.15; // 15% cancellation fee
const HOURS_BEFORE_APPOINTMENT_FOR_FREE_CANCELLATION = 24; // Free cancellation if more than 24 hours before

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate("clientId", "firstName lastName email phone location")
      .populate("professionalId", "firstName lastName email phone");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Check if user has access to this appointment
    const isClient = appointment.clientId._id.toString() === session.user.id;
    const isProfessional =
      appointment.professionalId &&
      appointment.professionalId._id.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";
    // Professionals can view unassigned pending appointments
    const canViewUnassigned =
      session.user.role === "professional" &&
      !appointment.professionalId &&
      appointment.status === "pending";

    if (!isClient && !isProfessional && !isAdmin && !canViewUnassigned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error: unknown) {
    console.error("Get appointment error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const data = await req.json();

    // Get the appointment before update to check for status changes
    const oldAppointment = await Appointment.findById(id);

    // If a professional is accepting an unassigned pending request,
    // assign themselves as the professional
    if (
      session.user.role === "professional" &&
      oldAppointment &&
      oldAppointment.status === "pending" &&
      !oldAppointment.professionalId &&
      data.status === "scheduled"
    ) {
      data.professionalId = session.user.id;
    }

    // If status is being set to ongoing and scheduledStartAt is not provided,
    // derive scheduledStartAt from the existing date/time fields so that
    // timers can consistently count from the scheduled start time.
    if (
      data.status === "ongoing" &&
      !data.scheduledStartAt &&
      oldAppointment &&
      oldAppointment.date
    ) {
      try {
        const baseDate =
          oldAppointment.date instanceof Date
            ? new Date(oldAppointment.date)
            : new Date(oldAppointment.date as Date);
        if (!isNaN(baseDate.getTime())) {
          const [hoursStr, minutesStr] = (oldAppointment.time || "00:00").split(
            ":",
          );
          const hours = parseInt(hoursStr || "0", 10);
          const minutes = parseInt(minutesStr || "0", 10);
          baseDate.setHours(hours);
          baseDate.setMinutes(minutes);
          baseDate.setSeconds(0);
          baseDate.setMilliseconds(0);
          data.scheduledStartAt = baseDate;
        }
      } catch {
        // If anything goes wrong deriving scheduledStartAt, skip setting it
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate(
        "clientId",
        "firstName lastName email phone location stripeCustomerId",
      )
      .populate("professionalId", "firstName lastName email phone");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Send confirmation email to guest users when professional confirms the appointment
    if (
      oldAppointment &&
      oldAppointment.status === "pending" &&
      appointment.status === "scheduled"
    ) {
      const client = appointment.clientId as unknown as {
        _id: { toString: () => string };
        email: string;
        firstName: string;
        lastName: string;
      };
      const professional = appointment.professionalId as unknown as {
        _id: { toString: () => string };
        firstName: string;
        lastName: string;
      };

      // Send confirmation email to guest users with payment link
      const clientUser = await User.findById(client._id);
      if (clientUser && clientUser.role === "guest") {
        // Generate payment token for guest user
        const paymentToken = generatePaymentToken();
        const paymentTokenExpiry = new Date();
        paymentTokenExpiry.setDate(paymentTokenExpiry.getDate() + 7); // Token valid for 7 days

        // Save payment token to appointment under payment object
        await Appointment.findByIdAndUpdate(id, {
          "payment.paymentToken": paymentToken,
          "payment.paymentTokenExpiry": paymentTokenExpiry,
        });

        // Generate payment link
        const paymentLink = `${getBaseUrl()}/pay?token=${paymentToken}`;

        sendGuestPaymentConfirmation({
          guestName: `${client.firstName} ${client.lastName}`,
          guestEmail: client.email,
          professionalName: `${professional.firstName} ${professional.lastName}`,
          date: appointment.date
            ? appointment.date.toISOString()
            : "To be scheduled",
          time: appointment.time || "To be scheduled",
          duration: appointment.duration || 60,
          type: appointment.type,
          therapyType: appointment.therapyType || "solo",
          price: appointment.payment.price,
          paymentLink,
        }).catch((err) =>
          console.error("Error sending guest confirmation email:", err),
        );
      }
    }

    // Send meeting link notification to guest users when professional adds meeting link
    if (
      oldAppointment &&
      !oldAppointment.meetingLink &&
      appointment.meetingLink &&
      data.meetingLink
    ) {
      const client = appointment.clientId as unknown as {
        _id: { toString: () => string };
        email: string;
        firstName: string;
        lastName: string;
      };
      const professional = appointment.professionalId as unknown as {
        firstName: string;
        lastName: string;
      };

      // Check if client is a guest user
      const clientUser = await User.findById(client._id);
      
      // Send notification to all clients (guests and logged-in clients)
      sendMeetingLinkNotification({
        guestName: `${client.firstName} ${client.lastName}`,
        guestEmail: client.email,
        professionalName: `${professional.firstName} ${professional.lastName}`,
        date: appointment.date
          ? appointment.date.toISOString()
          : "To be scheduled",
        time: appointment.time || "To be scheduled",
        duration: appointment.duration || 60,
        type: appointment.type,
        meetingLink: appointment.meetingLink,
      }).catch((err) =>
        console.error("Error sending meeting link notification email:", err),
      );
    }

    // Send cancellation notification if status changed to cancelled
    if (
      oldAppointment &&
      appointment.status === "cancelled" &&
      oldAppointment.status !== "cancelled"
    ) {
      const cancelledBy =
        session.user.role === "client" ? "client" : "professional";

      // Update cancellation metadata
      appointment.cancelledBy = cancelledBy;
      appointment.cancelledAt = new Date();

      // Get client and professional info for cancellation email
      const client = appointment.clientId as unknown as {
        firstName: string;
        lastName: string;
        email: string;
      };
      const professional = appointment.professionalId as unknown as {
        firstName: string;
        lastName: string;
        email: string;
      };

      // Process automatic refund if appointment was paid
      if (appointment.payment.status === "paid") {
        try {
          console.log(
            `Processing refund for appointment ${id}`,
          );

          // Calculate hours until appointment
          const appointmentDateTime = appointment.date
            ? new Date(appointment.date)
            : new Date();
          const now = new Date();
          const hoursUntilAppointment =
            (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          // Determine if cancellation fee applies (only for client cancellations)
          const isFreeCancel =
            hoursUntilAppointment >=
            HOURS_BEFORE_APPOINTMENT_FOR_FREE_CANCELLATION;
          const isClientCancellation = cancelledBy === "client";

          let refundAmount = appointment.payment.price || 0;
          let cancellationFee = 0;

          // Apply cancellation fee only for client cancellations within 24 hours
          if (isClientCancellation && !isFreeCancel) {
            cancellationFee = refundAmount * CANCELLATION_FEE_PERCENTAGE;
            refundAmount = refundAmount - cancellationFee;
          }

          // Note: Refund processing requires payment processor integration
          // Simulated refund - implement with your payment provider
          console.log(
            `Refund simulated: $${refundAmount} (Fee: $${cancellationFee.toFixed(2)})`,
          );

          // Send refund confirmation email
          const clientForRefund = appointment.clientId as unknown as {
            firstName: string;
            lastName: string;
            email: string;
          };
          sendRefundConfirmation({
            name: `${clientForRefund.firstName} ${clientForRefund.lastName}`,
            email: clientForRefund.email,
            amount: refundAmount,
            appointmentDate: appointment.date?.toISOString(),
          }).catch((err) =>
            console.error("Error sending refund confirmation:", err),
          );

          // Update payment status to refunded
          appointment.payment.status = "refunded";
          appointment.payment.refundedAt = new Date();
          await appointment.save();
        } catch (refundError: unknown) {
          console.error("Error processing automatic refund:", refundError);
          // Don't fail the cancellation if refund fails - log it for manual processing
          console.error(
            `Manual refund required for appointment ${id}`,
          );
        }
      } else if (appointment.payment.status === "pending") {
        // If payment is still pending, mark as cancelled
        appointment.payment.status = "cancelled";
        await appointment.save();
      }
    }

    return NextResponse.json(appointment);
  } catch (error: unknown) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      {
        error: "Failed to update appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
