"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const router = useRouter();
    
    type User = {
        user_id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        avatar?: string;
    };

    const [ user, setUser ] = useState<User | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Toggle edit mode
    const [isEditing, setIsEditing] = useState(false);
    
    // Load logged-in admin user data from local storage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (!storedUser) {
            router.replace("/login");
            return;
        }

        setUser(storedUser);
        setName(storedUser.name);
        setEmail(storedUser.email);
        setPhone(storedUser.phone || "");
    }, []);

    // Save profile update
  const handleSaveChanges = async () => {
    if (!user) return;

    const updatedData = { name, email, phone };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || result.message || "Failed to update profile.");
        return;
      }

      // Update UI + localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setIsEditing(false);

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Error updating profile.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setIsEditing(false);
  };

  if (!user) return <p>Loading...</p>;
    
  return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#111111]">Admin Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your admin profile and account settings.</p>
                </div>

                {/* Settings Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    
                    {/* Profile Section */}
                    <div className="p-8">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Profile Information</h2>

                        {/* STATIC FIELDS */}
                        <div className="space-y-4 mb-6">
                            <div>
                            <label className="block text-sm font-semibold text-[#111111] mb-2">User ID</label>
                            <input
                                disabled
                                value={user.user_id}
                                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-semibold text-[#111111] mb-2">Role</label>
                            <input
                                disabled
                                value={user.role}
                                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                            />
                            </div>
                        </div>

                        {/* EDITABLE FIELDS */}
                        <div className="space-y-4 mb-8">
                            <div>
                            <label className="block text-sm font-semibold text-[#111111] mb-2">Full Name</label>
                            <input
                                disabled={!isEditing}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg text-sm border transition ${
                                isEditing
                                    ? "border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                                }`}
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-semibold text-[#111111] mb-2">Email Address</label>
                            <input
                                disabled={!isEditing}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className={`w-full px-4 py-3 rounded-lg text-sm border transition ${
                                isEditing
                                    ? "border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                                }`}
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-semibold text-[#111111] mb-2">Phone Number</label>
                            <input
                                disabled={!isEditing}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg text-sm border transition ${
                                isEditing
                                    ? "border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                                }`}
                            />
                            </div>
                        </div>

                        {/* BUTTONS */}
                        {!isEditing ? (
                            <button
                            className="px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                            onClick={() => setIsEditing(true)}
                            >
                            Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                            <button
                                className="px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                                onClick={handleSaveChanges}
                            >
                                Save Changes
                            </button>

                            <button
                                className="px-6 py-3 border border-gray-300 text-[#111111] rounded-full text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
);
}