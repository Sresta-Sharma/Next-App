"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setShowModal(false);
    router.replace("/");
  };

  const parseJwt = (token: string | null) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const scheduleAccessRefresh = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const accessToken = localStorage.getItem("accessToken");
    const payload = parseJwt(accessToken);
    if (!payload || !payload.exp) {
      // No valid token; force logout
      logout();
      return;
    }
    const now = Date.now();
    const expMs = payload.exp * 1000;
    // Refresh 60s before expiry; if already past, refresh immediately
    let delay = expMs - now - 60_000;
    if (delay < 0) delay = 0;
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, delay);
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );
      if (!res.ok) {
        // Invalid/expired refresh token → logout
        logout();
        return;
      }
      const data = await res.json();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        // Reschedule next refresh using new token
        scheduleAccessRefresh();
      } else {
        logout();
      }
    } catch {
      // Network or other errors: safest is to logout
      logout();
    }
  };

  // Route protection
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    // On entry, proactively schedule access token refresh
    scheduleAccessRefresh();
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [router]);

  // If page regains visibility after long inactivity, check and refresh immediately if needed
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const token = localStorage.getItem("accessToken");
        const payload = parseJwt(token);
        const now = Date.now();
        if (!payload || payload.exp * 1000 - now < 60_000) {
          // Expiring within 60s or invalid → refresh now
          refreshAccessToken();
        } else {
          scheduleAccessRefresh();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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
