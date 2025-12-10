"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isActive = (path: string) =>
    pathname === path ? "text-black font-semibold" : "text-gray-700";

  // Check login status + user information
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    setUser(storedUser ? JSON.parse(storedUser) : null);
    }, [pathname]);

  const logout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Re-render navbar immediately
    setIsLoggedIn(false);
    setUser(null);

    router.push("/");
  };

  return (
    <nav className="w-full px-6 py-4 border-b bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-[16px]">
          <Link href="/" className={isActive("/")}>Home</Link>
          <Link href="/blogs" className={isActive("/blogs")}>Blogs</Link>
          <Link href="/contact" className={isActive("/contact")}>Contact</Link>

          {!isLoggedIn ? (
            // NOT LOGGED IN
            <Link href="/login" className={isActive("/login")}>Login</Link>
          ) : (
            // LOGGED IN
            <>
              {/* Write Button */}
              <Link href="/write" className="text-gray-700">Write</Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="cursor-pointer text-gray-700 hover:text-black transition"
              >
                Logout
              </button>

              {/* User Avatar + Name */}
              <div 
                  onClick={() => {
                    if (user?.role === "admin"){
                      router.push("/admin");
                    } else{
                      router.push("/dashboard");
                    }
                  }}
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>

                <span className="font-medium text-gray-800">
                  {user?.name}
                </span>
              </div>

            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
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
        <div className="md:hidden mt-4 flex flex-col gap-4 text-[16px] pb-4 px-6">
          <Link href="/" className={isActive("/")} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/blogs" className={isActive("/blogs")} onClick={() => setOpen(false)}>Blogs</Link>
          <Link href="/contact" className={isActive("/contact")} onClick={() => setOpen(false)}>Contact</Link>

          {!isLoggedIn ? (
            <Link
              href="/login"
              className={isActive("/login")}
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href="/write"
                className="text-gray-700"
                onClick={() => setOpen(false)}
              >
                Write
              </Link>

              {/* Mobile: Avatar + username */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>

                <span className="font-medium text-gray-800">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="text-left text-gray-700 hover: text-black cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
