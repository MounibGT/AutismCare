import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Profile from "@/models/Profile";
import User from "@/models/User";
import PlatformSettings from "@/models/PlatformSettings";
import { authOptions } from "@/lib/auth";

// Helper function to generate time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  sessionDuration: number,
  breakDuration: number,
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes + sessionDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    slots.push(timeString);
    currentMinutes += sessionDuration + breakDuration;
  }

  return slots;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    let professionalId = searchParams.get("professionalId");
    const dateStr = searchParams.get("date");

    // Debug logging
    console.log("=== Available Slots API ===");
    console.log("Query params:", req.url);
    console.log("professionalId from query:", professionalId);
    console.log("dateStr:", dateStr);

    // If no professionalId provided, check if caller is an authenticated professional
    // and use their own ID (for scheduling from requests page)
    if (!professionalId) {
      const session = await getServerSession(authOptions);
      console.log("Session check for available slots:", { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id, 
        role: session?.user?.role 
      });
      
      if (session?.user?.id && session.user.role === "professional") {
        professionalId = session.user.id;
        console.log("Using professionalId from session:", professionalId);
      } else {
        console.log("No valid session - checking if this is a client booking");
      }
    }

    if (!professionalId || !dateStr) {
      console.log("ERROR: Missing parameters - professionalId:", professionalId, "dateStr:", dateStr);
      return NextResponse.json(
        { error: "Missing required parameters: professionalId and date" },
        { status: 400 },
      );
    }

    // Verify professional exists
    const professional = await User.findOne({
      _id: professionalId,
      role: "professional",
      status: { $in: ["active", "pending"] },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 },
      );
    }

    // Get professional's profile for availability
    const profile = await Profile.findOne({ userId: professionalId });

    console.log("=== Profile Check ===");
    console.log("Profile found:", !!profile);
    console.log("Profile has availability:", !!(profile && profile.availability));
    console.log("Profile availability days:", profile?.availability?.days?.length || 0);

    if (!profile) {
      console.log("ERROR: Profile not found for professionalId:", professionalId);
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 },
      );
    }

    if (!profile.availability) {
      console.log("ERROR: Availability not configured for professionalId:", professionalId);
      return NextResponse.json(
        { 
          error: "Professional availability not configured", 
          message: "Please configure your availability in your profile settings first" 
        },
        { status: 404 },
      );
    }

    if (!profile.availability.days || profile.availability.days.length === 0) {
      console.log("ERROR: No availability days configured");
      return NextResponse.json(
        { 
          error: "No availability days configured", 
          message: "Please set up your working days in your profile" 
        },
        { status: 404 },
      );
    }

    // Parse requested date - handle both ISO and YYYY-MM-DD formats
    // Frontend sends ISO string like "2026-02-22", which is UTC date
    let requestedDate: Date;
    const dateInput = dateStr || "";
    
    if (dateInput.includes("T")) {
      // Full ISO format
      requestedDate = new Date(dateInput);
    } else {
      // YYYY-MM-DD format - append time to ensure correct date parsing
      // Use noon to avoid timezone shift issues
      requestedDate = new Date(dateInput + "T12:00:00");
    }
    
    // Validate date
    if (isNaN(requestedDate.getTime())) {
      console.log("ERROR: Invalid date input:", dateStr);
      return NextResponse.json(
        { error: "Invalid date format", details: "Date must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    // Get day of week - force English locale to match Profile schema
    // Use UTC to ensure consistent day calculation regardless of server timezone
    const utcDate = new Date(requestedDate.toISOString());
    const dayOfWeek = utcDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    });

    console.log("=== Date Parsing Debug ===");
    console.log("Input dateStr:", dateStr);
    console.log("Parsed requestedDate:", requestedDate.toISOString());
    console.log("Calculated dayOfWeek (UTC):", dayOfWeek);

    // Find availability for the requested day
    const dayAvailability = profile.availability.days.find(
      (d) => d.day === dayOfWeek,
    );

    // DEBUG: Log availability check
    console.log("=== Day Availability Check ===");
    console.log("Requested dayOfWeek:", dayOfWeek);
    console.log("Profile availability days:", JSON.stringify(profile.availability.days));
    console.log("Found dayAvailability:", JSON.stringify(dayAvailability));

    if (!dayAvailability || !dayAvailability.isWorkDay) {
      console.log("DEBUG: Day is not a work day or not found");
      return NextResponse.json({
        date: dateStr,
        dayOfWeek,
        available: false,
        slots: [],
        message: `Professional is not available on ${dayOfWeek}s`,
      });
    }

    // Generate all possible time slots
    const sessionDuration = profile.availability.sessionDurationMinutes || 60;
    const breakDuration = profile.availability.breakDurationMinutes || 15;

    const allSlots = generateTimeSlots(
      dayAvailability.startTime,
      dayAvailability.endTime,
      sessionDuration,
      breakDuration,
    );

    // Get existing appointments for this professional on this date
    // Use date range to ensure proper matching (start of day to end of day)
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log("=== MongoDB Query Debug ===");
    console.log("Query date range:", { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() });
    
    const existingAppointments = await Appointment.find({
      professionalId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["scheduled"] },
    }).select("time duration");

    // Filter out booked slots
    const bookedTimes = new Set(existingAppointments.map((apt) => apt.time));

    const availableSlots = allSlots
      .filter((slot) => !bookedTimes.has(slot))
      .map((time) => ({
        time,
        duration: sessionDuration,
        available: true,
      }));

    // Check if date is in the past (using UTC for consistent comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = requestedDate < today;

    // Check if date is today and filter out past times
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();

    const filteredSlots = availableSlots.filter((slot) => {
      if (isPast) return false;
      if (isToday) {
        const [hours, minutes] = slot.time.split(":").map(Number);
        const slotTime = new Date(requestedDate);
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      }
      return true;
    });

    // Get pricing information (professional or platform defaults)
    let pricingInfo: {
      individualSession?: number;
      coupleSession?: number;
      groupSession?: number;
    } = profile.pricing || {};

    // If professional doesn't have pricing set, use platform defaults
    if (
      !pricingInfo.individualSession &&
      !pricingInfo.coupleSession &&
      !pricingInfo.groupSession
    ) {
      let platformSettings = await PlatformSettings.findOne();

      if (!platformSettings) {
        platformSettings = new PlatformSettings({
          defaultPricing: {
            solo: 120,
            couple: 150,
            group: 80,
          },
          platformFeePercentage: 10,
          currency: "CAD",
        });
        await platformSettings.save();
      }

      pricingInfo = {
        individualSession: platformSettings.defaultPricing.solo,
        coupleSession: platformSettings.defaultPricing.couple,
        groupSession: platformSettings.defaultPricing.group,
      };
    }

    return NextResponse.json({
      date: dateStr,
      dayOfWeek,
      available: filteredSlots.length > 0,
      slots: filteredSlots,
      professionalInfo: {
        id: professional._id,
        name: `${professional.firstName} ${professional.lastName}`,
        sessionDuration,
        pricing: pricingInfo,
        sessionTypes: profile.sessionTypes || [],
      },
      workingHours: {
        start: dayAvailability.startTime,
        end: dayAvailability.endTime,
      },
    });
  } catch (error: unknown) {
    console.error("Get available slots error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch available slots",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
