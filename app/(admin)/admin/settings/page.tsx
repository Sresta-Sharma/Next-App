"use client";

import { useEffect, useState, } from "react";
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
      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
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
  <div className="flex justify-center mt-0">
    <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>

      <h2 className="text-xl font-semibold mb-6 text-gray-800">Admin Profile</h2>

      {/* STATIC FIELDS */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-gray-600 text-sm font-medium mb-1 block">User ID</label>
          <input
            disabled
            value={user.user_id}
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-gray-600 text-sm font-medium mb-1 block">Role</label>
          <input
            disabled
            value={user.role}
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-sm cursor-not-allowed"
          />
        </div>
      </div>

      {/* EDITABLE FIELDS */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-gray-600 text-sm font-medium mb-1 block">Name</label>
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
          <label className="text-gray-600 text-sm font-medium mb-1 block">Email</label>
          <input
            disabled={!isEditing}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditing ? "" : "bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="text-gray-600 text-sm font-medium mb-1 block">Phone</label>
          <input
            disabled={!isEditing}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditing ? "" : "bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>
      </div>

      {/* BUTTONS */}
      {!isEditing ? (
        <button
          className="px-4 py-2 bg-[#111111] text-white text-sm rounded-full hover:opacity-90 transition"
          onClick={() => setIsEditing(true)}
        >
          Update Profile
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-[#111111] text-white text-sm rounded-full hover:opacity-90 transition"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>

          <button
            className="px-4 py-2 border border-[#1A1A1A] text-sm rounded-full hover:bg-gray-50 transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  </div>
);
}