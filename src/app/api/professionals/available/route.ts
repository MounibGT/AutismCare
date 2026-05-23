import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Appointment from "@/models/Appointment";

/**
 * GET /api/professionals/available
 * Returns professionals available at a specific date and time
 * Query params:
 * - date: YYYY-MM-DD
 * - time: HH:mm (24h format)
 * - duration: minutes (default 60)
 * - type: video|in-person|phone (modality)
 * - therapyType: solo|couple|group
 * - theme: issue theme to filter professionals by their specialties/problematic areas
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const timeStr = searchParams.get("time");
    const duration = parseInt(searchParams.get("duration") || "60");
    const type = searchParams.get("type") as "video" | "in-person" | "phone" | null;
    const therapyType = searchParams.get("therapyType") as "solo" | "couple" | "group" | null;
    const theme = searchParams.get("theme") as string | null;

    // Validate required parameters
    if (!dateStr || !timeStr) {
      return NextResponse.json(
        { error: "Missing required parameters: date and time" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(dateStr);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Get day of week from the date (e.g., "Monday")
    const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Parse time
    const [hours, minutes] = timeStr.split(":").map(Number);
    const appointmentStart = hours * 60 + minutes; // minutes from midnight
    const appointmentEnd = appointmentStart + duration;

    // Build query for active professionals
    const query: any = {
      role: "professional",
      status: "active"
    };

    // Get active professionals
    const professionals = await User.find(query)
      .select("_id firstName lastName email phone image language location isOnline callStatus")
      .lean();

    // Get profiles for these professionals
    const professionalIds = professionals.map((p: any) => p._id);
    const profiles = await Profile.find({
      userId: { $in: professionalIds },
      profileCompleted: true,
    }).lean();

    // Get existing appointments for this date/time window for all professionals
    // We need to find appointments that overlap with the requested slot
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const existingAppointments = await Appointment.find({
      professionalId: { $in: professionalIds },
      date: { $lt: endDateTime, $gte: new Date(startDateTime.getTime() - 24 * 60 * 60 * 1000) }, // appointments on same day within reasonable window
      status: { $in: ["scheduled", "ongoing"] },
    })
      .select("professionalId date time duration")
      .lean();

    // Filter professionals
    const availableProfessionals: any[] = [];

    for (const prof of professionals) {
      const profile = profiles.find((p: any) => p.userId.toString() === prof._id.toString());

      // Check modality match
      if (type && profile) {
        const modalityMap: Record<string, string> = {
          "video": "online",
          "in-person": "inPerson",
          "phone": "phone",
        };
        const requiredModality = modalityMap[type];
        const hasModality = profile.modalities?.includes(requiredModality) ||
                            profile.modalities?.includes("both");
        if (!hasModality) continue;
      }

      // Check therapy type match if needed
      if (therapyType && profile) {
        const sessionTypeMap: Record<string, string> = {
          "solo": "individual",
          "couple": "couple",
          "group": "group",
        };
        const requiredSession = sessionTypeMap[therapyType];
        if (!profile.sessionTypes?.some((t: string) =>
          t.toLowerCase().includes(requiredSession)
        )) {
          continue;
        }
      }

      // Check theme/problematics match if provided
      if (theme && profile) {
        const themeLower = theme.toLowerCase();
        const problematics = profile.problematics || [];
        const specialties = profile.specialty ? [profile.specialty] : [];
        const skills = profile.skills || [];
        
        // Check if theme matches any problematic area, specialty, or skill
        const themeMatches = [
          ...problematics.map((p: string) => p.toLowerCase()),
          ...specialties.map((s: string) => s.toLowerCase()),
          ...skills.map((s: string) => s.toLowerCase()),
        ].some((field: string) => 
          field.includes(themeLower) || themeLower.includes(field)
        );
        
        if (!themeMatches) continue;
      }

      // Check general availability pattern
      if (profile?.availability?.days) {
        const dayAvailability = profile.availability.days.find(
          (d: any) => d.day === dayOfWeek
        );

        if (!dayAvailability || !dayAvailability.isWorkDay) {
          continue;
        }

        // Check if requested time falls within working hours
        const [startHour, startMin] = dayAvailability.startTime.split(":").map(Number);
        const [endHour, endMin] = dayAvailability.endTime.split(":").map(Number);
        const workStart = startHour * 60 + startMin;
        const workEnd = endHour * 60 + endMin;

        if (appointmentStart < workStart || appointmentEnd > workEnd) {
          continue;
        }
      } else {
        // No availability set, skip
        continue;
      }

      // Check for conflicting appointments
      const profAppointments = existingAppointments.filter(
        (apt: any) => apt.professionalId.toString() === prof._id.toString()
      );

      let hasConflict = false;
      for (const apt of profAppointments) {
        if (!apt.date) continue;
        const aptStart = new Date(apt.date);
        if (apt.time) {
          const aptHours = apt.time.split(":")[0];
          const aptMinutes = apt.time.split(":")[1];
          aptStart.setHours(parseInt(aptHours), parseInt(aptMinutes), 0, 0);
        }
        const aptEnd = aptStart.getTime() + apt.duration * 60000;

        // Check overlap
        if (
          (startDateTime.getTime() >= aptStart.getTime() && startDateTime.getTime() < aptEnd) ||
          (aptStart.getTime() >= startDateTime.getTime() && aptStart.getTime() < endDateTime.getTime())
        ) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) continue;

      // Professional is available!
      availableProfessionals.push({
        id: prof._id.toString(),
        name: `${prof.firstName} ${prof.lastName}`,
        firstName: prof.firstName,
        lastName: prof.lastName,
        email: prof.email,
        phone: prof.phone,
        image: prof.image,
        language: prof.language,
        location: prof.location,
        isOnline: prof.isOnline || false,
        callStatus: prof.callStatus || "offline",
        specialty: profile?.specialty || "General Practice",
        bio: profile?.bio || "",
        yearsOfExperience: profile?.yearsOfExperience || 0,
        nextAvailable: startDateTime.toISOString(),
      });
    }

    return NextResponse.json({
      professionals: availableProfessionals,
      count: availableProfessionals.length,
      search: { date: dateStr, time: timeStr, duration, type, therapyType, theme },
    });
  } catch (error: any) {
    console.error("Available professionals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available professionals", details: error.message },
      { status: 500 }
    );
  }
}