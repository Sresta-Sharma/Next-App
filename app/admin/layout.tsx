"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        
        // Only admin allowed
        if (!user || user.role !== "admin") {
            router.replace("/login");
        }
    }, []);

    // Logout handler
    const handleLogout = () => {
        const confirmLogout = confirm("Are you sure you want to logout?");
        if (!confirmLogout) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        router.replace("/");
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-6">
                <div>
                <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
                
                <ul className="space-y-4">
                    <li>
                        <Link href="/admin" className="hover:underline">Dashboard</Link>
                    </li>
                    <li>
                        <Link href="/admin/users" className="hover:underline">Manage Users</Link>
                    </li>
                    <li>
                        <Link href="/admin/settings" className="hover:underline">Settings</Link>
                    </li>
                    <li className="pt-4 border-t border-gray-600">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-red-400 hover:text-red-300"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-100">
                {children}
            </main>
        </div>
    );

}