"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

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

  return <>{children}</>;
}
