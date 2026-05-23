"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  User,
  Bell,
  Shield,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
} from "lucide-react";
import { getSession } from "next-auth/react";

interface ClientSettings {
  name: string;
  email: string;
  phone: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    appointmentReminders: boolean;
    marketingEmails: boolean;
    sessionUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    allowMessages: boolean;
  };
}

export default function ClientSettingsPage() {
  const [settings, setSettings] = useState<ClientSettings>({
    name: "",
    email: "",
    phone: "",
    language: "en",
    notifications: {
      email: true,
      sms: true,
      appointmentReminders: true,
      marketingEmails: false,
      sessionUpdates: true,
    },
    privacy: {
      showProfile: true,
      allowMessages: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "privacy">("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const updateNotification = (key: keyof ClientSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacy = (key: keyof ClientSettings["privacy"], value: boolean) => {
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
            Manage your account settings and preferences
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
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
            Manage your account settings and preferences
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
      <div className="flex gap-2 border-b border-border/40">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-light transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 font-light transition-colors ${
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
          className={`px-4 py-2 font-light transition-colors ${
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
                  Personal Information
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
                <h3 className="text-lg font-light text-foreground">Email Types</h3>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Appointment Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded before your scheduled sessions</p>
                  </div>
                  <button
                    onClick={() => updateNotification("appointmentReminders", !settings.notifications.appointmentReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.appointmentReminders ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.appointmentReminders ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Session Updates</p>
                    <p className="text-xs text-muted-foreground">Receive updates about your therapy sessions</p>
                  </div>
                  <button
                    onClick={() => updateNotification("sessionUpdates", !settings.notifications.sessionUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.sessionUpdates ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.sessionUpdates ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-light text-foreground">Marketing Emails</p>
                    <p className="text-xs text-muted-foreground">Receive promotional content and newsletters</p>
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
                    <p className="font-light text-foreground">Show Profile to Professionals</p>
                    <p className="text-xs text-muted-foreground">Allow professionals you contact to view your profile information</p>
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
                    <p className="font-light text-foreground">Allow Messages from Professionals</p>
                    <p className="text-xs text-muted-foreground">Allow professionals to send you messages through the platform</p>
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
              </div>
            </div>

            {/* Data Management */}
            <div className="rounded-xl bg-card p-6 border border-border/40">
              <h2 className="text-xl font-serif font-light text-foreground mb-4">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your personal data and account settings
              </p>

              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                  <p className="font-light text-foreground">Download My Data</p>
                  <p className="text-xs text-muted-foreground">Export all your personal data in a downloadable format</p>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
                  <p className="font-light">Delete Account</p>
                  <p className="text-xs text-red-400">Permanently delete your account and all associated data</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}