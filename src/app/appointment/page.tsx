"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Home,
  UserPlus,
  Calendar,
  Upload,
  FileText,
  X,
  Heart,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, medicalProfileAPI } from "@/lib/api-client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
}

interface LovedOneInfo {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  notes: string;
}

interface ReferralInfo {
  referrerType: "doctor" | "specialist" | "other_professional";
  referrerName: string;
  referrerLicense: string;
  referrerPhone: string;
  referrerEmail: string;
  referralReason: string;
  documentUrl: string;
  documentName: string;
}

interface MedicalProfileData {
  primaryIssue?: string;
  availability?: string[];
  modality?: "online" | "inPerson" | "both";
  sessionFrequency?: string;
  location?: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { status } = useSession();

  // Auth state
  const [isGuest, setIsGuest] = useState(false);
  const [authCheckDone, setAuthCheckDone] = useState(false);

  // Guest info
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  });

  // Medical profile data for defaults
  const [medicalProfile, setMedicalProfile] =
    useState<MedicalProfileData | null>(null);

  // Step management - starts at -1 for auth check
  // Steps: 0 = Auth Choice, 1 = Who is this for, 2 = Guest Info, 3 = Appointment Details, 4 = Confirmation, 5 = Success
  const [currentStep, setCurrentStep] = useState(-1);

   // Form data
   const [selectedType, setSelectedType] = useState<
     "video" | "in-person" | "phone"
   >("video");
   const [therapyType, setTherapyType] = useState<"solo" | "couple" | "group">(
     "solo",
   );
   const [issueType, setIssueType] = useState<string>("");
   const [notes, setNotes] = useState<string>("");
   const [preferredAvailability, setPreferredAvailability] = useState<string[]>(
     [],
   );

   // New: Date and Time selection for booking
   const [selectedDate, setSelectedDate] = useState<string>("");
   const [selectedTime, setSelectedTime] = useState<string>("");
   const [sessionDuration, setSessionDuration] = useState<number>(60);

   // UI state
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string>("");

   // New: Professional availability search state
   const [availableProfessionals, setAvailableProfessionals] = useState<any[]>([]);
   const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
   const [loadingAvailability, setLoadingAvailability] = useState(false);
   const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Booking context
  const [bookingFor, setBookingFor] = useState<
    "self" | "patient" | "loved-one" | null
  >(null);

  // Loved one info (for booking for a loved one)
  const [lovedOneInfo, setLovedOneInfo] = useState<LovedOneInfo>({
    firstName: "",
    lastName: "",
    relationship: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Referral info (for booking for a patient - medical professional referral)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo>({
    referrerType: "doctor",
    referrerName: "",
    referrerLicense: "",
    referrerPhone: "",
    referrerEmail: "",
    referralReason: "",
    documentUrl: "",
    documentName: "",
  });

   // File upload state
   const [uploading, setUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // New: Function to check professional availability
const checkAvailability = async () => {
      if (!selectedDate || !selectedTime) {
        setError("Please select both date and time");
        return;
      }

      setLoadingAvailability(true);
      setError("");

      try {
        const params = new URLSearchParams({
          date: selectedDate,
          time: selectedTime,
          duration: sessionDuration.toString(),
          type: selectedType,
          therapyType,
          theme: issueType,
        });

        const response = await fetch(`/api/professionals/available?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch available professionals");
        }

        setAvailableProfessionals(data.professionals || []);
        setAvailabilityChecked(true);
        setSelectedProfessionalId(null); // reset selection
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to check availability");
        setAvailableProfessionals([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

  // Check for 'for' query param
  const searchParams = useSearchParams();
  useEffect(() => {
    const forParam = searchParams.get("for");
    if (forParam && ["self", "patient", "loved-one"].includes(forParam)) {
      setBookingFor(forParam as "self" | "patient" | "loved-one");
    }
  }, [searchParams]);

  // Fetch medical profile for defaults (authenticated users only)
  useEffect(() => {
    const fetchMedicalProfile = async () => {
      if (status === "authenticated") {
        try {
          const profile = await medicalProfileAPI.get();
          if (profile) {
            setMedicalProfile(profile as MedicalProfileData);
            // Set defaults from medical profile
            if ((profile as MedicalProfileData).primaryIssue) {
              setIssueType((profile as MedicalProfileData).primaryIssue || "");
            }
            if ((profile as MedicalProfileData).availability) {
              setPreferredAvailability(
                (profile as MedicalProfileData).availability || [],
              );
            }
            if ((profile as MedicalProfileData).modality) {
              const modality = (profile as MedicalProfileData).modality;
              if (modality === "online") {
                setSelectedType("video");
              } else if (modality === "inPerson") {
                setSelectedType("in-person");
              }
              // "both" keeps default
            }
          }
        } catch {
          // Medical profile might not exist, that's okay
        }
      }
    };
    fetchMedicalProfile();
  }, [status]);

  // Check authentication status on mount
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      // User is logged in
      setIsGuest(false);
      setAuthCheckDone(true);
      // Skip Auth Choice (0)
      if (bookingFor) {
        // If booking for patient or loved-one, go to specific info step (2.5)
        // Otherwise skip directly to appointment details (3)
        if (bookingFor === "patient" || bookingFor === "loved-one") {
          setCurrentStep(2.5);
        } else {
          setCurrentStep(3);
        }
      } else {
        setCurrentStep(1); // Start at Who is this for
      }
    } else {
      // User is not logged in
      setAuthCheckDone(true);
      setCurrentStep(0); // Start at Auth Choice
    }
  }, [status, bookingFor]);

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    if (bookingFor) {
      setCurrentStep(2); // Go to Guest Info
    } else {
      setCurrentStep(1); // Go to Who is this for
    }
  };

  const handleSignIn = () => {
    router.push("/login?returnUrl=/appointment");
  };

  const handleWhoChoice = (who: "self" | "patient" | "loved-one") => {
    setBookingFor(who);
    // For patient or loved-one, we need an extra step for their specific info
    // Steps: 0 = Auth Choice, 1 = Who is this for, 2 = Guest Info (if guest), 
    //        2.5 = Loved One/Patient Info (new), 3 = Appointment Details, 4 = Confirmation, 5 = Success
    if (who === "self") {
      // For self: if guest -> Guest Info, else -> Appointment Details
      setCurrentStep(isGuest ? 2 : 3);
    } else {
      // For patient or loved-one: if guest -> Guest Info first, else -> specific info form (2.5)
      // We'll use step 2 for guest info and add a check in step 3 for loved-one/patient info
      if (isGuest) {
        setCurrentStep(2); // Guest info first, then specific info
      } else {
        setCurrentStep(2.5); // Go directly to specific info form
      }
    }
  };

  // File upload handler for referral documents
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, JPEG, or PNG file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/referral", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setReferralInfo({
        ...referralInfo,
        documentUrl: data.url,
        documentName: data.fileName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = () => {
    setReferralInfo({
      ...referralInfo,
      documentUrl: "",
      documentName: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate loved one info
  const validateLovedOneInfo = (): boolean => {
    if (!lovedOneInfo.firstName.trim() || !lovedOneInfo.lastName.trim()) {
      setError("Please provide the first and last name of your loved one");
      return false;
    }
    if (!lovedOneInfo.relationship) {
      setError("Please select the relationship");
      return false;
    }
    setError("");
    return true;
  };

  // Validate referral info
  const validateReferralInfo = (): boolean => {
    if (!referralInfo.referrerName.trim()) {
      setError("Please provide the referring professional's name");
      return false;
    }
    setError("");
    return true;
  };

  const handleSpecificInfoSubmit = () => {
    if (bookingFor === "loved-one" && !validateLovedOneInfo()) return;
    if (bookingFor === "patient" && !validateReferralInfo()) return;
    setCurrentStep(3); // Move to appointment details
  };

  const handleGuestInfoSubmit = () => {
    // Validate guest info
    if (
      !guestInfo.firstName.trim() ||
      !guestInfo.lastName.trim() ||
      !guestInfo.email.trim() ||
      !guestInfo.phone.trim() ||
      !guestInfo.location.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInfo.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(guestInfo.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    // If booking for patient or loved-one, go to specific info form (2.5)
    // Otherwise go directly to appointment details (3)
    console.log("handleGuestInfoSubmit - bookingFor:", bookingFor);
    if (bookingFor === "patient" || bookingFor === "loved-one") {
      console.log("Going to step 2.5");
      setCurrentStep(2.5);
    } else {
      console.log("Going to step 3");
      setCurrentStep(3);
    }
  };

   // Submit guest appointment without payment
   const handleGuestSubmit = async () => {
     try {
       setLoading(true);
       setError("");

       const appointmentData: Record<string, unknown> = {
         type: selectedType,
         therapyType,
         issueType,
         notes,
         bookingFor,
         preferredAvailability,
       };

       // Include date/time if selected
       if (selectedDate) {
         appointmentData.date = new Date(selectedDate);
       }
       if (selectedTime) {
         appointmentData.time = selectedTime;
       }
       appointmentData.duration = sessionDuration;

       // Include professional if explicitly selected via availability search
       if (selectedProfessionalId) {
         appointmentData.professionalId = selectedProfessionalId;
         appointmentData.status = "scheduled";
       }

       // Include loved one info if booking for a loved one
       if (bookingFor === "loved-one" && lovedOneInfo.firstName) {
         appointmentData.lovedOneInfo = lovedOneInfo;
       }

       // Include referral info if booking for a patient
       if (bookingFor === "patient" && referralInfo.referrerName) {
         appointmentData.referralInfo = referralInfo;
       }

       await apiClient.post<{ appointmentId: string }>("/appointments/guest", {
         ...appointmentData,
         guestInfo,
       });

       setCurrentStep(5); // Success step
     } catch (err: unknown) {
       console.error("Error booking appointment:", err);
       setError(err instanceof Error ? err.message : "Failed to submit request");
     } finally {
       setLoading(false);
     }
   };

   const handleSubmit = async () => {
     if (!selectedType || !issueType) {
       setError("Please fill in all required fields");
       return;
     }

     // For guests, submit without payment
     if (isGuest) {
       handleGuestSubmit();
       return;
     }

     try {
       setLoading(true);
       setError("");

       const appointmentData: Record<string, unknown> = {
         type: selectedType,
         therapyType,
         issueType,
         notes,
         bookingFor,
         preferredAvailability,
       };

       // Include date/time if selected
       if (selectedDate) {
         appointmentData.date = new Date(selectedDate);
       }
       if (selectedTime) {
         appointmentData.time = selectedTime;
       }
       appointmentData.duration = sessionDuration;

       // Include professional if explicitly selected via availability search
       if (selectedProfessionalId) {
         appointmentData.professionalId = selectedProfessionalId;
         // If professional selected, set status to scheduled directly
         appointmentData.status = "scheduled";
       }

       // Include loved one info if booking for a loved one
       if (bookingFor === "loved-one" && lovedOneInfo.firstName) {
         appointmentData.lovedOneInfo = lovedOneInfo;
       }

       // Include referral info if booking for a patient
       if (bookingFor === "patient" && referralInfo.referrerName) {
         appointmentData.referralInfo = referralInfo;
       }

       // Use regular endpoint for authenticated users
       await apiClient.post<{ appointmentId: string }>(
         "/appointments",
         appointmentData,
       );

       setCurrentStep(5); // Success step
     } catch (err: unknown) {
       console.error("Error submitting request:", err);
       setError(err instanceof Error ? err.message : "Failed to submit request");
     } finally {
       setLoading(false);
     }
   };

  const renderSummary = () => {
    return (
      <div className="bg-card rounded-xl border border-border/40 p-6 space-y-6 sticky top-8">
        <h3 className="font-serif text-lg font-medium border-b border-border/40 pb-4 mb-4">
          Request Summary
        </h3>

        {/* Who is this for */}
        <div className={`space-y-1 ${currentStep <= 1 ? "opacity-50" : ""}`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            For
          </p>
          <div className="flex items-center gap-2 text-sm">
            {bookingFor && currentStep > 1 ? (
              <>
                {bookingFor === "self" && <User className="h-4 w-4" />}
                {bookingFor === "patient" && <User className="h-4 w-4" />}
                {bookingFor === "loved-one" && <Users className="h-4 w-4" />}
                <span className="capitalize">
                  {bookingFor === "loved-one" ? "Loved One" : bookingFor}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground italic">Pending...</span>
            )}
          </div>
        </div>

        {/* Guest Info */}
        {isGuest && (
          <div className={`space-y-1 ${currentStep <= 2 ? "opacity-50" : ""}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Info
            </p>
            <div className="text-sm">
              {guestInfo.firstName && currentStep > 2 ? (
                <>
                  <p className="font-medium">
                    {guestInfo.firstName} {guestInfo.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {guestInfo.email}
                  </p>
                </>
              ) : (
                <span className="text-muted-foreground italic">Pending...</span>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div className={`space-y-1 ${currentStep < 3 ? "opacity-50" : ""}`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Details
          </p>
          <div className="text-sm space-y-1">
            {currentStep >= 3 ? (
              <>
                {therapyType && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span className="capitalize">{therapyType} Session</span>
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center gap-2">
                    {selectedType === "video" && <Video className="h-3 w-3" />}
                    {selectedType === "in-person" && (
                      <MapPin className="h-3 w-3" />
                    )}
                    {selectedType === "phone" && <Phone className="h-3 w-3" />}
                    <span className="capitalize">{selectedType}</span>
                  </div>
                )}
                {issueType && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>{issueType}</span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-muted-foreground italic">Pending...</span>
            )}
          </div>
        </div>

        {/* Info box about the new flow */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>How it works:</strong>
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            After you submit your request, a qualified professional will review
            and contact you to schedule your appointment.
          </p>
        </div>
      </div>
    );
  };

  // Don't render until auth check is complete
  if (!authCheckDone) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-serif font-light text-foreground mb-2">
            Request an Appointment
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit a request to be matched with a qualified mental health
            professional
            {isGuest && (
              <span className="block text-sm mt-1 text-muted-foreground">
                Booking as guest
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Summary */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            {renderSummary()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Error Display */}
            {error && currentStep < 4 && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Step 0: Account or Guest */}
            {currentStep === 0 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                <div className="p-6 border-b border-border/40">
                  <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    How would you like to proceed?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose how you&apos;d like to submit your request
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sign In Option */}
                    <div
                      className="cursor-pointer rounded-xl border-2 border-border/40 p-6 transition-all hover:border-primary hover:bg-primary/5"
                      onClick={handleSignIn}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">Sign In</h3>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Manage all your appointments</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Access your appointment history</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Pre-filled from your profile</span>
                        </div>
                      </div>
                    </div>

                    {/* Guest Option */}
                    <div
                      className="cursor-pointer rounded-xl border-2 border-border/40 p-6 transition-all hover:border-primary hover:bg-primary/5"
                      onClick={handleContinueAsGuest}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <UserPlus className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          Continue as Guest
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Quick request process</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>No account needed</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Professional will contact you</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Who is this for? */}
            {currentStep === 1 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                <div className="p-6 border-b border-border/40">
                  <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Who is this appointment for?
                  </h2>
                </div>
                <div className="p-6">
                  <RadioGroup
                    value={bookingFor || ""}
                    onValueChange={(value) =>
                      handleWhoChoice(value as "self" | "patient" | "loved-one")
                    }
                    className="space-y-4"
                  >
                    <div
                      className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        bookingFor === "self"
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-border"
                      }`}
                      onClick={() => handleWhoChoice("self")}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="self" id="self" />
                        <div className="flex-1">
                          <Label
                            htmlFor="self"
                            className="cursor-pointer text-base font-medium text-foreground flex items-center gap-2"
                          >
                            <User className="h-5 w-5 text-primary" />
                            For Myself
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            I&apos;m requesting this appointment for myself and
                            will be the one attending the session.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        bookingFor === "patient"
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-border"
                      }`}
                      onClick={() => handleWhoChoice("patient")}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="patient" id="patient" />
                        <div className="flex-1">
                          <Label
                            htmlFor="patient"
                            className="cursor-pointer text-base font-medium text-foreground flex items-center gap-2"
                          >
                            <User className="h-5 w-5 text-primary" />
                            For a Patient
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            I&apos;m a healthcare professional requesting on
                            behalf of my patient.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        bookingFor === "loved-one"
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-border"
                      }`}
                      onClick={() => handleWhoChoice("loved-one")}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="loved-one" id="loved-one" />
                        <div className="flex-1">
                          <Label
                            htmlFor="loved-one"
                            className="cursor-pointer text-base font-medium text-foreground flex items-center gap-2"
                          >
                            <Users className="h-5 w-5 text-primary" />
                            For a Loved One
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            I&apos;m requesting this appointment for a family
                            member or loved one who will be attending the
                            session.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                      className={status === "authenticated" ? "hidden" : ""}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guest Info (only for guests) */}
            {isGuest && currentStep === 2 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                <div className="p-6 border-b border-border/40">
                  <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please provide your contact information so a professional
                    can reach out to you
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={guestInfo.firstName}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={guestInfo.lastName}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        placeholder="your.email@example.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A professional will contact you at this email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={guestInfo.location}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            location: e.target.value,
                          })
                        }
                        placeholder="City, Province"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleGuestInfoSubmit}
                      size="lg"
                      className="gap-2"
                    >
                      Continue
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2.5: Loved One / Patient Specific Info */}
            {currentStep === 2.5 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                {/* Loved One Form */}
                {bookingFor === "loved-one" && (
                  <>
                    <div className="p-6 border-b border-border/40">
                      <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-500" />
                        Loved One Information
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please provide information about the person who will be attending the session
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lovedOneFirstName">
                            First Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="lovedOneFirstName"
                            value={lovedOneInfo.firstName}
                            onChange={(e) =>
                              setLovedOneInfo({
                                ...lovedOneInfo,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="Enter their first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lovedOneLastName">
                            Last Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="lovedOneLastName"
                            value={lovedOneInfo.lastName}
                            onChange={(e) =>
                              setLovedOneInfo({
                                ...lovedOneInfo,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Enter their last name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="relationship">
                          Relationship <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={lovedOneInfo.relationship}
                          onValueChange={(value) =>
                            setLovedOneInfo({ ...lovedOneInfo, relationship: value })
                          }
                        >
                          <SelectTrigger id="relationship">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse / Partner</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lovedOneDob">Date of Birth</Label>
                          <Input
                            id="lovedOneDob"
                            type="date"
                            value={lovedOneInfo.dateOfBirth}
                            onChange={(e) =>
                              setLovedOneInfo({
                                ...lovedOneInfo,
                                dateOfBirth: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lovedOnePhone">Phone (Optional)</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lovedOnePhone"
                              type="tel"
                              value={lovedOneInfo.phone}
                              onChange={(e) =>
                                setLovedOneInfo({ ...lovedOneInfo, phone: e.target.value })
                              }
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lovedOneEmail">Email (Optional)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lovedOneEmail"
                            type="email"
                            value={lovedOneInfo.email}
                            onChange={(e) =>
                              setLovedOneInfo({ ...lovedOneInfo, email: e.target.value })
                            }
                            placeholder="their.email@example.com"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lovedOneNotes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="lovedOneNotes"
                          value={lovedOneInfo.notes}
                          onChange={(e) =>
                            setLovedOneInfo({ ...lovedOneInfo, notes: e.target.value })
                          }
                          placeholder="Any relevant information about your loved one that might help the professional..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(isGuest ? 2 : 1)}
                        >
                          Back
                        </Button>
                        <Button onClick={handleSpecificInfoSubmit} size="lg" className="gap-2">
                          Continue
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Patient Referral Form */}
                {bookingFor === "patient" && (
                  <>
                    <div className="p-6 border-b border-border/40">
                      <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-500" />
                        Patient Referral Information
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please provide your professional information and optionally upload a referral document
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Referrer Type */}
                      <div className="space-y-2">
                        <Label>Your Professional Role <span className="text-red-500">*</span></Label>
                        <Select
                          value={referralInfo.referrerType}
                          onValueChange={(value: "doctor" | "specialist" | "other_professional") =>
                            setReferralInfo({ ...referralInfo, referrerType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Doctor / Physician</SelectItem>
                            <SelectItem value="specialist">Specialist</SelectItem>
                            <SelectItem value="other_professional">Other Healthcare Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="referrerName">
                            Your Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="referrerName"
                            value={referralInfo.referrerName}
                            onChange={(e) =>
                              setReferralInfo({
                                ...referralInfo,
                                referrerName: e.target.value,
                              })
                            }
                            placeholder="Dr. John Smith"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referrerLicense">License Number (Optional)</Label>
                          <Input
                            id="referrerLicense"
                            value={referralInfo.referrerLicense}
                            onChange={(e) =>
                              setReferralInfo({
                                ...referralInfo,
                                referrerLicense: e.target.value,
                              })
                            }
                            placeholder="License #"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="referrerPhone">Contact Phone (Optional)</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="referrerPhone"
                              type="tel"
                              value={referralInfo.referrerPhone}
                              onChange={(e) =>
                                setReferralInfo({ ...referralInfo, referrerPhone: e.target.value })
                              }
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referrerEmail">Contact Email (Optional)</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="referrerEmail"
                              type="email"
                              value={referralInfo.referrerEmail}
                              onChange={(e) =>
                                setReferralInfo({ ...referralInfo, referrerEmail: e.target.value })
                              }
                              placeholder="doctor@clinic.com"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralReason">Reason for Referral (Optional)</Label>
                        <Textarea
                          id="referralReason"
                          value={referralInfo.referralReason}
                          onChange={(e) =>
                            setReferralInfo({ ...referralInfo, referralReason: e.target.value })
                          }
                          placeholder="Brief description of why you are referring this patient..."
                          rows={3}
                        />
                      </div>

                      {/* Document Upload Section */}
                      <div className="space-y-3">
                        <Label>Upload Referral/Prescription Document (Optional)</Label>
                        <div className="border-2 border-dashed border-border/60 rounded-xl p-6">
                          {referralInfo.documentUrl ? (
                            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                <div>
                                  <p className="font-medium text-sm">{referralInfo.documentName}</p>
                                  <p className="text-xs text-muted-foreground">Document uploaded successfully</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveDocument}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="referral-upload"
                              />
                              <label
                                htmlFor="referral-upload"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                {uploading ? (
                                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                ) : (
                                  <Upload className="h-10 w-10 text-muted-foreground" />
                                )}
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, JPG, PNG up to 10MB
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(isGuest ? 2 : 1)}
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={handleSpecificInfoSubmit} 
                          size="lg" 
                          className="gap-2"
                          disabled={uploading}
                        >
                          Continue
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Appointment Details */}
            {currentStep === 3 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                <div className="p-6 border-b border-border/40">
                  <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Appointment Details
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tell us about your needs so we can match you with the right
                    professional
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Session Type */}
                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select
                      value={therapyType}
                      onValueChange={(value: "solo" | "couple" | "group") =>
                        setTherapyType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Individual Session
                          </div>
                        </SelectItem>
                        <SelectItem value="couple">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Couple Session
                          </div>
                        </SelectItem>
                        <SelectItem value="group">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Group Session
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appointment Type */}
                  <div className="space-y-2">
                    <Label>Preferred Appointment Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value: "video" | "in-person" | "phone") =>
                        setSelectedType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="in-person">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            In-Person
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Call
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                   {/* Issue Type */}
                   <div className="space-y-2">
                     <Label htmlFor="issueType">
                       What brings you here? *
                       {medicalProfile?.primaryIssue && (
                         <span className="text-xs text-muted-foreground ml-2">
                           (Pre-filled from your profile)
                         </span>
                       )}
                     </Label>
                     <Select value={issueType} onValueChange={setIssueType}>
                       <SelectTrigger id="issueType">
                         <SelectValue placeholder="Select a topic" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Anxiety">Anxiety</SelectItem>
                         <SelectItem value="Depression">Depression</SelectItem>
                         <SelectItem value="Stress">
                           Stress Management
                         </SelectItem>
                         <SelectItem value="Relationships">
                           Relationship Issues
                         </SelectItem>
                         <SelectItem value="Trauma">Trauma</SelectItem>
                         <SelectItem value="Self-Esteem">Self-Esteem</SelectItem>
                         <SelectItem value="Career">
                           Career Counseling
                         </SelectItem>
                         <SelectItem value="Family">Family Issues</SelectItem>
                         <SelectItem value="Other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Date & Time Selection */}
                   <div className="space-y-4 rounded-lg border border-border/40 p-4 bg-muted/20">
                     <div className="flex items-center gap-2">
                       <Calendar className="h-5 w-5 text-primary" />
                       <Label className="text-base font-medium">Select Date & Time</Label>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       Choose a specific date and time to see which professionals are available
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="sessionDate">Date</Label>
                         <Input
                           id="sessionDate"
                           type="date"
                           value={selectedDate}
                           onChange={(e) => {
                             setSelectedDate(e.target.value);
                             setAvailabilityChecked(false);
                             setAvailableProfessionals([]);
                           }}
                           min={new Date().toISOString().split('T')[0]}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="sessionTime">Time</Label>
                         <Select
                           value={selectedTime}
                           onValueChange={(value) => {
                             setSelectedTime(value);
                             setAvailabilityChecked(false);
                             setAvailableProfessionals([]);
                           }}
                         >
                           <SelectTrigger id="sessionTime">
                             <SelectValue placeholder="Select time" />
                           </SelectTrigger>
                           <SelectContent>
                             {Array.from({ length: 20 }, (_, i) => {
                               const hour = 8 + Math.floor(i / 2);
                               const minute = (i % 2) * 30;
                               const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                               const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                               const ampm = hour >= 12 ? 'PM' : 'AM';
                               return (
                                 <SelectItem key={timeStr} value={timeStr}>
                                   {displayHour}:{minute.toString().padStart(2, '0')} {ampm}
                                 </SelectItem>
                               );
                             })}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <Label htmlFor="duration" className="text-sm">Duration (minutes):</Label>
                       <Select
                         value={sessionDuration.toString()}
                         onValueChange={(val) => setSessionDuration(parseInt(val))}
                       >
                         <SelectTrigger className="w-32">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="30">30 min</SelectItem>
                           <SelectItem value="45">45 min</SelectItem>
                           <SelectItem value="60">60 min</SelectItem>
                           <SelectItem value="90">90 min</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <Button
                       type="button"
                       variant="secondary"
                       onClick={checkAvailability}
                       disabled={!selectedDate || !selectedTime || loadingAvailability}
                       className="gap-2"
                     >
                       {loadingAvailability ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                       ) : (
                         <Calendar className="h-4 w-4" />
                       )}
                       Check Available Professionals
                     </Button>

                     {/* Available Professionals Results */}
                     {availabilityChecked && (
                       <div className="mt-6 space-y-4">
                         <h3 className="text-lg font-medium text-foreground">
                           Available Professionals ({availableProfessionals.length})
                         </h3>

                         {availableProfessionals.length === 0 ? (
                           <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4 border border-yellow-200 dark:border-yellow-800">
                             <p className="text-sm text-yellow-800 dark:text-yellow-200">
                               No professionals are available at this time. Please try a different date or time.
                             </p>
                           </div>
                         ) : (
                           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                             {availableProfessionals.map((prof) => (
                               <div
                                 key={prof.id}
                                 className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${
                                   selectedProfessionalId === prof.id
                                     ? "border-primary bg-primary/5"
                                     : "border-border hover:border-primary/50"
                                 }`}
                                 onClick={() => setSelectedProfessionalId(prof.id)}
                               >
                                 <div className="flex items-start gap-3">
                                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-lg">
                                     {prof.firstName.charAt(0)}{prof.lastName.charAt(0)}
                                   </div>
                                   <div className="flex-1">
                                     <p className="font-medium text-foreground">
                                       {prof.firstName} {prof.lastName}
                                     </p>
                                     <p className="text-sm text-muted-foreground">
                                       {prof.specialty}
                                     </p>
                                     {prof.yearsOfExperience > 0 && (
                                       <p className="text-xs text-muted-foreground">
                                         {prof.yearsOfExperience} years experience
                                       </p>
                                     )}
                                     {prof.isOnline && (
                                       <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600">
                                         <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                         Online now
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                 {prof.bio && (
                                   <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                     {prof.bio}
                                   </p>
                                 )}
                                 <Button
                                   variant={selectedProfessionalId === prof.id ? "default" : "outline"}
                                   size="sm"
                                   className="mt-3 w-full"
                                   onClick={() => setSelectedProfessionalId(prof.id)}
                                 >
                                   {selectedProfessionalId === prof.id ? "Selected" : "Select"}
                                 </Button>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     )}
                   </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us more about what you'd like to discuss, any preferences for your therapist, or anything else you think would be helpful..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Go back to specific info form if patient/loved-one, otherwise to guest info or step 1
                        if (bookingFor === "patient" || bookingFor === "loved-one") {
                          setCurrentStep(2.5);
                        } else if (isGuest) {
                          setCurrentStep(2);
                        } else {
                          setCurrentStep(1);
                        }
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!issueType}
                    >
                      Review Request
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="max-w-4xl mx-auto rounded-xl bg-card border border-border/40">
                <div className="p-6 border-b border-border/40">
                  <h2 className="text-xl font-serif font-light text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Review Your Request
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please review your information before submitting
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <div className="space-y-4 bg-muted/30 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Booking For
                        </p>
                        <p className="font-medium capitalize">
                          {bookingFor === "loved-one"
                            ? "Loved One"
                            : bookingFor}
                        </p>
                      </div>
                      {isGuest && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Contact
                          </p>
                          <p className="font-medium">
                            {guestInfo.firstName} {guestInfo.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {guestInfo.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {guestInfo.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Session Type
                        </p>
                        <p className="font-medium capitalize">
                          {therapyType} Session
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Appointment Type
                        </p>
                        <div className="flex items-center gap-2">
                          {selectedType === "video" && (
                            <Video className="h-4 w-4" />
                          )}
                          {selectedType === "in-person" && (
                            <MapPin className="h-4 w-4" />
                          )}
                          {selectedType === "phone" && (
                            <Phone className="h-4 w-4" />
                          )}
                          <span className="font-medium capitalize">
                            {selectedType}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Topic
                        </p>
                        <p className="font-medium">{issueType}</p>
                      </div>
                      {preferredAvailability.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Preferred Availability
                          </p>
                          <p className="font-medium">
                            {preferredAvailability.join(", ")}
                          </p>
                        </div>
                      )}
                       {notes && (
                         <div className="md:col-span-2">
                           <p className="text-xs text-muted-foreground mb-1">
                             Additional Notes
                           </p>
                           <p className="text-sm">{notes}</p>
                         </div>
                       )}
                       {selectedDate && (
                         <div>
                           <p className="text-xs text-muted-foreground mb-1">
                             Date
                           </p>
                           <p className="font-medium">
                             {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                               weekday: 'long',
                               month: 'long',
                               day: 'numeric',
                               year: 'numeric',
                             })}
                           </p>
                         </div>
                       )}
                       {selectedTime && (
                         <div>
                           <p className="text-xs text-muted-foreground mb-1">
                             Time
                           </p>
                           <p className="font-medium">{selectedTime}</p>
                         </div>
                       )}
                       <div>
                         <p className="text-xs text-muted-foreground mb-1">
                           Duration
                         </p>
                         <p className="font-medium">{sessionDuration} minutes</p>
                       </div>
                       {selectedProfessionalId && (() => {
                         const prof = availableProfessionals.find(p => p.id === selectedProfessionalId);
                         if (prof) {
                           return (
                             <div className="md:col-span-2">
                               <p className="text-xs text-muted-foreground mb-1">
                                 Selected Professional
                               </p>
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif">
                                   {prof.firstName.charAt(0)}{prof.lastName.charAt(0)}
                                 </div>
                                 <div>
                                   <p className="font-medium">{prof.name}</p>
                                   <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                                 </div>
                               </div>
                             </div>
                           );
                         }
                         return null;
                       })()}
                     </div>
                  </div>

                   {/* Info about what happens next */}
                   <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4">
                     <div className="flex items-start gap-3">
                       <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                       <div>
                         <p className="font-medium text-blue-800 dark:text-blue-200">
                           What happens next?
                         </p>
                         {selectedProfessionalId ? (
                           <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                             Your selected professional will receive your booking request.
                             You'll receive a confirmation once they accept. The session is scheduled at the date and time you selected.
                           </p>
                         ) : (
                           <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                             After you submit, a qualified professional will review
                             your request and contact you via{" "}
                             {isGuest ? "email or phone" : "your account"} to
                             schedule your appointment at a time that works for
                             both of you.
                           </p>
                         )}
                       </div>
                     </div>
                   </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {currentStep === 5 && (
              <div className="max-w-2xl mx-auto text-center">
                <div className="rounded-xl bg-card border border-border/40 p-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-serif font-light text-foreground mb-2">
                    Request Submitted!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your appointment request has been submitted successfully. A
                    qualified professional will review your request and contact
                    you soon to schedule your session.
                  </p>

                  <div className="space-y-4 text-left bg-muted/30 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Session Type
                        </p>
                        <p className="font-medium text-foreground capitalize">
                          {therapyType} {selectedType} Session
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-border/40 pt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Topic</p>
                          <p className="font-medium text-foreground">
                            {issueType}
                          </p>
                        </div>
                      </div>
                    </div>
                     {isGuest && (
                       <div className="border-t border-border/40 pt-4">
                         <div className="flex items-start gap-3">
                           <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                           <div>
                             <p className="text-sm text-muted-foreground">
                               We&apos;ll contact you at
                             </p>
                             <p className="font-medium text-foreground">
                               {guestInfo.email}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               {guestInfo.phone}
                             </p>
                           </div>
                         </div>
                       </div>
                     )}
                     {selectedProfessionalId && (() => {
                       const prof = availableProfessionals.find(p => p.id === selectedProfessionalId);
                       if (prof) {
                         return (
                           <div className="border-t border-border/40 pt-4">
                             <div className="flex items-start gap-3">
                               <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                               <div>
                                 <p className="text-sm text-muted-foreground">Your Professional</p>
                                 <p className="font-medium text-foreground">{prof.name}</p>
                                 <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                               </div>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()}
                     {selectedDate && (
                       <div className="border-t border-border/40 pt-4">
                         <div className="flex items-start gap-3">
                           <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                           <div>
                             <p className="text-sm text-muted-foreground">Scheduled Date</p>
                             <p className="font-medium text-foreground">
                               {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                 weekday: 'long',
                                 month: 'long',
                                 day: 'numeric',
                                 year: 'numeric',
                               })}
                             </p>
                           </div>
                         </div>
                       </div>
                     )}
                      {selectedTime && (
                        <div className="border-t border-border/40 pt-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Scheduled Time</p>
                              <p className="font-medium text-foreground">{selectedTime}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="border-t border-border/40 pt-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium text-foreground">{sessionDuration} minutes</p>
                          </div>
                        </div>
                      </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>What happens next?</strong>
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      A professional will review your request and reach out to
                      schedule your appointment. You&apos;ll receive a
                      confirmation once your session is booked.
                    </p>
                  </div>

                  {isGuest ? (
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Return to Home
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() =>
                          router.push("/client/dashboard/appointments")
                        }
                        className="gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        View My Requests
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/client/dashboard")}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
