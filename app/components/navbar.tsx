"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar(){

    const pathname = usePathname();

    const linkClass = (path: string) =>
        pathname === path ? "text-blue-700 font-semibold underline" : "hover:text-blue-700 transition";

    return(
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">My App</h1>

          <div className="flex space-x-6 text-lg">
            <Link href="/" className={linkClass("/")}>
            Home 
            </Link>
            <Link href="/login" className={linkClass("/login")}>
            Login  
            </Link>
            <Link href="/register" className={linkClass("/register")}>
            Register
            </Link>
            <Link href="/contact" className={linkClass("/contact")}>
            Contact
            </Link>
          </div>
        </div>
      </nav>
    );
}