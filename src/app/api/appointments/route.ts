import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Profile from "@/models/Profile";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { calculateAppointmentPricing } from "@/lib/pricing";
import {
  sendAppointmentConfirmation,
  sendProfessionalNotification,
} from "@/lib/notifications";
import { routeAppointmentToProfessionals } from "@/lib/appointment-routing";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clientId = searchParams.get("clientId");

    const query: {
      clientId?: string;
      professionalId?: string;
      status?: string;
      date?: { $gte?: Date; $lte?: Date };
    } = {};

    // Filter by user role (guests are treated like clients)
    if (session.user.role === "client" || session.user.role === "guest") {
      query.clientId = session.user.id;
    } else if (session.user.role === "professional") {
      // Professionals can see their own appointments OR unassigned pending requests
      const showUnassigned = searchParams.get("unassigned") === "true";
      if (showUnassigned) {
        // Show unassigned pending appointments (no professionalId)
        query.professionalId = null as unknown as string;
        query.status = "pending";
      } else {
        query.professionalId = session.user.id;
      }
    }

    // Additional filters
    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate("clientId", "firstName lastName email phone location")
      .populate("professionalId", "firstName lastName email phone")
      .sort({ date: 1, time: 1 });

    return NextResponse.json(appointments);
  } catch (error: unknown) {
    console.error(
      "Get appointments error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to fetch appointments",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const data = await req.json();

    // Ensure the client is the current user if role is client or guest
    if (session.user.role === "client" || session.user.role === "guest") {
      data.clientId = session.user.id;
    }

    // Validate required fields (professionalId is now optional - assigned by professional later)
    if (!data.type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 },
      );
    }

    // Set default therapy type if not provided
    if (!data.therapyType) {
      data.therapyType = "solo";
    }

    // Validate therapy type
    if (!["solo", "couple", "group"].includes(data.therapyType)) {
      return NextResponse.json(
        { error: "Invalid therapy type. Must be solo, couple, or group" },
        { status: 400 },
      );
    }

    // Only validate professional if one is specified
    let profile = null;
    if (data.professionalId) {
      // Verify professional exists and is active
      const professional = await User.findOne({
        _id: data.professionalId,
        role: "professional",
        status: { $in: ["active", "pending"] },
      });

      if (!professional) {
        return NextResponse.json(
          { error: "Professional not found" },
          { status: 404 },
        );
      }

      // Get professional's profile for availability and pricing
      profile = await Profile.findOne({ userId: data.professionalId });

      if (!profile) {
        return NextResponse.json(
          { error: "Professional profile not found" },
          { status: 404 },
        );
      }

      // Validate date/time only if provided with a professional
      if (data.date && data.time) {
        // Validate date is not in the past
        const appointmentDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
          return NextResponse.json(
            { error: "Cannot book appointments in the past" },
            { status: 400 },
          );
        }

        // Check if professional is available on the requested day
        if (profile.availability?.days) {
          const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const dayAvailability = profile.availability.days.find(
            (d) => d.day === dayOfWeek,
          );

          if (!dayAvailability || !dayAvailability.isWorkDay) {
            return NextResponse.json(
              { error: `Professional is not available on ${dayOfWeek}s` },
              { status: 400 },
            );
          }

          // Validate time is within working hours
          const requestedTime = data.time;
          if (
            requestedTime < dayAvailability.startTime ||
            requestedTime >= dayAvailability.endTime
          ) {
            return NextResponse.json(
              {
                error: `Time slot outside of working hours (${dayAvailability.startTime} - ${dayAvailability.endTime})`,
              },
              { status: 400 },
            );
          }
        }

        // Check for double-booking
        const existingAppointment = await Appointment.findOne({
          professionalId: data.professionalId,
          date: appointmentDate,
          time: data.time,
          status: { $in: ["scheduled"] },
        });

        if (existingAppointment) {
          return NextResponse.json(
            { error: "This time slot is already booked" },
            { status: 409 },
          );
        }
      }

      // Calculate pricing based on therapy type using professional or platform defaults
      const pricingResult = await calculateAppointmentPricing(
        data.professionalId,
        data.therapyType,
      );

      // Set pricing in appointment data
      data.price = pricingResult.sessionPrice;
      data.platformFee = pricingResult.platformFee;
      data.professionalPayout = pricingResult.professionalPayout;
    } else {
      // No professional assigned yet - use platform default pricing
      const pricingResult = await calculateAppointmentPricing(
        null,
        data.therapyType,
      );
      data.price = pricingResult.sessionPrice;
      data.platformFee = pricingResult.platformFee;
      data.professionalPayout = pricingResult.professionalPayout;
    }

    // Set default duration from profile or default to 60 minutes
    if (!data.duration) {
      data.duration = profile?.availability?.sessionDurationMinutes || 60;
    }

    // Meeting link will be added by professional after confirming appointment
    // No automatic generation

    // Set status to pending if no professional assigned (request flow)
    if (!data.professionalId) {
      data.status = "pending";
      data.routingStatus = "pending"; // Will be routed after creation
    }

    // Set booking context defaults
    if (!data.bookingFor) {
      data.bookingFor = "self";
    }

    const appointment = new Appointment(data);
    await appointment.save();

    // Route the appointment to professionals if no professional is assigned
    if (!data.professionalId) {
      // Route in background (non-blocking)
      routeAppointmentToProfessionals(appointment._id.toString()).catch((err) =>
        console.error("Error routing appointment:", err)
      );
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("clientId", "firstName lastName email phone location")
      .populate("professionalId", "firstName lastName email phone");

    if (!populatedAppointment) {
      return NextResponse.json(
        { error: "Appointment created but not found" },
        { status: 500 },
      );
    }

    // Send email notifications (non-blocking)
    if (populatedAppointment.professionalId) {
      const professionalDoc =
        populatedAppointment.professionalId as unknown as {
          firstName: string;
          lastName: string;
          email: string;
        };
      const clientDoc = populatedAppointment.clientId as unknown as {
        firstName: string;
        lastName: string;
        email: string;
      };

      const emailData = {
        clientName: `${clientDoc.firstName} ${clientDoc.lastName}`,
        clientEmail: clientDoc.email,
        professionalName: `${professionalDoc.firstName} ${professionalDoc.lastName}`,
        professionalEmail: professionalDoc.email,
        date: populatedAppointment.date?.toISOString(),
        time: populatedAppointment.time,
        duration: populatedAppointment.duration || 60,
        type: populatedAppointment.type as "video" | "in-person" | "phone",
        meetingLink: populatedAppointment.meetingLink,
        location: populatedAppointment.location,
      };

      // Send notifications without blocking the response
      Promise.all([
        sendAppointmentConfirmation(emailData),
        sendProfessionalNotification(emailData),
      ]).catch((err) => console.error("Error sending notifications:", err));
    }

    return NextResponse.json(populatedAppointment, { status: 201 });
  } catch (error: unknown) {
    console.error(
      "Create appointment error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to create appointment",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
