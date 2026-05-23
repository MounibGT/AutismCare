import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Admin, {
  ADMIN_ROLE_PERMISSIONS,
  type AdminRole,
  type IAdminPermissions,
} from "@/models/Admin";
import { authOptions } from "@/lib/auth";

interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  customPermissions?: Partial<IAdminPermissions>;
}

// GET - List all admins
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await Admin.findOne({
      userId: session.user.id,
      isActive: true,
    });

    if (!admin?.permissions.manageAdmins) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Get admins with user details
    const admins = await Admin.find({ isActive: true })
      .populate("userId", "firstName lastName email createdAt")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out admins with null userId to prevent errors
    const validAdmins = admins.filter((admin) => admin.userId);

    // Log warning if there are invalid admin records
    if (validAdmins.length !== admins.length) {
      console.warn(
        `Found ${admins.length - validAdmins.length} admin records with null userId references`,
      );
    }

    const adminData = validAdmins.map((admin) => ({
      id: admin._id.toString(),
      userId: admin.userId._id.toString(),
      role: admin.role,
      permissions: admin.permissions,
      user: {
        firstName: (admin.userId as any).firstName,
        lastName: (admin.userId as any).lastName,
        email: (admin.userId as any).email,
        createdAt: (admin.userId as any).createdAt,
      },
      createdBy: admin.createdBy
        ? {
            firstName: (admin.createdBy as any).firstName,
            lastName: (admin.createdBy as any).lastName,
          }
        : null,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    }));

    return NextResponse.json({
      admins: adminData,
      pagination: {
        page,
        limit,
        total: validAdmins.length, // Use actual valid count for pagination
        pages: Math.ceil(validAdmins.length / limit),
      },
    });
  } catch (error: any) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch admins",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

// POST - Create new admin
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await Admin.findOne({
      userId: session.user.id,
      isActive: true,
    });

    if (!admin?.permissions.createAdmins) {
      return NextResponse.json(
        { error: "Insufficient permissions to create admins" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body: CreateAdminRequest = await req.json();
    const { email, password, firstName, lastName, role, customPermissions } =
      body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Check if user is already an admin
    const existingAdminUser = await User.findOne({
      email: email.toLowerCase(),
      isAdmin: true,
    });
    if (existingAdminUser) {
      return NextResponse.json(
        { error: "User is already an admin" },
        { status: 400 },
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: "admin",
      isAdmin: true,
      status: "active",
      language: "en",
    });

    const savedUser = await newUser.save();

    // Create admin record with appropriate permissions
    const basePermissions = ADMIN_ROLE_PERMISSIONS[role];
    const permissions = customPermissions
      ? { ...basePermissions, ...customPermissions }
      : basePermissions;

    const newAdmin = new Admin({
      userId: savedUser._id,
      role,
      permissions,
      createdBy: session.user.id,
      isActive: true,
    });

    const savedAdmin = await newAdmin.save();

    // Update user with admin reference
    await User.findByIdAndUpdate(savedUser._id, {
      adminId: (savedAdmin as any)._id,
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: (savedAdmin as any)._id.toString(),
          userId: (savedUser as any)._id.toString(),
          role: savedAdmin.role,
          permissions: savedAdmin.permissions,
          user: {
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
          },
          createdAt: savedAdmin.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        error: "Failed to create admin",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
