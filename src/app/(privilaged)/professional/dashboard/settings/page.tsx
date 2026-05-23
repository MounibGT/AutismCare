"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  User,
  Bell,
  Shield,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { getSession } from "next-auth/react";

interface ProfessionalSettings {
  name: string;
  email: string;
  phone: string;
  language: string;
  bio: string;
  specialties: string[];
  sessionSettings: {
    defaultSessionLength: number; // in minutes
    maxAdvanceBookingDays: number;
    minSessionGap: number; // in hours
    allowOnlineBookings: boolean;
    allowGuestBookings: boolean;
  };
  pricing: {
    soloSession: number;
    coupleSession: number;
    groupSession: number;
    currency: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    newBookingAlerts: boolean;
    cancellationAlerts: boolean;
    reminderAlerts: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    showProfile: boolean;
    showReviews: boolean;
    allowMessages: boolean;
    showAvailability: boolean;
  };
}

const SPECIALTY_OPTIONS = [
  "Anxiety",
  "Depression",
  "Trauma",
  "PTSD",
  "Couples Therapy",
  "Family Therapy",
  "Child Psychology",
  "Grief Counseling",
  "Stress Management",
  "Addiction",
  "Self-Esteem",
  "Relationship Issues",
  "Cognitive Behavioral Therapy",
  "Mindfulness",
  "Other",
];

