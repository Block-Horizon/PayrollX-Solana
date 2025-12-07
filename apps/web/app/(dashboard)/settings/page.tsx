"use client";

import { useState, useEffect } from "react";

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "UTC",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [authUser]);

  const { user: authUser } = useAuthStore();

  const fetchSettings = async () => {
    try {
      if (!authUser) {
        throw new Error("No user found. Please login.");
      }
      setSettings((prev) => ({
        ...prev,
        firstName: authUser.firstName ?? "",
        lastName: authUser.lastName ?? "",
        email: authUser.email ?? "",
        role: authUser.role ?? "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const { setUser } = useAuthStore();

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!authUser) {
        throw new Error("No user found. Please login.");
      }
      setUser({
        ...authUser,
        firstName: settings.firstName,
        lastName: settings.lastName,
        email: settings.email,
        role: settings.role,
      });
      setSuccess("Settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof UserSettings] as any),
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5eead4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#fafafa]">Settings</h1>
        <p className="text-[#71717a]">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#5eead4]/10 border border-[#5eead4]/30 text-[#5eead4] px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-[#18181b] border-[#27272a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-4">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={settings.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={settings.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Role
              </label>
              <input
                type="text"
                value={settings.role}
                disabled
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] rounded-md text-[#71717a]"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#18181b] border-[#27272a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-[#fafafa]">
                  Email Notifications
                </label>
                <p className="text-sm text-[#71717a]">
                  Receive notifications via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  handleNestedInputChange(
                    "notifications",
                    "email",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-[#5eead4] focus:ring-[#5eead4] border-[#27272a] rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-[#fafafa]">
                  SMS Notifications
                </label>
                <p className="text-sm text-[#71717a]">
                  Receive notifications via SMS
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) =>
                  handleNestedInputChange(
                    "notifications",
                    "sms",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-[#5eead4] focus:ring-[#5eead4] border-[#27272a] rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-[#fafafa]">
                  Push Notifications
                </label>
                <p className="text-sm text-[#71717a]">
                  Receive push notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) =>
                  handleNestedInputChange(
                    "notifications",
                    "push",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-[#5eead4] focus:ring-[#5eead4] border-[#27272a] rounded"
              />
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-[#18181b] border-[#27272a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-4">
            App Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Theme
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) =>
                  handleNestedInputChange(
                    "preferences",
                    "theme",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  handleNestedInputChange(
                    "preferences",
                    "language",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Timezone
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) =>
                  handleNestedInputChange(
                    "preferences",
                    "timezone",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 bg-[#09090b] border-[#27272a] text-[#fafafa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5eead4] focus:border-[#5eead4]"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:opacity-50 text-[#09090b] font-semibold px-6 py-2 rounded-lg"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
