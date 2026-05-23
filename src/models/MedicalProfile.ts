import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicalProfile extends Document {
  userId: mongoose.Types.ObjectId;

  // Personal Information
  concernedPerson?: string;

  // Health Background
  medicalConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  substanceUse?: string;

  // Mental Health History
  previousTherapy?: boolean;
  previousTherapyDetails?: string;
  psychiatricHospitalization?: boolean;
  currentTreatment?: string;
  diagnosedConditions?: string[];

  // Current Concerns
  primaryIssue?: string;
  secondaryIssues?: string[];
  issueDescription?: string;
  severity?: "mild" | "moderate" | "severe";
  duration?: "lessThanMonth" | "oneToThree" | "threeToSix" | "moreThanSix";
  triggeringSituation?: string;

  // Symptoms & Impact
  symptoms?: string[];
  dailyLifeImpact?: string;
  sleepQuality?: "normal" | "poor" | "insomnia" | "excessive";
  appetiteChanges?: string;

  // Goals & Treatment Preferences
  treatmentGoals?: string[];
  therapyApproach?: string[];
  concernsAboutTherapy?: string;

  // Appointment Preferences
  availability?: string[];
  modality?: "online" | "inPerson" | "both";
  location?: string;
  sessionFrequency?: "weekly" | "biweekly" | "monthly";
  notes?: string;

  // Emergency Information
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  crisisPlan?: string;
  suicidalThoughts?: boolean;

  // Professional Matching Preferences
  preferredGender?: "noPreference" | "male" | "female";
  preferredAge?: "any" | "younger" | "middle" | "older";
  languagePreference?: string;
  culturalConsiderations?: string;

  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalProfileSchema = new Schema<IMedicalProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    concernedPerson: String,

    // Health Background
    medicalConditions: [String],
    currentMedications: [String],
    allergies: [String],
    substanceUse: String,

    // Mental Health History
    previousTherapy: Boolean,
    previousTherapyDetails: String,
    psychiatricHospitalization: Boolean,
    currentTreatment: String,
    diagnosedConditions: [String],

    // Current Concerns
    primaryIssue: String,
    secondaryIssues: [String],
    issueDescription: String,
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
    },
    duration: {
      type: String,
      enum: ["lessThanMonth", "oneToThree", "threeToSix", "moreThanSix"],
    },
    triggeringSituation: String,

    // Symptoms & Impact
    symptoms: [String],
    dailyLifeImpact: String,
    sleepQuality: {
      type: String,
      enum: ["normal", "poor", "insomnia", "excessive"],
    },
    appetiteChanges: String,

    // Goals & Treatment Preferences
    treatmentGoals: [String],
    therapyApproach: [String],
    concernsAboutTherapy: String,

    // Appointment Preferences
    availability: [String],
    modality: {
      type: String,
      enum: ["online", "inPerson", "both"],
    },
    location: String,
    sessionFrequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
    },
    notes: String,

    // Emergency Information
    emergencyContactName: String,
    emergencyContactPhone: String,
    emergencyContactRelation: String,
    crisisPlan: String,
    suicidalThoughts: Boolean,

    // Professional Matching Preferences
    preferredGender: {
      type: String,
      enum: ["noPreference", "male", "female"],
    },
    preferredAge: {
      type: String,
      enum: ["any", "younger", "middle", "older"],
    },
    languagePreference: String,
    culturalConsiderations: String,

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
MedicalProfileSchema.index({ userId: 1 });
MedicalProfileSchema.index({ profileCompleted: 1 });

const MedicalProfile: Model<IMedicalProfile> =
  mongoose.models.MedicalProfile ||
  mongoose.model<IMedicalProfile>("MedicalProfile", MedicalProfileSchema);

export default MedicalProfile;
