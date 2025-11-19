"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard(){
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    // Protect dashboard page
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData){
            router.push("/login");
            return;
        }

        setUser(JSON.parse(userData));
    }, []);

    if (!user) return <p className="text-center mt-10">Loading...</p>;

    return(
        <div className="min-h-screen bg-white text-gray-900">

        {/* Navbar */}
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">My Dashboard</h1>

            <button onClick={() => {
                const confirmed = window.confirm("Are you sure you want to logout?");

                if (!confirmed) return; //Do nothing : User clicked cancel

                // User clicked yes : Proceed with logout
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
            }}
            className="px-4 py-2 border-gray-400 bg-gray-800 rounded-lg text-lg text-white hover:bg-gray-500 transition">
                Logout
            </button>
            </div>
        </nav>

        {/* User Card */}
        <div className="max-w-5xl mx-auto px-6 py-20 flex justify-center">
            <div className="bg-white border border-gray-200 rounded-xl p-10 w-full max-w-md flex flex-col items-center text-center">
                
                {/* User Avatar Circle */}
                <div className="w-24 h-24 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
                <p className="text-gray-700">{user.email}</p>
                <p className="text-gray-700 mt-1">{user.phone}</p>

                <div className="mt-6">
                    <button className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}