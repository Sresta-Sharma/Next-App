"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ManageUsers() {
    type User = {
        user_id: number;
        name: string;
        email: string;
        role: string;
        phone?: string;
    };
    
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Wait until AdminLayout sets "user"
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return; // prevent early redirect

        
        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.replace("/login");
            return;
        }

        fetch("http://localhost:5000/api/auth/admin/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((data) => setUsers(data.users || []));
    }, []);

    // Function to handle user deletion
    const handleDelete = async (id: number) => {
        
        // Prevent deleting oneself
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = currentUser.user_id;
        
        if (id === currentUserId) {
            toast.error("You cannot delete your own account.");
            return;
        }
        
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/auth/admin/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

        const data = await res.json();

        if (data.success) {
            toast.success("User deleted successfully.");
            
            // Remove from UI
            setUsers(users.filter((user: any) => user.user_id !== id));
        } else {
            toast.error(data.error || "Failed to delete user.");
        }
        } catch (error) {
            console.error(error);
        }
    };

    // Function to handle role update
    const handleUpdateRole = async (id: number) => {

        // Prevent changing own role
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = currentUser.user_id;
        if (id === currentUserId) {
            toast.error("You cannot change your own role.");
            return;
        }

        const newRole = prompt("Enter new role (user/admin):");
        
        if (!newRole || !["user", "admin"].includes(newRole)) {
            toast.error("Invalid role.");
            return;
        }

        try{
            const res = await fetch(`http://localhost:5000/api/auth/admin/users/${id}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("User role updated successfully.");

                // Update UI
                setUsers(
                    users.map((u: any) => 
                    u.user_id === id ? { ...u, role: newRole } : u
                )
    );
            } else {
                toast.error(data.error || "Failed to update user role.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center mt-0">
        <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-xl font-semibold mb-6">Manage Users</h1>


        <table className="w-full border rounded-lg overflow-hidden">
        <thead>
        <tr className="bg-gray-100 text-gray-700 text-sm">
        <th className="p-3 border">ID</th>
        <th className="p-3 border">Name</th>
        <th className="p-3 border">Email</th>
        <th className="p-3 border">Role</th>
        <th className="p-3 border">Actions</th>
        </tr>
        </thead>


        <tbody>
        {users.map((user) => (
        <tr key={user.user_id} className="text-sm">
        <td className="p-3 border">{user.user_id}</td>
        <td className="p-3 border">{user.name}</td>
        <td className="p-3 border">{user.email}</td>
        <td className="p-3 border">{user.role}</td>


        <td className="p-3 border flex gap-3">
        <button
        className="px-3 py-1 bg-[#111111] text-white rounded-full hover:opacity-95 transition"
        onClick={() => handleDelete(user.user_id)}
        >
        Delete
        </button>


        <button
        className="px-3 py-1 border border-[#1A1A1A] rounded-full hover:bg-gray-50 transition"
        onClick={() => handleUpdateRole(user.user_id)}
        >
        Change Role
        </button>
        </td>
        </tr>
        ))}
        </tbody>
        </table>
        </div>
        </div>
        );
}