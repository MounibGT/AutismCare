"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api-client";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Heart,
  Brain,
  Activity,
  Target,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AuthContainer,
  AuthHeader,
  AuthCard,
  AuthFooter,
} from "@/components/auth";

interface FormData {
  // User fields
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  language: string;
  location: string;

  // Medical Profile - Personal Information
  concernedPerson: string;

  // Health Background
  medicalConditions: string[];
  currentMedications: string[];
  allergies: string[];
  substanceUse: string;

  // Mental Health History
  previousTherapy: string;
  previousTherapyDetails: string;
  psychiatricHospitalization: string;
  currentTreatment: string;
  diagnosedConditions: string[];

  // Current Concerns
  primaryIssue: string;
  secondaryIssues: string[];
  issueDescription: string;
  severity: string;
  duration: string;
  triggeringSituation: string;

  // Symptoms & Impact
  symptoms: string[];
  dailyLifeImpact: string;
  sleepQuality: string;
  appetiteChanges: string;

  // Goals & Treatment Preferences
  treatmentGoals: string[];
  therapyApproach: string[];
  concernsAboutTherapy: string;

  // Appointment Preferences
  availability: string[];
  modality: string;
  sessionFrequency: string;
  notes: string;

  // Emergency Information
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  crisisPlan: string;
  suicidalThoughts: string;

  // Professional Matching Preferences
  preferredGender: string;
  preferredAge: string;
  languagePreference: string;
  culturalConsiderations: string;

  agreeToTerms: boolean;
}

