import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const availability = searchParams.get("availability") || "all"; // all, available, busy
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query for active professionals
    const query: any = { 
      role: "professional",
      status: "active" // Only show active professionals
    };

    // Filter by availability if specified
    if (availability === "available") {
      query.callStatus = "available";
      query.isOnline = true;
    } else if (availability === "busy") {
      query.callStatus = "busy";
    }

    // Add search functionality
    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      
      // Also search in specialty if profile exists
      const matchingProfiles = await Profile.find({
        $or: [
          { specialty: { $regex: search, $options: "i" } },
          { bio: { $regex: search, $options: "i" } },
        ]
      }).select("_id");
      
      if (matchingProfiles.length > 0) {
        query.$or.push({ profile: { $in: matchingProfiles.map(p => p._id) } });
      }
    }

    // Get professionals with pagination
    const skip = (page - 1) * limit;
    const professionals = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get profile data for each professional
    const professionalsWithProfiles = await Promise.all(
      professionals.map(async (professional) => {
        const prof = professional as any;
        let profileData = null;
        
        if (prof.profile) {
          profileData = await Profile.findById(prof.profile).lean();
        }

        return {
          id: professional._id.toString(),
          name: `${professional.firstName} ${professional.lastName}`,
          firstName: professional.firstName,
          lastName: professional.lastName,
          email: professional.email,
          image: professional.image,
          phone: professional.phone,
          language: professional.language,
          location: professional.location,
          // Profile data
          specialty: profileData?.specialty || "General Practice",
          bio: profileData?.bio || "",
          yearsOfExperience: profileData?.yearsOfExperience || 0,
          // Real-time availability
          isOnline: prof.isOnline || false,
          callStatus: prof.callStatus || "offline",
          lastSeen: prof.lastSeen || null,
        };
      }),
    );

    return NextResponse.json({
      professionals: professionalsWithProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Professionals API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch professionals",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
