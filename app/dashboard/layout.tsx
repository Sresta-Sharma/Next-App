"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    router.replace("/login");
  }
  }, []);

  
  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const isActive = (path: string) =>
    pathname === path ? "text-black font-semibold" : "text-gray-700";

  const confirmLogout = () => setShowModal(true);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setShowModal(false);
    router.replace("/");
  };

  const menu = [
    { name: "Profile", href: "/dashboard/profile" },
    { name: "My Blogs", href: "/dashboard/myblogs" },
    { name: "Add New Blog", href: "/write" },
    { name: "Comments", href: "/dashboard/comments" },
    { name: "Logout", href: "#" },
  ];

  return (
    <>
      {/* LOGOUT CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[999]">
          <div className="bg-white p-6 rounded-2xl shadow-xl border w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-900">Logout Confirmation</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Are you sure you want to logout?
            </p>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={logout}
                className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD LAYOUT */}
      <div className="flex min-h-screen bg-gray-50">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-white shadow-md p-5">

          <h2 
          onClick={() =>
                    user?.role === "admin"
                      ? router.push("/admin")
                      : router.push("/dashboard")
                  }
          className="text-xl font-bold mb-4 cursor-pointer hover:opacity-80 transition">User Dashboard</h2>

          <nav className="flex flex-col gap-1">
            {menu.map((item) => (
              <button
                key={item.name}
                onClick={
                  item.name === "Logout"
                    ? confirmLogout
                    : () => router.push(item.href)
                }
                className={`cursor-pointer text-left px-3 py-2 text-[16px] rounded transition ${isActive(item.href)}`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
