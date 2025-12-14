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

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-sm rounded-xl border mt-10">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* AVATAR */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border shadow-sm">
          {avatar ? (
            <Image src={avatar} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No Avatar
            </div>
          )}
        </div>

        {isEditing && (
          <label className="mt-3 text-sm cursor-pointer text-blue-600">
            Change Avatar
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        )}
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            disabled={!isEditing}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditing ? "" : "bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            disabled={!isEditing}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditing ? "" : "bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>
      </div>

      {/* BUTTONS */}
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90"
        >
          Edit Profile
        </button>
      ) : (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90"
          >
            Save Changes
          </button>

          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}