"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("user");
    if (!stored) return router.replace("/login");

    let user = null;
    try {
      user = JSON.parse(stored);
    } catch (err) {
      return router.replace("/login");
    }

    if (!user.role || user.role !== "admin") {
      return router.replace("/login");
    }

    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return <div className="p-10">Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-14 flex gap-12">

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

            {/* Logout */}
            <li className="px-3 py-2 pt-4 border-t">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full text-left text-red-500 hover:text-red-600 cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Section */}
        <main className="flex-1 space-y-12">
          {children}
        </main>

      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50 backdrop-blur-sm">

          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-lg border">

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Logout</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">

              {/* Cancel Button */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              {/* Confirm Logout */}
              <button
                onClick={() => {
                  localStorage.clear();
                  setShowLogoutModal(false);
                  router.replace("/");
                }}
                className="px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
