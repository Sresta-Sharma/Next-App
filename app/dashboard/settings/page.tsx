"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account states
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }

    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscribe/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setIsSubscribed(data.isSubscribed || false);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [token]);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleSubscription = async () => {
    try {
      const endpoint = isSubscribed
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscribe/unsubscribe`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscribe/subscribe`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update subscription");
        return;
      }

      setIsSubscribed(!isSubscribed);
      toast.success(
        isSubscribed
          ? "Unsubscribed from newsletter"
          : "Subscribed to newsletter"
      );
    } catch (err) {
      toast.error("Error updating subscription");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Password is required");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure? This will permanently delete your account and ALL your blogs. This cannot be undone."
    );

    if (!confirmDelete) return;

    setDeletingAccount(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: deletePassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account");
        return;
      }

      toast.success("Account deleted successfully");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      router.push("/");
    } catch (err) {
      toast.error("Error deleting account");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111111]">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account and preferences</p>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#111111] mb-6">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="mt-6 px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#111111] mb-6">Newsletter</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#111111] font-semibold">Email Newsletter Subscription</p>
              <p className="text-gray-600 text-sm mt-1">
                Receive updates when new blogs are posted
              </p>
            </div>

            <button
              onClick={handleToggleSubscription}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition ${
                isSubscribed
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#111111] text-white hover:opacity-90"
              }`}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-6">Danger Zone</h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Deleting your account is permanent and cannot be undone. All your blogs and data will be deleted.
            </p>

            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">
                Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
