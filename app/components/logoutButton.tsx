"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full border border-[#1A1A1A] text-sm hover:bg-gray-100 transition"
    >
      Logout
    </button>
  );
}
