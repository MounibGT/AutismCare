import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authOptions } from "@/lib/auth";

interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const appointments = await Appointment.find({
      professionalId: session.user.id,
      status: { $in: ["scheduled", "completed"] },
    })
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId", "firstName lastName email phone")
      .sort({ date: -1 });

    // Process appointments to get unique clients
    const clientMap = new Map();

    for (const appointment of appointments) {
      const client = appointment.clientId as unknown as PopulatedUser;
      const clientId = client._id.toString();
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          status: "active", // Default, can be updated based on logic
          lastSession: appointment.date
            ? appointment.date.toISOString().split("T")[0]
            : "N/A",
          totalSessions: 1,
          issueType: "Not specified", // Placeholder
          joinedDate: appointment.date
            ? appointment.date.toISOString().split("T")[0]
            : "N/A",
        });
      } else {
        const existingClient = clientMap.get(clientId);
        existingClient.totalSessions += 1;
        if (
          appointment.date &&
          new Date(appointment.date) > new Date(existingClient.lastSession)
        ) {
          existingClient.lastSession = appointment.date
            .toISOString()
            .split("T")[0];
        }
        if (
          appointment.date &&
          new Date(appointment.date) < new Date(existingClient.joinedDate)
        ) {
          existingClient.joinedDate = appointment.date
            .toISOString()
            .split("T")[0];
        }
      }
    }

    const clients = Array.from(clientMap.values());

    // Update status based on last session
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    clients.forEach((client) => {
      client.status =
        new Date(client.lastSession) >= thirtyDaysAgo ? "active" : "inactive";
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch clients",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
