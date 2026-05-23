import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Profile from "@/models/Profile";
import User from "@/models/User";
import { calculateAppointmentPricing } from "@/lib/pricing";
import {
  sendGuestBookingConfirmation,
  sendProfessionalNotification,
} from "@/lib/notifications";
import { routeAppointmentToProfessionals } from "@/lib/appointment-routing";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const data = await req.json();

    // Extract guest info and appointment data
    const { guestInfo, ...appointmentData } = data;

    if (!guestInfo) {
      return NextResponse.json(
        { error: "Guest information is required" },
        { status: 400 },
      );
    }

    // Validate guest info
    const { firstName, lastName, email, phone, location } = guestInfo;

    if (!firstName || !lastName || !email || !phone || !location) {
      return NextResponse.json(
        {
          error:
            "All guest information fields are required (firstName, lastName, email, phone, location)",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate required appointment fields (professionalId is now optional)
    if (!appointmentData.type) {
      return NextResponse.json(
        {
          error: "Missing required appointment field: type",
        },
        { status: 400 },
      );
    }

    // Set default therapy type if not provided
    if (!appointmentData.therapyType) {
      appointmentData.therapyType = "solo";
    }

    // Validate therapy type
    if (!["solo", "couple", "group"].includes(appointmentData.therapyType)) {
      return NextResponse.json(
        { error: "Invalid therapy type. Must be solo, couple, or group" },
        { status: 400 },
      );
    }

    // Find or create guest user
    let guestUser = await User.findOne({
      email: email.toLowerCase(),
      role: "guest",
    });

    if (guestUser) {
      // Update guest user information if they book again
      guestUser.firstName = firstName;
      guestUser.lastName = lastName;
      guestUser.phone = phone;
      guestUser.location = location;
      await guestUser.save();
    } else {
      // Create new guest user
      guestUser = new User({
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        location,
        role: "guest",
        status: "active",
        language: "en",
      });
      await guestUser.save();
    }

    // Only validate professional if one is specified
    let profile = null;
    if (appointmentData.professionalId) {
      // Verify professional exists and is active
      const professional = await User.findOne({
        _id: appointmentData.professionalId,
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
      profile = await Profile.findOne({
        userId: appointmentData.professionalId,
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Professional profile not found" },
          { status: 404 },
        );
      }

      // Validate date/time only if provided with a professional
      if (appointmentData.date && appointmentData.time) {
        // Validate date is not in the past
        const appointmentDate = new Date(appointmentData.date);
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
          const requestedTime = appointmentData.time;
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
          professionalId: appointmentData.professionalId,
          date: appointmentDate,
          time: appointmentData.time,
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
        appointmentData.professionalId,
        appointmentData.therapyType,
      );

      // Set pricing in appointment data
      appointmentData.price = pricingResult.sessionPrice;
      appointmentData.platformFee = pricingResult.platformFee;
      appointmentData.professionalPayout = pricingResult.professionalPayout;
    } else {
      // No professional assigned yet - use platform default pricing
      const pricingResult = await calculateAppointmentPricing(
        null,
        appointmentData.therapyType,
      );
      appointmentData.price = pricingResult.sessionPrice;
      appointmentData.platformFee = pricingResult.platformFee;
      appointmentData.professionalPayout = pricingResult.professionalPayout;
    }

    // Set default duration from profile or default to 60 minutes
    if (!appointmentData.duration) {
      appointmentData.duration =
        profile?.availability?.sessionDurationMinutes || 60;
    }

    // Set the client ID to the guest user
    appointmentData.clientId = guestUser._id;

    // Set booking context defaults
    if (!appointmentData.bookingFor) {
      appointmentData.bookingFor = "self";
    }

    // Create the appointment with pending payment status (payment after professional confirmation)
    const appointment = new Appointment({
      ...appointmentData,
      status: "pending", // Pending until professional confirms
      routingStatus: appointmentData.professionalId ? "accepted" : "pending", // Will be routed if no professional
      payment: {
        price: appointmentData.price,
        platformFee: appointmentData.platformFee,
        professionalPayout: appointmentData.professionalPayout,
        status: "pending",
      },
    });
    await appointment.save();

    // Route the appointment to professionals if no professional is assigned
    if (!appointmentData.professionalId) {
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

    // Send email notifications only if professional is assigned
    if (populatedAppointment.professionalId) {
      const professionalDoc =
        populatedAppointment.professionalId as unknown as {
          firstName: string;
          lastName: string;
          email: string;
        };

      // Send confirmation email to guest
      sendGuestBookingConfirmation({
        guestName: `${firstName} ${lastName}`,
        guestEmail: email,
        professionalName: `${professionalDoc.firstName} ${professionalDoc.lastName}`,
        date: appointmentData.date || "To be scheduled",
        time: appointmentData.time || "To be scheduled",
        duration: appointmentData.duration || 60,
        type: appointmentData.type,
        therapyType: appointmentData.therapyType,
        price: appointmentData.price,
      }).catch((err) =>
        console.error("Error sending guest confirmation email:", err),
      );

      // Send notification to professional
      sendProfessionalNotification({
        clientName: `${firstName} ${lastName}`,
        clientEmail: email,
        professionalName: `${professionalDoc.firstName} ${professionalDoc.lastName}`,
        professionalEmail: professionalDoc.email,
        date: appointmentData.date || "To be scheduled",
        time: appointmentData.time || "To be scheduled",
        duration: appointmentData.duration || 60,
        type: appointmentData.type,
      }).catch((err) =>
        console.error("Error sending professional notification email:", err),
      );
    } else {
      // Send confirmation email to guest without professional info
      sendGuestBookingConfirmation({
        guestName: `${firstName} ${lastName}`,
        guestEmail: email,
        professionalName: "To be assigned",
        date: appointmentData.date || "To be scheduled",
        time: appointmentData.time || "To be scheduled",
        duration: appointmentData.duration || 60,
        type: appointmentData.type,
        therapyType: appointmentData.therapyType,
        price: appointmentData.price,
      }).catch((err) =>
        console.error("Error sending guest confirmation email:", err),
      );
    }

    return NextResponse.json(
      {
        appointmentId: populatedAppointment._id,
        appointment: populatedAppointment,
        message:
          "Appointment created successfully. A confirmation email has been sent to " +
          email,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error(
      "Create guest appointment error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to create appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
