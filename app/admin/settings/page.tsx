"use client";

import { useEffect, useState, } from "react";
import { useRouter } from "next/navigation";

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

    // Load logged-in admin user data from local storage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (!storedUser) {
            router.replace("/login");
            return;
        }

        setUser(storedUser);
    }, []);

    // Handle name/phone update
    const handleUpdateProfile = async () => {

        if (!user) return;

        // Ask for new name, email and phone
        const newName = prompt("Enter your new name (leave empty to keep unchanged):", user.name);
        const newEmail = prompt("Enter your new email (leave empty to keep unchanged):", user.email);
        const newPhone = prompt("Enter your new phone number (leave empty to keep unchnaged):", user.phone || "");

        // If all cancelled, do nothing
        if (newName === null &&  newEmail === null && newPhone === null) {
            alert("No changes made.");
            return;
        }

        // Prepare data to send to backend
        const updatedData = {
            name: newName === "" || newName === null ? user.name : newName,
            email: newEmail === "" || newEmail === null ? user.email : newEmail,
            phone: newPhone === "" || newPhone === null ? user.phone : newPhone,
        };

        try{
            const res = await fetch("http://localhost:5000/api/auth/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(updatedData),
            });

            const result =  await res.json();

            if (!res.ok) {
                alert(result.message || "Failed to update profile.");
                return;
            }

            // Update local storage and state
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);

            alert("Profile updated successfully.");
        } catch (error) {
            alert("An error occurred while updating profile.");
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        // Ask current and new password
        const oldPassword = prompt("Enter your current password:");
        if (!oldPassword) {
            alert("You must enter your current password.");
            return;
        }

        const newPassword = prompt("Enter your new password:");
        if (!newPassword) {
            alert("New password cannot be empty.");
            return;
        }

        if (newPassword === oldPassword) {
            alert("New password must be different from old password!");
            return;
        }

        // Confirm new password
        const confirmPassword = prompt("Confirm your new password:");   
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try{
            const res = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || "Failed to change password.");
                return;
            }

            alert("Password changed successfully. Please log in again.");

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            router.replace("/login");
            } catch (error) {
                alert("An error occurred while changing password.");
            }
        };
    
    if (!user) return <p>Loading...</p>;
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Settings</h1>

            <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Admin Profile</h2>

                <p><strong>ID:</strong>{user.user_id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Phone:</strong> {user.phone || "N/A"}</p>

                <div className="mt-6 flex gap-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleUpdateProfile}>
                            Update Profile
                    </button>
                    
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={handleChangePassword}>
                            Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}