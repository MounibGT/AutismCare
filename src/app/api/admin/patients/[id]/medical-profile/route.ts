import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import MedicalProfile from "@/models/MedicalProfile";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const medicalProfile = await MedicalProfile.findOne({ userId: id });

    if (!medicalProfile) {
      return NextResponse.json(
        { error: "Medical profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(medicalProfile);
  } catch (error: unknown) {
    console.error("Get patient medical profile error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch medical profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
