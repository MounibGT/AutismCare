"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInformation from "@/components/dashboard/BasicInformation";
import MedicalProfile from "@/components/dashboard/MedicalProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usersAPI, medicalProfileAPI } from "@/lib/api-client";
import { IUser } from "@/models/User";
import { IMedicalProfile } from "@/models/MedicalProfile";
import { UserPlus, AlertCircle } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<IUser | null>(null);
  const [medicalProfile, setMedicalProfile] = useState<IMedicalProfile | null>(
    null,
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const userData = await usersAPI.getById(params.id as string);
      setUser(userData as IUser);

      try {
        const medicalProfileData = await medicalProfileAPI.getByUserId(
          params.id as string,
        );
        setMedicalProfile(medicalProfileData as IMedicalProfile);
      } catch {
        // Medical profile might not exist
        console.log("Medical profile not found for patient:", params.id);
        setMedicalProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id, fetchData]);

  const handleSetActive = async () => {
    if (!user) return;

    setIsUpdatingStatus(true);
    try {
      await usersAPI.updateById(params.id as string, { status: "active" });
      await fetchData();
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSetInactive = async () => {
    if (!user) return;

    setIsUpdatingStatus(true);
    try {
      await usersAPI.updateById(params.id as string, { status: "inactive" });
      await fetchData();
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-light">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" className="font-light">
          <Link href="/admin/dashboard/patients">← Back to Patients</Link>
        </Button>
        <div className="flex gap-3">
          {user.status === "pending" && (
            <Button
              onClick={handleSetActive}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 font-light tracking-wide transition-all duration-300 hover:scale-105"
            >
              {isUpdatingStatus ? "Updating..." : "Activate Patient"}
            </Button>
          )}
          {user.status === "active" && (
            <Button
              onClick={handleSetInactive}
              disabled={isUpdatingStatus}
              variant="destructive"
              className="font-light tracking-wide transition-all duration-300 hover:scale-105"
            >
              {isUpdatingStatus ? "Updating..." : "Deactivate"}
            </Button>
          )}
          {user.status === "inactive" && (
            <Button
              onClick={handleSetActive}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 font-light tracking-wide transition-all duration-300 hover:scale-105"
            >
              {isUpdatingStatus ? "Updating..." : "Reactivate Patient"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-card p-8 border border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "guest" && (
              <Badge
                variant="secondary"
                className="text-sm px-4 py-1.5 font-light tracking-wide"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Guest
              </Badge>
            )}
            <Badge
              variant={
                user.status === "active"
                  ? "default"
                  : user.status === "pending"
                    ? "secondary"
                    : "destructive"
              }
              className="text-sm px-4 py-1.5 font-light tracking-wide capitalize"
            >
              {user.status || "Unknown"}
            </Badge>
          </div>
        </div>
      </div>
      {user.role === "guest" && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Guest Account
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              This user booked as a guest without creating a full account. They
              have limited profile information and no medical profile. Consider
              reaching out to convert them to a full client account.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList
          className={`grid w-full ${user.role === "guest" ? "grid-cols-1" : "grid-cols-2"} bg-muted/30`}
        >
          <TabsTrigger value="basic" className="font-light">
            Basic Information
          </TabsTrigger>
          {user.role !== "guest" && (
            <TabsTrigger value="medical" className="font-light">
              Medical Profile
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <BasicInformation user={user} isEditable={false} />
        </TabsContent>

        {user.role !== "guest" && (
          <TabsContent value="medical" className="space-y-6 mt-6">
            <MedicalProfile
              profile={medicalProfile || undefined}
              userId={params.id as string}
              setProfile={setMedicalProfile}
              isEditable={false}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
