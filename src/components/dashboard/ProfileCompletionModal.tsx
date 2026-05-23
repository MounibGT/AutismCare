"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { useTranslations } from "next-intl";
import { IProfile } from "@/models/Profile";
import { profileAPI } from "@/lib/api-client";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  setProfessionalProfile: (data: IProfile) => void;
  profile?: IProfile;
}

export interface ProfileData {
  problematics: string[];
  approaches: string[];
  ageCategories: string[];
  skills: string[];
  bio: string;
  yearsOfExperience: string;
  modalities: string[];
  sessionTypes: string[];
  languages: string[];
  certifications: string[];
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  setProfessionalProfile,
  profile,
}: ProfileCompletionModalProps) {
  const t = useTranslations("Dashboard.profileModal");
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    { title: t("steps.issueTypes"), description: t("steps.issueTypesDesc") },
    { title: t("steps.approaches"), description: t("steps.approachesDesc") },
    { title: t("steps.ageGroups"), description: t("steps.ageGroupsDesc") },
    {
      title: t("steps.additionalInfo"),
      description: t("steps.additionalInfoDesc"),
    },
  ];

   const [formData, setFormData] = useState<ProfileData>({
     problematics: profile?.problematics || [],
     approaches: profile?.approaches || [],
     ageCategories: profile?.ageCategories || [],
     skills: profile?.skills || [],
     bio: profile?.bio || "",
     yearsOfExperience: profile?.yearsOfExperience?.toString() || "",
     modalities: profile?.modalities || [],
     sessionTypes: profile?.sessionTypes || [],
     languages: profile?.languages || ["English"], // default English
     certifications: profile?.certifications || [],
   });

  const problematics = [
    "Anxiety Disorders",
    "Depression",
    "Trauma & PTSD",
    "Relationship Issues",
    "Stress Management",
    "Grief & Loss",
    "Self-Esteem",
    "Addiction",
    "Eating Disorders",
    "Sleep Disorders",
    "Bipolar Disorder",
    "OCD",
  ];

  const therapeuticApproaches = [
    "Cognitive Behavioral Therapy (CBT)",
    "Psychodynamic Therapy",
    "Humanistic Therapy",
    "Dialectical Behavior Therapy (DBT)",
    "EMDR",
    "Solution-Focused Therapy",
    "Mindfulness-Based Therapy",
    "Family Systems Therapy",
    "Acceptance and Commitment Therapy (ACT)",
  ];

  const ageCategories = [
    "Children (0-12)",
    "Adolescents (13-17)",
    "Young Adults (18-25)",
    "Adults (26-64)",
    "Seniors (65+)",
  ];

   const skills = [
     "Crisis Intervention",
     "Group Therapy",
     "Couples Counseling",
     "Family Therapy",
     "Neuropsychological Assessment",
     "Psychometric Testing",
     "Bilingual Services (French/English)",
     "Cultural Competency",
     "LGBTQ+ Affirmative Therapy",
   ];

   const sessionModalities = [
     { value: "online", label: "Video Call" },
     { value: "inPerson", label: "In-Person" },
     { value: "phone", label: "Phone Call" },
     { value: "both", label: "Both Online & In-Person" },
   ];

   const sessionTypeOptions = [
     { value: "individual", label: "Individual (Solo)" },
     { value: "couple", label: "Couple" },
     { value: "group", label: "Group" },
   ];

   const commonLanguages = [
     "English",
     "French",
     "Arabic",
     "Spanish",
     "German",
     "Italian",
     "Portuguese",
     "Russian",
     "Chinese",
     "Japanese",
     "Korean",
     "Hindi",
     "Urdu",
     "Berber",
     "Other",
   ];

   const commonCertifications = [
     "Licensed Psychologist",
     "Licensed Counselor",
     "Licensed Clinical Social Worker (LCSW)",
     "Licensed Marriage and Family Therapist (LMFT)",
     "Licensed Professional Counselor (LPC)",
     "Certified Addiction Counselor",
     "Board Certified Psychiatrist",
     "EMDR Certified",
     "Trauma-Focused CBT Certified",
     "Dialectical Behavior Therapy (DBT) Certified",
     "Certified Play Therapist",
     "Neuropsychology Certified",
   ];

  const handleMultiSelect = (field: keyof ProfileData, value: string) => {
    const currentValues = formData[field] as string[];
    if (currentValues.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: currentValues.filter((v) => v !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentValues, value],
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: ProfileData) => {
    try {
      const newProfile = (await profileAPI.update(data)) as IProfile;
      setProfessionalProfile(newProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    onClose();
  };

   const canProceed = () => {
     switch (currentStep) {
       case 0:
         return formData.problematics.length > 0;
       case 1:
         return formData.approaches.length > 0;
       case 2:
         return formData.ageCategories.length > 0;
       case 3:
         return (
           formData.bio.trim() !== "" &&
           formData.yearsOfExperience !== "" &&
           formData.modalities.length > 0 &&
           formData.sessionTypes.length > 0 &&
           formData.languages.length > 0
         );
       default:
         return false;
     }
   };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-foreground">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground font-light mt-1">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-6 border-b border-border/40">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Step 1: Issue Types */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-light text-foreground mb-2">
                  {t("step1.title")}
                  <span className="text-primary ml-1">
                    {t("step1.required")}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {t("step1.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {problematics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleMultiSelect("problematics", item)}
                    className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                      formData.problematics.includes(item)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Therapeutic Approaches */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-light text-foreground mb-2">
                  {t("step2.title")}
                  <span className="text-primary ml-1">
                    {t("step1.required")}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {t("step2.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {therapeuticApproaches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleMultiSelect("approaches", item)}
                    className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                      formData.approaches.includes(item)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age Categories */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-light text-foreground mb-2">
                  {t("step3.title")}
                  <span className="text-primary ml-1">
                    {t("step1.required")}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {t("step3.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ageCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleMultiSelect("ageCategories", item)}
                    className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                      formData.ageCategories.includes(item)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-light text-foreground mb-2">
                  {t("step4.title")}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {t("step4.subtitle")}
                </p>
              </div>

              {/* Years of Experience */}
              <div>
                <Label
                  htmlFor="yearsOfExperience"
                  className="font-light mb-3 text-base"
                >
                  {t("step4.yearsExp")}
                  <span className="text-primary ml-1">
                    {t("step4.yearsExpRequired")}
                  </span>
                </Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="max-w-xs"
                  placeholder={t("step4.yearsPlaceholder")}
                />
              </div>

               {/* Skills */}
               <div>
                 <Label className="font-light mb-3 text-base">
                   {t("step4.additionalSkills")}
                 </Label>
                 <p className="text-sm text-muted-foreground font-light mb-4">
                   {t("step4.additionalSkillsDesc")}
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {skills.map((item) => (
                     <button
                       key={item}
                       type="button"
                       onClick={() => handleMultiSelect("skills", item)}
                       className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                         formData.skills.includes(item)
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted/50 text-foreground hover:bg-muted"
                       }`}
                     >
                       {item}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Session Modalities (In-Person, Phone, Video) */}
               <div>
                 <Label className="font-light mb-3 text-base">
                   {t("step4.servicesOffered")}
                 </Label>
                 <p className="text-sm text-muted-foreground font-light mb-4">
                   {t("step4.servicesOfferedDesc")}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {sessionModalities.map((mod) => (
                     <button
                       key={mod.value}
                       type="button"
                       onClick={() => handleMultiSelect("modalities", mod.value)}
                       className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                         formData.modalities.includes(mod.value)
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted/50 text-foreground hover:bg-muted"
                       }`}
                     >
                       {mod.label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Session Types */}
               <div>
                 <Label className="font-light mb-3 text-base">
                   {t("step4.sessionFormats")}
                 </Label>
                 <p className="text-sm text-muted-foreground font-light mb-4">
                   {t("step4.sessionFormatsDesc")}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {sessionTypeOptions.map((opt) => (
                     <button
                       key={opt.value}
                       type="button"
                       onClick={() => handleMultiSelect("sessionTypes", opt.value)}
                       className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                         formData.sessionTypes.includes(opt.value)
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted/50 text-foreground hover:bg-muted"
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Languages Spoken */}
               <div>
                 <Label className="font-light mb-3 text-base">
                   {t("step4.languagesSpoken")}
                 </Label>
                 <p className="text-sm text-muted-foreground font-light mb-4">
                   {t("step4.languagesDesc")}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {commonLanguages.map((lang) => (
                     <button
                       key={lang}
                       type="button"
                       onClick={() => handleMultiSelect("languages", lang)}
                       className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                         formData.languages.includes(lang)
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted/50 text-foreground hover:bg-muted"
                       }`}
                     >
                       {lang}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Certifications & Credentials */}
               <div>
                 <Label className="font-light mb-3 text-base">
                   {t("step4.certifications")}
                 </Label>
                 <p className="text-sm text-muted-foreground font-light mb-4">
                   {t("step4.certificationsDesc")}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {commonCertifications.map((cert) => (
                     <button
                       key={cert}
                       type="button"
                       onClick={() => handleMultiSelect("certifications", cert)}
                       className={`rounded-lg px-4 py-3 text-sm font-light text-left transition-all ${
                         formData.certifications.includes(cert)
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted/50 text-foreground hover:bg-muted"
                       }`}
                     >
                       {cert}
                     </button>
                   ))}
                 </div>
               </div>

              {/* Professional Bio */}
              <div>
                <Label htmlFor="bio" className="font-light mb-3 text-base">
                  {t("step4.bio")}
                  <span className="text-primary ml-1">
                    {t("step4.bioRequired")}
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground font-light mb-4">
                  {t("step4.subtitle")}
                </p>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                  placeholder={t("step4.bioPlaceholder")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/40 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 text-foreground font-light transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:text-muted-foreground"
          >
            {t("buttons.back")}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-foreground font-light transition-colors hover:text-muted-foreground"
            >
              Save for Later
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-light tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t("buttons.next")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(formData)}
                disabled={!canProceed()}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-light tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t("buttons.complete")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
