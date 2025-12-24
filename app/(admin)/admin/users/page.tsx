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

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/admin/users`, {
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
        <div className="min-h-screen bg-[#FAFAFA]">
                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#111111]">Manage Users</h1>
                        <p className="text-gray-500 mt-2">View and manage all registered users.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700 text-sm border-b">
                                        <th className="p-4 text-left font-semibold">ID</th>
                                        <th className="p-4 text-left font-semibold">Name</th>
                                        <th className="p-4 text-left font-semibold">Email</th>
                                        <th className="p-4 text-left font-semibold">Role</th>
                                        <th className="p-4 text-left font-semibold">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.user_id} className={`text-sm ${idx !== users.length - 1 ? 'border-b' : ''}`}>
                                            <td className="p-4 text-gray-600">{user.user_id}</td>
                                            <td className="p-4 text-gray-900">{user.name}</td>
                                            <td className="p-4 text-gray-600">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-100 text-purple-700' 
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className="p-4 flex gap-2">
                                                <button
                                                    className="px-4 py-2 bg-[#111111] text-white rounded-full hover:opacity-90 transition text-xs font-semibold cursor-pointer"
                                                    onClick={() => handleUpdateRole(user.user_id)}
                                                >
                                                    Change Role
                                                </button>

                                                <button
                                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition text-xs font-semibold cursor-pointer"
                                                    onClick={() => handleDelete(user.user_id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    );
}