export default function MemberSignupPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    language: "",
    location: "",
    concernedPerson: "",
    medicalConditions: [],
    currentMedications: [],
    allergies: [],
    substanceUse: "",
    previousTherapy: "",
    previousTherapyDetails: "",
    psychiatricHospitalization: "",
    currentTreatment: "",
    diagnosedConditions: [],
    primaryIssue: "",
    secondaryIssues: [],
    issueDescription: "",
    severity: "",
    duration: "",
    triggeringSituation: "",
    symptoms: [],
    dailyLifeImpact: "",
    sleepQuality: "",
    appetiteChanges: "",
    treatmentGoals: [],
    therapyApproach: [],
    concernsAboutTherapy: "",
    availability: [],
    modality: "",
    sessionFrequency: "",
    notes: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    crisisPlan: "",
    suicidalThoughts: "",
    preferredGender: "",
    preferredAge: "",
    languagePreference: "",
    culturalConsiderations: "",
    agreeToTerms: false,
  });

  const sections = [
    { title: "Basic Information", icon: UserCircle, required: true },
    { title: "Health Background", icon: Heart, required: false },
    { title: "Mental Health History", icon: Brain, required: false },
    { title: "Current Concerns", icon: Activity, required: false },
    { title: "Symptoms & Impact", icon: Activity, required: false },
    { title: "Treatment Goals", icon: Target, required: false },
    { title: "Appointment Preferences", icon: Clock, required: false },
    { title: "Emergency Contact", icon: AlertTriangle, required: false },
    { title: "Professional Preferences", icon: Users, required: false },
    { title: "Review & Confirm", icon: CheckCircle2, required: true },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[name] as string[];

      // Special handling for "None" option
      if (value === "None") {
        // If "None" is clicked, clear all other selections
        if (currentArray.includes("None")) {
          return { ...prev, [name]: [] };
        } else {
          return { ...prev, [name]: ["None"] };
        }
      } else {
        // If any other option is clicked, remove "None" if it exists
        const withoutNone = currentArray.filter((item) => item !== "None");
        const newArray = withoutNone.includes(value)
          ? withoutNone.filter((item) => item !== value)
          : [...withoutNone, value];
        return { ...prev, [name]: newArray };
      }
    });
  };

  const validateSection = (section: number): boolean => {
    switch (section) {
      case 0: // Basic Information
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("First name and last name are required");
          return false;
        }
        if (
          !formData.email.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          setError("Valid email is required");
          return false;
        }
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;

      case 9: // Review & Confirm
        if (!formData.agreeToTerms) {
          setError("You must agree to the terms and conditions");
          return false;
        }
        return true;

      default:
        return true; // Optional sections
    }
  };

  const handleNext = () => {
    setError("");
    if (validateSection(currentSection)) {
      setDirection(1);
      setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
    }
  };

  const handleBack = () => {
    setError("");
    setDirection(-1);
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateSection(currentSection)) return;

    setIsLoading(true);

    try {
      const response = await authAPI.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "client",
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        language: formData.language || undefined,
        location: formData.location || undefined,
        concernedPerson: formData.concernedPerson || undefined,
        medicalConditions:
          formData.medicalConditions.length > 0
            ? formData.medicalConditions
            : undefined,
        currentMedications:
          formData.currentMedications.length > 0
            ? formData.currentMedications
            : undefined,
        allergies:
          formData.allergies.length > 0 ? formData.allergies : undefined,
        substanceUse: formData.substanceUse || undefined,
        previousTherapy: formData.previousTherapy
          ? formData.previousTherapy === "yes"
          : undefined,
        previousTherapyDetails: formData.previousTherapyDetails || undefined,
        psychiatricHospitalization: formData.psychiatricHospitalization
          ? formData.psychiatricHospitalization === "yes"
          : undefined,
        currentTreatment: formData.currentTreatment || undefined,
        diagnosedConditions:
          formData.diagnosedConditions.length > 0
            ? formData.diagnosedConditions
            : undefined,
        primaryIssue: formData.primaryIssue || undefined,
        secondaryIssues:
          formData.secondaryIssues.length > 0
            ? formData.secondaryIssues
            : undefined,
        issueDescription: formData.issueDescription || undefined,
        severity: formData.severity || undefined,
        duration: formData.duration || undefined,
        triggeringSituation: formData.triggeringSituation || undefined,
        symptoms: formData.symptoms.length > 0 ? formData.symptoms : undefined,
        dailyLifeImpact: formData.dailyLifeImpact || undefined,
        sleepQuality: formData.sleepQuality || undefined,
        appetiteChanges: formData.appetiteChanges || undefined,
        treatmentGoals:
          formData.treatmentGoals.length > 0
            ? formData.treatmentGoals
            : undefined,
        therapyApproach:
          formData.therapyApproach.length > 0
            ? formData.therapyApproach
            : undefined,
        concernsAboutTherapy: formData.concernsAboutTherapy || undefined,
        availability:
          formData.availability.length > 0 ? formData.availability : undefined,
        modality: formData.modality || undefined,
        sessionFrequency: formData.sessionFrequency || undefined,
        notes: formData.notes || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelation:
          formData.emergencyContactRelation || undefined,
        crisisPlan: formData.crisisPlan || undefined,
        suicidalThoughts: formData.suicidalThoughts
          ? formData.suicidalThoughts === "yes"
          : undefined,
        preferredGender: formData.preferredGender || undefined,
        preferredAge: formData.preferredAge || undefined,
        languagePreference: formData.languagePreference || undefined,
        culturalConsiderations: formData.culturalConsiderations || undefined,
      });

      // Email verification is disabled - redirect to home or dashboard
      router.push(`/`);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.";

      // Handle duplicate email error - redirect to login instead of showing error
      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("User already exists")
      ) {
        // Redirect to login page with a hint that the email exists
        router.push(`/login?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => handleSelectChange("gender", val)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="preferNotToSay">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Preferred Language
                </Label>
                <Select
                  value={formData.language}
                  onValueChange={(val) => handleSelectChange("language", val)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location / Postal Code
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Province or A1A 1A1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        );

      case 1: // Health Background
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="concernedPerson">Who is this profile for?</Label>
              <Select
                value={formData.concernedPerson}
                onValueChange={(val) =>
                  handleSelectChange("concernedPerson", val)
                }
              >
                <SelectTrigger id="concernedPerson">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="myself">Myself</SelectItem>
                  <SelectItem value="child">My child</SelectItem>
                  <SelectItem value="partner">My partner</SelectItem>
                  <SelectItem value="parent">My parent</SelectItem>
                  <SelectItem value="other">Other family member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Medical Conditions (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Diabetes",
                  "Hypertension",
                  "Heart Disease",
                  "Asthma",
                  "Thyroid Disorder",
                  "Chronic Pain",
                  "None",
                ].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${condition}`}
                      checked={formData.medicalConditions.includes(condition)}
                      onCheckedChange={() =>
                        handleArrayChange("medicalConditions", condition)
                      }
                    />
                    <label
                      htmlFor={`condition-${condition}`}
                      className="text-sm cursor-pointer"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Medications (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Antidepressants",
                  "Anti-anxiety",
                  "Mood stabilizers",
                  "Antipsychotics",
                  "Sleep aids",
                  "Pain medication",
                  "None",
                ].map((med) => (
                  <div key={med} className="flex items-center space-x-2">
                    <Checkbox
                      id={`med-${med}`}
                      checked={formData.currentMedications.includes(med)}
                      onCheckedChange={() =>
                        handleArrayChange("currentMedications", med)
                      }
                    />
                    <label
                      htmlFor={`med-${med}`}
                      className="text-sm cursor-pointer"
                    >
                      {med}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allergies (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Penicillin",
                  "Sulfa drugs",
                  "Aspirin",
                  "Latex",
                  "Food allergies",
                  "None",
                ].map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergy-${allergy}`}
                      checked={formData.allergies.includes(allergy)}
                      onCheckedChange={() =>
                        handleArrayChange("allergies", allergy)
                      }
                    />
                    <label
                      htmlFor={`allergy-${allergy}`}
                      className="text-sm cursor-pointer"
                    >
                      {allergy}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="substanceUse">Substance Use</Label>
              <Textarea
                id="substanceUse"
                name="substanceUse"
                value={formData.substanceUse}
                onChange={handleChange}
                placeholder="Please describe any alcohol, tobacco, or drug use..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      case 2: // Mental Health History
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="previousTherapy">
                Have you had therapy before?
              </Label>
              <Select
                value={formData.previousTherapy}
                onValueChange={(val) =>
                  handleSelectChange("previousTherapy", val)
                }
              >
                <SelectTrigger id="previousTherapy">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.previousTherapy === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="previousTherapyDetails">
                  Previous Therapy Details
                </Label>
                <Textarea
                  id="previousTherapyDetails"
                  name="previousTherapyDetails"
                  value={formData.previousTherapyDetails}
                  onChange={handleChange}
                  placeholder="Please describe your previous therapy experience..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="psychiatricHospitalization">
                Have you ever been hospitalized for psychiatric reasons?
              </Label>
              <Select
                value={formData.psychiatricHospitalization}
                onValueChange={(val) =>
                  handleSelectChange("psychiatricHospitalization", val)
                }
              >
                <SelectTrigger id="psychiatricHospitalization">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentTreatment">Current Treatment</Label>
              <Textarea
                id="currentTreatment"
                name="currentTreatment"
                value={formData.currentTreatment}
                onChange={handleChange}
                placeholder="Describe any current mental health treatment..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Diagnosed Conditions (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Depression",
                  "Anxiety",
                  "PTSD",
                  "Bipolar Disorder",
                  "OCD",
                  "ADHD",
                  "Eating Disorder",
                  "Personality Disorder",
                  "None",
                ].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diagnosed-${condition}`}
                      checked={formData.diagnosedConditions.includes(condition)}
                      onCheckedChange={() =>
                        handleArrayChange("diagnosedConditions", condition)
                      }
                    />
                    <label
                      htmlFor={`diagnosed-${condition}`}
                      className="text-sm cursor-pointer"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Current Concerns
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryIssue">
                What brings you to therapy today?
              </Label>
              <Textarea
                id="primaryIssue"
                name="primaryIssue"
                value={formData.primaryIssue}
                onChange={handleChange}
                placeholder="Describe your main concern or reason for seeking help..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Secondary Issues (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Stress",
                  "Relationships",
                  "Work/School",
                  "Family",
                  "Grief",
                  "Trauma",
                  "Self-esteem",
                  "Life transitions",
                ].map((issue) => (
                  <div key={issue} className="flex items-center space-x-2">
                    <Checkbox
                      id={`issue-${issue}`}
                      checked={formData.secondaryIssues.includes(issue)}
                      onCheckedChange={() =>
                        handleArrayChange("secondaryIssues", issue)
                      }
                    />
                    <label
                      htmlFor={`issue-${issue}`}
                      className="text-sm cursor-pointer"
                    >
                      {issue}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDescription">Detailed Description</Label>
              <Textarea
                id="issueDescription"
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                placeholder="Please provide more details about your concerns..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="severity">How severe are your symptoms?</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(val) => handleSelectChange("severity", val)}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  How long have you experienced this?
                </Label>
                <Select
                  value={formData.duration}
                  onValueChange={(val) => handleSelectChange("duration", val)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lessThanMonth">
                      Less than a month
                    </SelectItem>
                    <SelectItem value="oneToThree">1-3 months</SelectItem>
                    <SelectItem value="threeToSix">3-6 months</SelectItem>
                    <SelectItem value="moreThanSix">
                      More than 6 months
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggeringSituation">Triggering Situation</Label>
              <Textarea
                id="triggeringSituation"
                name="triggeringSituation"
                value={formData.triggeringSituation}
                onChange={handleChange}
                placeholder="What triggered or worsened your current situation?"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      case 4: // Symptoms & Impact
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Symptoms (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Sadness",
                  "Worry",
                  "Panic attacks",
                  "Mood swings",
                  "Irritability",
                  "Fatigue",
                  "Concentration issues",
                  "Memory problems",
                  "Nightmares",
                  "Flashbacks",
                ].map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={`symptom-${symptom}`}
                      checked={formData.symptoms.includes(symptom)}
                      onCheckedChange={() =>
                        handleArrayChange("symptoms", symptom)
                      }
                    />
                    <label
                      htmlFor={`symptom-${symptom}`}
                      className="text-sm cursor-pointer"
                    >
                      {symptom}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyLifeImpact">Impact on Daily Life</Label>
              <Textarea
                id="dailyLifeImpact"
                name="dailyLifeImpact"
                value={formData.dailyLifeImpact}
                onChange={handleChange}
                placeholder="How do these issues affect your daily activities, work, relationships, etc.?"
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sleepQuality">Sleep Quality</Label>
                <Select
                  value={formData.sleepQuality}
                  onValueChange={(val) =>
                    handleSelectChange("sleepQuality", val)
                  }
                >
                  <SelectTrigger id="sleepQuality">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="poor">Poor quality</SelectItem>
                    <SelectItem value="insomnia">Insomnia</SelectItem>
                    <SelectItem value="excessive">
                      Excessive sleeping
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appetiteChanges">Appetite Changes</Label>
                <Input
                  id="appetiteChanges"
                  name="appetiteChanges"
                  value={formData.appetiteChanges}
                  onChange={handleChange}
                  placeholder="e.g., Loss of appetite, overeating..."
                />
              </div>
            </div>
          </div>
        );

      case 5: // Treatment Goals
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>
                What are your goals for therapy? (select all that apply)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Reduce symptoms",
                  "Improve relationships",
                  "Better coping skills",
                  "Self-understanding",
                  "Life changes",
                  "Personal growth",
                  "Stress management",
                  "Grief processing",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${goal}`}
                      checked={formData.treatmentGoals.includes(goal)}
                      onCheckedChange={() =>
                        handleArrayChange("treatmentGoals", goal)
                      }
                    />
                    <label
                      htmlFor={`goal-${goal}`}
                      className="text-sm cursor-pointer"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Therapy Approach (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "CBT",
                  "Psychodynamic",
                  "Mindfulness",
                  "Solution-focused",
                  "Family therapy",
                  "Group therapy",
                  "Art therapy",
                  "No preference",
                ].map((approach) => (
                  <div key={approach} className="flex items-center space-x-2">
                    <Checkbox
                      id={`approach-${approach}`}
                      checked={formData.therapyApproach.includes(approach)}
                      onCheckedChange={() =>
                        handleArrayChange("therapyApproach", approach)
                      }
                    />
                    <label
                      htmlFor={`approach-${approach}`}
                      className="text-sm cursor-pointer"
                    >
                      {approach}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concernsAboutTherapy">
                Any concerns or questions about therapy?
              </Label>
              <Textarea
                id="concernsAboutTherapy"
                name="concernsAboutTherapy"
                value={formData.concernsAboutTherapy}
                onChange={handleChange}
                placeholder="Share any concerns, questions, or specific needs..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        );

      case 6: // Appointment Preferences
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>
                When are you typically available? (select all that apply)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Weekday mornings",
                  "Weekday afternoons",
                  "Weekday evenings",
                  "Weekend mornings",
                  "Weekend afternoons",
                  "Weekend evenings",
                  "Flexible",
                ].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={`availability-${time}`}
                      checked={formData.availability.includes(time)}
                      onCheckedChange={() =>
                        handleArrayChange("availability", time)
                      }
                    />
                    <label
                      htmlFor={`availability-${time}`}
                      className="text-sm cursor-pointer"
                    >
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="modality">Preferred Modality</Label>
                <Select
                  value={formData.modality}
                  onValueChange={(val) => handleSelectChange("modality", val)}
                >
                  <SelectTrigger id="modality">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online only</SelectItem>
                    <SelectItem value="inPerson">In-person only</SelectItem>
                    <SelectItem value="both">
                      Both online & in-person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionFrequency">
                  Preferred Session Frequency
                </Label>
                <Select
                  value={formData.sessionFrequency}
                  onValueChange={(val) =>
                    handleSelectChange("sessionFrequency", val)
                  }
                >
                  <SelectTrigger id="sessionFrequency">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any other preferences or information we should know..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      case 7: // Emergency Contact
        return (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Emergency contact information helps us provide better care and
                reach out if needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">
                  Emergency Contact Name
                </Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">
                Relationship to Contact
              </Label>
              <Input
                id="emergencyContactRelation"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                placeholder="e.g., Spouse, Parent, Sibling, Friend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crisisPlan">Crisis Plan</Label>
              <Textarea
                id="crisisPlan"
                name="crisisPlan"
                value={formData.crisisPlan}
                onChange={handleChange}
                placeholder="What should we do in case of a mental health crisis? Who should we contact?"
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suicidalThoughts">
                Are you currently experiencing suicidal thoughts?
              </Label>
              <Select
                value={formData.suicidalThoughts}
                onValueChange={(val) =>
                  handleSelectChange("suicidalThoughts", val)
                }
              >
                <SelectTrigger id="suicidalThoughts">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
              {formData.suicidalThoughts === "yes" && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 mt-4">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    If you&apos;re in crisis, please call one of these hotlines
                    immediately:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• Canada Suicide Prevention: 1-833-456-4566</li>
                    <li>• Quebec Suicide Prevention: 1-866-277-3553</li>
                    <li>• Crisis Text Line: Text &quot;HOME&quot; to 686868</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 8: // Professional Preferences
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferredGender">
                  Preferred Professional Gender
                </Label>
                <Select
                  value={formData.preferredGender}
                  onValueChange={(val) =>
                    handleSelectChange("preferredGender", val)
                  }
                >
                  <SelectTrigger id="preferredGender">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noPreference">No preference</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredAge">
                  Preferred Professional Age Range
                </Label>
                <Select
                  value={formData.preferredAge}
                  onValueChange={(val) =>
                    handleSelectChange("preferredAge", val)
                  }
                >
                  <SelectTrigger id="preferredAge">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any age</SelectItem>
                    <SelectItem value="younger">Younger (20s-30s)</SelectItem>
                    <SelectItem value="middle">
                      Middle-aged (40s-50s)
                    </SelectItem>
                    <SelectItem value="older">Older (60+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languagePreference">Language Preference</Label>
              <Select
                value={formData.languagePreference}
                onValueChange={(val) =>
                  handleSelectChange("languagePreference", val)
                }
              >
                <SelectTrigger id="languagePreference">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="bilingual">
                    Bilingual (English & French)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="culturalConsiderations">
                Cultural Considerations
              </Label>
              <Textarea
                id="culturalConsiderations"
                name="culturalConsiderations"
                value={formData.culturalConsiderations}
                onChange={handleChange}
                placeholder="Any cultural, religious, or other considerations we should know when matching you with a professional..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        );

      case 9: // Review & Confirm
        return (
          <div className="space-y-6">
            <div className="rounded-xl bg-muted/30 p-6">
              <h3 className="font-serif text-lg mb-4">
                Review Your Information
              </h3>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                )}
                {formData.primaryIssue && (
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                    <span className="text-muted-foreground">
                      Primary Concern:
                    </span>
                    <span className="font-medium">
                      {formData.primaryIssue.substring(0, 100)}
                      {formData.primaryIssue.length > 100 ? "..." : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    agreeToTerms: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . I understand that the information provided will be used to
                match me with appropriate mental health professionals.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const CurrentIcon = sections[currentSection].icon;

  return (
    <AuthContainer maxWidth="2xl">
      <AuthHeader
        icon={<UserCircle className="w-8 h-8 text-primary" />}
        title="Join as a Member"
        description="Start your journey to better mental health"
      />

      <AuthCard>
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CurrentIcon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-serif text-lg">
                  {sections[currentSection].title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Step {currentSection + 1} of {sections.length}
                </p>
              </div>
            </div>
            {sections[currentSection].required && (
              <span className="text-xs text-red-500">* Required</span>
            )}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Animated form sections */}
        <div className="relative overflow-hidden min-h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSection}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-6 py-3 text-foreground font-light transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-light hover:scale-105 transition-transform"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.agreeToTerms}
              className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-light hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </AuthCard>

      <AuthFooter>
        <p className="text-sm text-muted-foreground font-light">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </AuthFooter>

      <AuthFooter>
        <Link
          href="/"
          className="text-sm text-muted-foreground font-light hover:text-foreground transition-colors"
        >
          ← Back to Home
        </Link>
      </AuthFooter>
    </AuthContainer>
  );
}