export default function ProfessionalSettingsPage() {
  const [settings, setSettings] = useState<ProfessionalSettings>({
    name: "",
    email: "",
    phone: "",
    language: "en",
    bio: "",
    specialties: [],
    sessionSettings: {
      defaultSessionLength: 60,
      maxAdvanceBookingDays: 30,
      minSessionGap: 1,
      allowOnlineBookings: true,
      allowGuestBookings: true,
    },
    pricing: {
      soloSession: 120,
      coupleSession: 150,
      groupSession: 180,
      currency: "CAD",
    },
    notifications: {
      email: true,
      sms: true,
      newBookingAlerts: true,
      cancellationAlerts: true,
      reminderAlerts: true,
      marketingEmails: false,
    },
    privacy: {
      showProfile: true,
      showReviews: true,
      allowMessages: true,
      showAvailability: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "sessions" | "notifications" | "privacy">("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await getSession();
      
      if (session?.user) {
        setSettings((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
          phone: (session.user as { phone?: string }).phone || "",
          language: (session.user as { language?: string }).language || "en",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Simulate save - in production, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Simulate password change - in production, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSettings((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const addCustomSpecialty = () => {
    if (newSpecialty.trim() && !settings.specialties.includes(newSpecialty.trim())) {
      setSettings((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty("");
    }
  };

  const updateSessionSettings = (key: keyof ProfessionalSettings["sessionSettings"], value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      sessionSettings: {
        ...prev.sessionSettings,
        [key]: value,
      },
    }));
  };

  const updatePricing = (key: keyof ProfessionalSettings["pricing"], value: number | string) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [key]: value,
      },
    }));
  };

  const updateNotification = (key: keyof ProfessionalSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacy = (key: keyof ProfessionalSettings["privacy"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground font-light mt-2">
            Manage your professional profile and practice settings
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground font-light mt-2">
            Manage your professional profile and practice settings
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className={`h-4 w-4 ${saving ? "animate-pulse" : ""}`} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <p className="font-light">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="font-light">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border/40 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-light transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 font-light transition-colors whitespace-nowrap ${
            activeTab === "sessions"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Sessions & Pricing
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 font-light transition-colors whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4 inline mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 font-light transition-colors whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Privacy & Security
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Professional Information
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Preferred Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-light text-muted-foreground mb-2">
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Professional Bio
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => setSettings((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell clients about your professional background, approach to therapy, and experience..."
                />
              </div>
            </div>

            {/* Specialties */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Specialties
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mb-6">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      settings.specialties.includes(specialty)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomSpecialty()}
                  className="flex-1 px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add custom specialty..."
                />
                <button
                  onClick={addCustomSpecialty}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Add
                </button>
              </div>

              {settings.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Selected specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {specialty}
                        <button
                          onClick={() => toggleSpecialty(specialty)}
                          className="ml-2 text-primary/60 hover:text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Change Password
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handlePasswordChange}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="h-4 w-4" />
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            {/* Session Settings */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Session Settings
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Default Session Length (minutes)
                  </label>
                  <select
                    value={settings.sessionSettings.defaultSessionLength}
                    onChange={(e) => updateSessionSettings("defaultSessionLength", parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionSettings.maxAdvanceBookingDays}
                    onChange={(e) => updateSessionSettings("maxAdvanceBookingDays", parseInt(e.target.value))}
                    min={1}
                    max={365}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Minimum Gap Between Sessions (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionSettings.minSessionGap}
                    onChange={(e) => updateSessionSettings("minSessionGap", parseInt(e.target.value))}
                    min={0}
                    max={24}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Allow Online Bookings</p>
                    <p className="text-xs text-muted-foreground">Clients can book sessions through the platform</p>
                  </div>
                  <button
                    onClick={() => updateSessionSettings("allowOnlineBookings", !settings.sessionSettings.allowOnlineBookings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sessionSettings.allowOnlineBookings ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sessionSettings.allowOnlineBookings ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Allow Guest Bookings</p>
                    <p className="text-xs text-muted-foreground">Guests without accounts can request sessions</p>
                  </div>
                  <button
                    onClick={() => updateSessionSettings("allowGuestBookings", !settings.sessionSettings.allowGuestBookings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sessionSettings.allowGuestBookings ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sessionSettings.allowGuestBookings ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Session Pricing
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Solo Session ({settings.pricing.currency})
                  </label>
                  <input
                    type="number"
                    value={settings.pricing.soloSession}
                    onChange={(e) => updatePricing("soloSession", parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: {settings.pricing.currency} {settings.pricing.soloSession}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Couple Session ({settings.pricing.currency})
                  </label>
                  <input
                    type="number"
                    value={settings.pricing.coupleSession}
                    onChange={(e) => updatePricing("coupleSession", parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: {settings.pricing.currency} {settings.pricing.coupleSession}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Group Session ({settings.pricing.currency})
                  </label>
                  <input
                    type="number"
                    value={settings.pricing.groupSession}
                    onChange={(e) => updatePricing("groupSession", parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: {settings.pricing.currency} {settings.pricing.groupSession} per person
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-muted-foreground mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.pricing.currency}
                    onChange={(e) => updatePricing("currency", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="rounded-xl bg-card p-6 border border-border/40">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-serif font-light text-foreground">
                Notification Preferences
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-light text-foreground">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateNotification("email", !settings.notifications.email)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-light text-foreground">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via text message</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateNotification("sms", !settings.notifications.sms)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.sms ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.sms ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <hr className="border-border/40" />

              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Alert Types</h3>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">New Booking Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when a client books a session</p>
                  </div>
                  <button
                    onClick={() => updateNotification("newBookingAlerts", !settings.notifications.newBookingAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.newBookingAlerts ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.newBookingAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Cancellation Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when a client cancels a session</p>
                  </div>
                  <button
                    onClick={() => updateNotification("cancellationAlerts", !settings.notifications.cancellationAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.cancellationAlerts ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.cancellationAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Session Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded before upcoming sessions</p>
                  </div>
                  <button
                    onClick={() => updateNotification("reminderAlerts", !settings.notifications.reminderAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.reminderAlerts ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.reminderAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Marketing Emails</p>
                    <p className="text-xs text-muted-foreground">Receive promotional content and platform updates</p>
                  </div>
                  <button
                    onClick={() => updateNotification("marketingEmails", !settings.notifications.marketingEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.marketingEmails ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.marketingEmails ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-serif font-light text-foreground">
                  Privacy Settings
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Show Profile Publicly</p>
                    <p className="text-xs text-muted-foreground">Allow your profile to be visible in the professional directory</p>
                  </div>
                  <button
                    onClick={() => updatePrivacy("showProfile", !settings.privacy.showProfile)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.showProfile ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showProfile ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Show Reviews</p>
                    <p className="text-xs text-muted-foreground">Display client reviews on your public profile</p>
                  </div>
                  <button
                    onClick={() => updatePrivacy("showReviews", !settings.privacy.showReviews)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.showReviews ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showReviews ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Allow Client Messages</p>
                    <p className="text-xs text-muted-foreground">Allow clients to send you messages through the platform</p>
                  </div>
                  <button
                    onClick={() => updatePrivacy("allowMessages", !settings.privacy.allowMessages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.allowMessages ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.allowMessages ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Show Availability</p>
                    <p className="text-xs text-muted-foreground">Let clients see your available time slots for booking</p>
                  </div>
                  <button
                    onClick={() => updatePrivacy("showAvailability", !settings.privacy.showAvailability)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.showAvailability ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showAvailability ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <h2 className="text-xl font-serif font-light text-foreground mb-4">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your professional data and account settings
              </p>

              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                  <p className="font-light text-foreground">Download My Practice Data</p>
                  <p className="text-xs text-muted-foreground">Export all your professional and client session data</p>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
                  <p className="font-light">Deactivate Account</p>
                  <p className="text-xs text-red-400">Temporarily hide your profile and stop accepting bookings</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}