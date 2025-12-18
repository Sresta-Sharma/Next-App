"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  // Route protection
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setShowModal(false);
    router.replace("/");
  };

  return (
    <>
      {/* LOGOUT CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[999]">
          <div className="bg-white p-6 rounded-2xl shadow-xl border w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Logout Confirmation
            </h2>
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

      {/* ONLY CHILDREN — NO UI */}
      {children}
    </>
  );
}
