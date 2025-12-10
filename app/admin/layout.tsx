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

  const handleLogout = () => {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">

      {/* MATCH HOMEPAGE WIDTH + SPACING */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">

        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 shadow-sm border rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Admin Panel</h2>

          <ul className="space-y-3 text-gray-700 text-[16px]">
            <li>
              <Link href="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-100">
                Manage Users
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="block px-3 py-2 rounded hover:bg-gray-100">
                Settings
              </Link>
            </li>

            <li className="pt-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-500 hover:text-red-600 cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-10">
          {children}
        </main>

      </div>
    </div>
  );
}
