 import { NextRequest, NextResponse } from "next/server";
 import { getServerSession } from "next-auth";
 import connectToDatabase from "@/lib/mongodb";
 import Appointment from "@/models/Appointment";
 import { authOptions } from "@/lib/auth";

 /**
  * POST /api/appointments/[id]/accept
  * Professional accepts a proposed or general appointment
  */
 export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
   try {
     const session = await getServerSession(authOptions);

     if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     if (session.user.role !== "professional") {
       return NextResponse.json(
         { error: "Only professionals can accept appointments" },
         { status: 403 }
       );
     }

     await connectToDatabase();

     const { id } = await params;
     const appointment = await Appointment.findById(id);

     if (!appointment) {
       return NextResponse.json(
         { error: "Appointment not found" },
         { status: 404 }
       );
     }

     // Check if appointment can be accepted
     if (appointment.status !== "pending") {
       return NextResponse.json(
         { error: "Appointment is no longer pending" },
         { status: 400 }
       );
     }

     if (appointment.professionalId) {
       return NextResponse.json(
         { error: "Appointment already assigned to a professional" },
         { status: 400 }
       );
     }

     // Check if this professional is allowed to accept
     // (either proposed to them, or in general list)
     const isProposed = appointment.proposedTo?.some(
       (pId: { toString: () => string }) => pId.toString() === session.user.id
     );
     const isGeneral = appointment.routingStatus === "general" || appointment.routingStatus === "refused";

     if (!isProposed && !isGeneral) {
       return NextResponse.json(
         { error: "You are not authorized to accept this appointment" },
         { status: 403 }
       );
     }

     // If appointment has a specific date and time, check for conflicts
     if (appointment.date && appointment.time) {
       const appointmentDate = new Date(appointment.date);
       const [hours, minutes] = appointment.time.split(":").map(Number);
       appointmentDate.setHours(hours, minutes, 0, 0);
       const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000);

       // Find conflicting appointments for this professional
       const conflictingAppointments = await Appointment.find({
         professionalId: session.user.id,
         _id: { $ne: id }, // exclude current appointment
         date: { $lt: appointmentEnd, $gte: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) },
         status: { $in: ["scheduled", "ongoing"] },
       });

if (conflictingAppointments.length > 0) {
          // Check exact overlap
          for (const apt of conflictingAppointments) {
            if (!apt.date || !apt.time) continue;
            const aptStart = new Date(apt.date);
           const aptHours = apt.time.split(":")[0];
           const aptMinutes = apt.time.split(":")[1];
           aptStart.setHours(parseInt(aptHours), parseInt(aptMinutes), 0, 0);
           const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);

           if (
             (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
             (aptStart >= appointmentDate && aptStart < appointmentEnd)
           ) {
             return NextResponse.json(
               {
                 error: "This time slot conflicts with an existing appointment",
                 details: `You already have an appointment at ${apt.time} on ${apt.date.toLocaleDateString()}`,
               },
               { status: 409 }
             );
           }
         }
       }
     }

     // Accept the appointment
     const updatedAppointment = await Appointment.findByIdAndUpdate(
       id,
       {
         professionalId: session.user.id,
         routingStatus: "accepted",
       },
       { new: true }
     )
       .populate("clientId", "firstName lastName email phone location")
       .populate("professionalId", "firstName lastName email phone");

     // TODO: Send notification to client about acceptance
     // TODO: Send notification to other proposed professionals that appointment is taken

     return NextResponse.json({
       message: "Appointment accepted successfully",
       appointment: updatedAppointment,
     });
   } catch (error) {
     console.error("Accept appointment error:", error);
     return NextResponse.json(
       { error: "Failed to accept appointment" },
       { status: 500 }
     );
   }
 }
