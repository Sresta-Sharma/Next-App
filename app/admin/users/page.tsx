"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        const token = localStorage.getItem("token");

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
            alert("You cannot delete your own account.");
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
            alert("User deleted successfully.");
            
            // Remove from UI
            setUsers(users.filter((user: any) => user.user_id !== id));
        } else {
            alert(data.error || "Failed to delete user.");
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
            alert("You cannot change your own role.");
            return;
        }

        const newRole = prompt("Enter new role (user/admin):");
        
        if (!newRole || !["user", "admin"].includes(newRole)) {
            alert("Invalid role.");
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
                alert("User role updated successfully.");

                // Update UI
                setUsers(
                    users.map((u: any) => 
                    u.user_id === id ? { ...u, role: newRole } : u
                )
    );
            } else {
                alert(data.error || "Failed to update user role.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
      
      <table className="w-full border">
        <thead>
            <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
                </tr>
                </thead>     

        <tbody>
            {users.map((user: any) => (
                <tr key={user.user_id}>
                <td className="p-2 border">{user.user_id}</td>
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.role}</td>

                {/* Action Buttons */}
                <td className="p-2 border flex gap-2">

                    {/* Delete Button */}
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(user.user_id)}
                    >
                        Delete
                    </button>

                    {/* Update role button */}
                    <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
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
  );
}