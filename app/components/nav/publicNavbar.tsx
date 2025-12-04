"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path ? "text-black font-semibold" : "text-gray-700";

  return (
    <nav className="w-full py-4 border-b bg-[#FAFAFA]">
      <div className="max-w-6xl  mx-auto px-6 flex justify-between">

        {/* Logo */}
        <div className="flex items-center cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-[16px]">
          <Link href="/" className={isActive("/")}>Home</Link>
          <Link href="/blogs" className={isActive("/blogs")}>Blogs</Link>
          <Link href="/contact" className={isActive("/contact")}>Contact</Link>
          <Link href="/login" className={isActive("/login")}>Login</Link>
          {/* <Link href="/register" className={isActive("/register")}>Register</Link> */}
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden flex flex-col gap-[5px] cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span className={`h-[2px] w-6 bg-black transition ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`h-[2px] w-6 bg-black transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-[2px] w-6 bg-black transition ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-4 text-[16px] pb-4">
          <Link href="/" className={isActive("/")} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/blogs" className={isActive("/blogs")} onClick={() => setOpen(false)}>Blogs</Link>
          <Link href="/contact" className={isActive("/contact")} onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/login" className={isActive("/login")} onClick={() => setOpen(false)}>Login</Link>
          {/* <Link href="/register" className={isActive("/register")} onClick={() => setOpen(false)}>Register</Link> */}
        </div>
      )}
    </nav>
  );
}
