"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IProfile } from "@/models/Profile";
import { profileAPI } from "@/lib/api-client";
import ProfileCompletionModal from "./ProfileCompletionModal";

interface ProfessionalProfileProps {
  profile?: IProfile;
  userId?: string;
  setProfile?: (profile: IProfile) => void;
  isEditable?: boolean;
}

const isProfileCompleted = (profile: IProfile | null): boolean => {
  if (!profile) return false;
  return !!(
    profile.problematics?.length &&
    profile.approaches?.length &&
    profile.ageCategories?.length &&
    profile.skills?.length &&
    profile.yearsOfExperience &&
    profile.bio
  );
};

export default function ProfessionalProfile({
  profile,
  userId,
  setProfile,
  isEditable = false,
}: ProfessionalProfileProps) {
  const t = useTranslations("Dashboard.profile");
  const [professionalProfile, setProfessionalProfile] =
    useState<IProfile | null>(profile || null);
  const [isLoading, setIsLoading] = useState(!profile);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateProfile = useCallback(
    (updatedProfile: IProfile) => {
      setProfessionalProfile(updatedProfile);
      if (setProfile) setProfile(updatedProfile);
    },
    [setProfile],
  );

  const fetchProfile = useCallback(async () => {
    if (profile) return;

    try {
      setIsLoading(true);
      const response = userId
        ? await profileAPI.getById(userId)
        : await profileAPI.get();
      if (response) {
        setProfessionalProfile(response as IProfile);
        if (setProfile) setProfile(response as IProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, profile, setProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!professionalProfile) {
    return (
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Profile Completion Banner */}
      {!isProfileCompleted(professionalProfile) && isEditable && (
        <div className="rounded-xl bg-primary/10 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-light text-foreground text-lg mb-2">
              {t("completeSetupTitle")}
            </h3>
            <p className="text-sm text-muted-foreground font-light mb-4">
              {t("completeSetupDesc")}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-light tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm"
            >
              {t("completeNow")}
            </button>
          </div>
        </div>
      )}
      {/* Professional Information */}
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-xl font-serif font-light text-foreground mb-6">
          {t("professionalInfo")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="font-light mb-2">{t("license")}</Label>
            <p className="text-foreground">
              {professionalProfile?.license || "N/A"}
            </p>
          </div>

          <div>
            <Label className="font-light mb-2">{t("specialty")}</Label>
            <p className="text-foreground capitalize">
              {professionalProfile?.specialty || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Specialization */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-light text-foreground">
            {t("professionalSpec")}
          </h2>
          {isEditable && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              {isProfileCompleted(professionalProfile)
                ? t("edit")
                : t("complete")}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Label className="font-light mb-3 text-base">
              {t("issueTypes")}
            </Label>
            {professionalProfile?.problematics &&
            professionalProfile.problematics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professionalProfile.problematics.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>

          <div>
            <Label className="font-light mb-3 text-base">
              {t("approaches")}
            </Label>
            {professionalProfile?.approaches &&
            professionalProfile.approaches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professionalProfile.approaches.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>

          <div>
            <Label className="font-light mb-3 text-base">
              {t("ageCategories")}
            </Label>
            {professionalProfile?.ageCategories &&
            professionalProfile.ageCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professionalProfile.ageCategories.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>

          <div>
            <Label className="font-light mb-3 text-base">
              {t("additionalSkills")}
            </Label>
            {professionalProfile?.skills &&
            professionalProfile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professionalProfile.skills.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-xl bg-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-light text-foreground">
            {t("about")}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="font-light mb-2 text-base">{t("yearsExp")}</Label>
            <p className="text-foreground">
              {professionalProfile.yearsOfExperience || "N/A"}{" "}
              {professionalProfile.yearsOfExperience ? t("years") : ""}
            </p>
          </div>

          <div>
            <Label className="font-light mb-2 text-base">{t("bio")}</Label>
            <p className="text-foreground leading-relaxed">
              {professionalProfile?.bio || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Education & Certifications */}
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-xl font-serif font-light text-foreground mb-6">
          Education & Credentials
        </h2>

        <div className="space-y-6">
          {professionalProfile?.education &&
          professionalProfile.education.length > 0 ? (
            <div>
              <Label className="font-light mb-3 text-base">Education</Label>
              <div className="space-y-3">
                {professionalProfile.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                    {edu.year && (
                      <p className="text-sm text-muted-foreground">
                        {edu.year}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="font-light mb-3 text-base">Education</Label>
              <p className="text-muted-foreground">N/A</p>
            </div>
          )}

          {professionalProfile?.certifications &&
          professionalProfile.certifications.length > 0 ? (
            <div>
              <Label className="font-light mb-3 text-base">
                Certifications
              </Label>
              <div className="flex flex-wrap gap-2">
                {professionalProfile.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-light"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="font-light mb-3 text-base">
                Certifications
              </Label>
              <p className="text-muted-foreground">N/A</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Types & Modalities */}
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-xl font-serif font-light text-foreground mb-6">
          Services Offered
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="font-light mb-3 text-base">
              Services Offered (Session Types & Modalities)
            </Label>
            <div className="flex flex-wrap gap-2">
              {/* Session Types */}
              {professionalProfile?.sessionTypes &&
              professionalProfile.sessionTypes.length > 0 ? (
                professionalProfile.sessionTypes.map((type) => (
                  <span
                    key={`session-${type}`}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-light"
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No session types set</span>
              )}
              {/* Modalities */}
              {professionalProfile?.modalities &&
              professionalProfile.modalities.length > 0 ? (
                professionalProfile.modalities.map((modality) => {
                  let label = modality;
                  if (modality === "online") label = "Video Call";
                  else if (modality === "inPerson") label = "In-Person";
                  else if (modality === "phone") label = "Phone Call";
                  else if (modality === "both") label = "Both Online & In-Person";

                  let colors = "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
                  if (modality === "online") colors = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
                  if (modality === "inPerson") colors = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
                  if (modality === "phone") colors = "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300";

                  return (
                    <span
                      key={`modality-${modality}`}
                      className={`px-3 py-1.5 rounded-full text-sm font-light ${colors}`}
                    >
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-muted-foreground text-sm">No modalities set</span>
              )}
            </div>
          </div>

          <div>
            <Label className="font-light mb-3 text-base">
              Languages Spoken
            </Label>
            {professionalProfile?.languages &&
            professionalProfile.languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professionalProfile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-light"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Payment */}
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-xl font-serif font-light text-foreground mb-6">
          Pricing & Payment
        </h2>

        <div className="space-y-4">
          {professionalProfile?.pricing && (
            <div className="grid gap-4 md:grid-cols-3">
              {professionalProfile.pricing.individualSession && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="font-light mb-1 text-sm">
                    Individual Session
                  </Label>
                  <p className="text-2xl font-medium text-foreground">
                    ${professionalProfile.pricing.individualSession}
                  </p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              )}

              {professionalProfile.pricing.coupleSession && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="font-light mb-1 text-sm">
                    Couple Session
                  </Label>
                  <p className="text-2xl font-medium text-foreground">
                    ${professionalProfile.pricing.coupleSession}
                  </p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              )}

              {professionalProfile.pricing.groupSession && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="font-light mb-1 text-sm">
                    Group Session
                  </Label>
                  <p className="text-2xl font-medium text-foreground">
                    ${professionalProfile.pricing.groupSession}
                  </p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              )}
            </div>
          )}

          {!professionalProfile?.pricing?.individualSession &&
            !professionalProfile?.pricing?.coupleSession &&
            !professionalProfile?.pricing?.groupSession && (
              <p className="text-muted-foreground">Pricing not set</p>
            )}

          {professionalProfile?.paymentAgreement && (
            <div>
              <Label className="font-light mb-2 text-base">
                Payment Agreement
              </Label>
              <p className="text-foreground capitalize">
                {professionalProfile.paymentAgreement.replace(/-/g, " ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={isEditable && isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setProfessionalProfile={updateProfile}
        profile={professionalProfile}
      />
    </>
  );
}
