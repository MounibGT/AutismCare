import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import MedicalProfile from "@/models/MedicalProfile";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/notifications";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  language?: string;
  location?: string;
  concernedPerson?: string;
  medicalConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  substanceUse?: string;
  previousTherapy?: string;
  previousTherapyDetails?: string;
  psychiatricHospitalization?: string;
  currentTreatment?: string;
  diagnosedConditions?: string[];
  primaryIssue?: string;
  secondaryIssues?: string[];
  issueDescription?: string;
  severity?: string;
  duration?: string;
  triggeringSituation?: string;
  symptoms?: string[];
  dailyLifeImpact?: string;
  sleepQuality?: string;
  appetiteChanges?: string;
  treatmentGoals?: string[];
  therapyApproach?: string;
  concernsAboutTherapy?: string;
  availability?: string;
  modality?: string;
  sessionFrequency?: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  crisisPlan?: string;
  suicidalThoughts?: string;
  preferredGender?: string;
  preferredAge?: string;
  languagePreference?: string;
  culturalConsiderations?: string;
  professionalProfile?: {
    problematics?: string[];
    approaches?: string[];
    ageCategories?: string[];
    skills?: string[];
    bio?: string;
    yearsOfExperience?: number;
    specialty?: string;
    license?: string;
    certifications?: string[];
    availability?: object;
    languages?: string[];
    sessionTypes?: string[];
    modalities?: string[];
    pricing?: object;
    paymentAgreement?: string;
    education?: object[];
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Check content type to handle both JSON and FormData
    const contentType = req.headers.get("content-type") || "";
    let data: SignupData;
    let nationalIdFile: File | null = null;
    let diplomaFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with file uploads
      const formData = await req.formData();
      const dataStr = formData.get("data") as string;
      data = JSON.parse(dataStr);
      nationalIdFile = formData.get("nationalId") as File | null;
      diplomaFile = formData.get("diploma") as File | null;
    } else {
      // Handle regular JSON
      data = await req.json();
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      dateOfBirth,
      gender,
      language,
      location,
      concernedPerson,
      medicalConditions,
      currentMedications,
      allergies,
      substanceUse,
      previousTherapy,
      previousTherapyDetails,
      psychiatricHospitalization,
      currentTreatment,
      diagnosedConditions,
      primaryIssue,
      secondaryIssues,
      issueDescription,
      severity,
      duration,
      triggeringSituation,
      symptoms,
      dailyLifeImpact,
      sleepQuality,
      appetiteChanges,
      treatmentGoals,
      therapyApproach,
      concernsAboutTherapy,
      availability,
      modality,
      sessionFrequency,
      notes,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      crisisPlan,
      suicidalThoughts,
      preferredGender,
      preferredAge,
      languagePreference,
      culturalConsiderations,
      professionalProfile,
    } = data;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please use a different email or try logging in.",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status: "active", // User is active immediately since email verification is disabled
      phone,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      language:
        language === "english"
          ? "en"
          : language === "french"
            ? "fr"
            : undefined,
      location: location,
    });

    await user.save();

    if (user.role === "professional") {
      // Handle file uploads for professionals
      let nationalIdPath: string | undefined;
      let diplomaPath: string | undefined;

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "professionals",
        user._id.toString(),
      );
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Save national ID file
      if (nationalIdFile) {
        const nationalIdBuffer = Buffer.from(
          await nationalIdFile.arrayBuffer(),
        );
        const nationalIdExt = nationalIdFile.name.split(".").pop();
        const nationalIdFileName = `nationalId.${nationalIdExt}`;
        await writeFile(join(uploadsDir, nationalIdFileName), nationalIdBuffer);
        nationalIdPath = `/uploads/professionals/${user._id.toString()}/${nationalIdFileName}`;
      }

      // Save diploma file
      if (diplomaFile) {
        const diplomaBuffer = Buffer.from(await diplomaFile.arrayBuffer());
        const diplomaExt = diplomaFile.name.split(".").pop();
        const diplomaFileName = `diploma.${diplomaExt}`;
        await writeFile(join(uploadsDir, diplomaFileName), diplomaBuffer);
        diplomaPath = `/uploads/professionals/${user._id.toString()}/${diplomaFileName}`;
      }

      // Create profile for the user with provided professional data
      const profile = new Profile({
        userId: user._id,
        // Professional Information
        problematics: professionalProfile?.problematics,
        approaches: professionalProfile?.approaches,
        ageCategories: professionalProfile?.ageCategories,
        skills: professionalProfile?.skills,
        bio: professionalProfile?.bio,
        yearsOfExperience: professionalProfile?.yearsOfExperience,
        specialty: professionalProfile?.specialty,
        license: professionalProfile?.license,
        certifications: professionalProfile?.certifications,
        // Document paths
        nationalIdPath: nationalIdPath,
        diplomaPath: diplomaPath,
        // Availability & Scheduling
        availability: professionalProfile?.availability,
        // Languages & Session Types
        languages: professionalProfile?.languages,
        sessionTypes: professionalProfile?.sessionTypes,
        modalities: professionalProfile?.modalities,
        // Pricing & Payment
        pricing: professionalProfile?.pricing,
        paymentAgreement: professionalProfile?.paymentAgreement,
        // Education
        education: professionalProfile?.education,
        profileCompleted: false,
      });

      await profile.save();

      // Link the profile to the user
      user.profile = profile.id;
      await user.save();
    } else if (user.role === "client") {
      // Create medical profile for the client with signup data
      // Convert string booleans from frontend to actual booleans
      const parseBoolean = (val: string | undefined): boolean | undefined => {
        if (val === undefined) return undefined;
        return val === "yes" || val === "true";
      };

      const medicalProfile = new MedicalProfile({
        userId: user._id,
        // Personal Information
        concernedPerson: concernedPerson || undefined,
        // Health Background
        medicalConditions: medicalConditions || [],
        currentMedications: currentMedications || [],
        allergies: allergies || [],
        substanceUse: substanceUse || undefined,
        // Mental Health History
        previousTherapy: parseBoolean(previousTherapy as string | undefined),
        previousTherapyDetails: previousTherapyDetails || undefined,
        psychiatricHospitalization: parseBoolean(
          psychiatricHospitalization as string | undefined,
        ),
        currentTreatment: currentTreatment || undefined,
        diagnosedConditions: diagnosedConditions || [],
        // Current Concerns
        primaryIssue: primaryIssue || undefined,
        secondaryIssues: secondaryIssues || [],
        issueDescription: issueDescription || undefined,
        severity: severity || undefined,
        duration: duration || undefined,
        triggeringSituation: triggeringSituation || undefined,
        // Symptoms & Impact
        symptoms: symptoms || [],
        dailyLifeImpact: dailyLifeImpact || undefined,
        sleepQuality: sleepQuality || undefined,
        appetiteChanges: appetiteChanges || undefined,
        // Goals & Treatment Preferences
        treatmentGoals: treatmentGoals || [],
        therapyApproach: therapyApproach || [],
        concernsAboutTherapy: concernsAboutTherapy || undefined,
        // Appointment Preferences
        availability: availability || [],
        modality: modality || undefined,
        sessionFrequency: sessionFrequency || undefined,
        notes: notes || undefined,
        // Emergency Information
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        emergencyContactRelation: emergencyContactRelation || undefined,
        crisisPlan: crisisPlan || undefined,
        suicidalThoughts: parseBoolean(suicidalThoughts as string | undefined),
        // Professional Matching Preferences
        preferredGender: preferredGender || undefined,
        preferredAge: preferredAge || undefined,
        languagePreference: languagePreference || undefined,
        culturalConsiderations: culturalConsiderations || undefined,
        profileCompleted: false,
      });

      await medicalProfile.save();
    }

    // Send verification email (non-blocking) - DISABLED FOR NOW
    // const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    // const verificationUrl = `${baseUrl}/verify-email?code=${verificationCode}`;
    //
    // sendVerificationEmail({
    //   name: `${user.firstName} ${user.lastName}`,
    //   email: user.email,
    //   verificationCode,
    //   verificationUrl,
    // }).catch((err) => console.error("Error sending verification email:", err));

    return NextResponse.json(
      {
        message: "User created successfully.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "no stack",
    );
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        details: error instanceof Error ? error.message : "unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
