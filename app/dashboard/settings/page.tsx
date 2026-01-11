"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account states
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
    }

    // Fetch user auth method
    const fetchUserAuthMethod = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          // Check if user has oauth_provider set
          setIsOAuthUser(!!data.user?.oauth_provider);
        }
      } catch (err) {
        console.error("Error fetching auth method:", err);
      }
    };

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

    fetchUserAuthMethod();
    fetchSubscriptionStatus();
  }, [token, router]);

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
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111111]">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Change Password */}
          <div className="space-y-6">
            {/* Change Password Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-[#111111] mb-6">Change Password</h2>

              {isOAuthUser ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>OAuth Account Detected</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      You signed in with Google. To change your password, please visit your Google account settings.
                    </p>
                  </div>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
                  >
                    Manage Google Account →
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                    />
                    <span
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
                    >
                      {showOldPassword ? "HIDE" : "SHOW"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
                    >
                      {showNewPassword ? "HIDE" : "SHOW"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
                    >
                      {showConfirmPassword ? "HIDE" : "SHOW"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="mt-6 px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Newsletter & Danger Zone */}
          <div className="space-y-6">
            {/* Subscription Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-[#111111] mb-6">Newsletter</h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[#111111] font-semibold">Email Newsletter Subscription</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Receive updates when new blogs are posted
                  </p>
                </div>

                <button
                  onClick={handleToggleSubscription}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition shrink-0 ${
                    isSubscribed
                      ? "border bg-white text-red-500 hover:bg-red-200 cursor-pointer"
                      : "bg-[#111111] text-white hover:opacity-90 cursor-pointer"
                  }`}
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-red-600 mb-2">Delete Account</h2>
              <p className="text-gray-600 text-sm mb-6">
                This will permanently delete your account and all your content.
              </p>

              <div className="space-y-4">
                {isOAuthUser ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      For OAuth accounts, type <strong>DELETE</strong> to confirm account deletion.
                    </p>
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">
                    {isOAuthUser ? "Confirmation" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder={isOAuthUser ? "Type DELETE to confirm" : "Enter your password to confirm"}
                      className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                    />
                    {!isOAuthUser && (
                      <span
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
                      >
                        {showDeletePassword ? "HIDE" : "SHOW"}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="mt-6 px-6 py-3 border bg-white text-red-500 rounded-full text-sm font-semibold hover:bg-red-200 transition cursor-pointer"
                >
                  {deletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
