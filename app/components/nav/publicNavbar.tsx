"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  const isActive = (route: string) =>
    pathname === route ? "text-black font-semibold" : "text-gray-600";

  return (
    <nav className="w-full px-6 py-4 border-b bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#111111]">
          Beautiful Mess
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-[15px]">
          <Link href="/" className={isActive("/")}>Home</Link>
          <Link href="/blogs" className={isActive("/blogs")}>Blogs</Link>
          <Link href="/contact" className={isActive("/contact")}>Contact</Link>
          <Link href="/login" className={isActive("/login")}>Login</Link>
          <Link href="/register" className={isActive("/register")}>Register</Link>
        </div>
      </div>
    </nav>
  );
}
