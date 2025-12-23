"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (stored) {
      setUser(stored);
      setName(stored.name);
      setEmail(stored.email);
      setAvatar(stored.avatar || null);
    }
  }, []);

  const handleSave = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ name, email, avatar }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Unable to update profile.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar || null);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!user) return <p className="p-6 text-center text-gray-500">Loading...</p>;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111111]">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account information here.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Avatar Section */}
          <div className="border-b border-gray-200 p-8 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mb-4">
              {avatar ? (
                <Image src={avatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-4xl font-semibold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
            </div>

            {isEditing && (
              <label className="mt-4 px-4 py-2 rounded-full border border-gray-300 text-sm cursor-pointer text-[#111111] hover:bg-gray-50 transition">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Field */}
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

              {/* Email Field */}
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
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-[#111111] rounded-full text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}