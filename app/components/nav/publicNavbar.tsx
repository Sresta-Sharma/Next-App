"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Logout modal state
  const [showModal, setShowModal] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
  // Exact match only for homepage
  if (path === "/") {
    return pathname === "/" ? "text-black font-semibold" : "text-gray-700";
  }

  // For all other routes
  return pathname.startsWith(path)
    ? "text-black font-semibold"
    : "text-gray-700";
};


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);
    setUser(storedUser ? JSON.parse(storedUser) : null);

    const handleClickOutside = (e: MouseEvent) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(e.target as Node)
    ) {
      setShowUserMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname]);

  const confirmLogout = () => setShowModal(true);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    setShowModal(false);
    router.push("/");
  };

  return (
    <>
      {/* LOGOUT MODAL */}
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

      <nav className="w-full px-6 py-4 border-b bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src="/pic.png"
              alt="Logo"
              width={80}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-[16px]">
            <Link href="/" className={isActive("/")}>Home</Link>
            <Link href="/blogs" className={isActive("/blogs")}>Blogs</Link>
            <Link href="/contact" className={isActive("/contact")}>Contact</Link>

            {!isLoggedIn ? (
              <Link href="/login" className={isActive("/login")}>Login</Link>
            ) : (
              <>
                <Link href="/write" className={isActive("/write")}>Write</Link>

                {/* USER MENU */}
                <div className="relative" ref={userMenuRef}>
                  <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                      {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <span>{user?.name}</span>
                  </div>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-md border border-gray-100 z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/dashboard/profile");
                        }}
                        className="w-full text-left px-5 py-3 text-sm text-[#111111] hover:bg-[#F5F5F5] transition"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/dashboard/myblogs");
                        }}
                        className="w-full text-left px-5 py-3 text-sm text-[#111111] hover:bg-[#F5F5F5] transition"
                      >
                        My Blogs
                      </button>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push("/admin");
                          }}
                          className="w-full text-left px-5 py-3 text-sm text-[#111111] hover:bg-[#F5F5F5] transition"
                        >
                          Admin Panel
                        </button>
                      )}

                      <div className="h-px bg-gray-100 mx-3" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          confirmLogout();
                        }}
                        className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
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
            <Link href="/" onClick={() => setOpen(false)} className={isActive("/")}>Home</Link>
            <Link href="/blogs" onClick={() => setOpen(false)} className={isActive("/blogs")}>Blogs</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className={isActive("/contact")}>Contact</Link>

            {!isLoggedIn ? (
              <Link href="/login" onClick={() => setOpen(false)} className={isActive("/login")}>
                Login
              </Link>
            ) : (
              <>
                <Link href="/write" 
                 onClick={() => setOpen(false)} 
                 className={isActive("/write")}>
                  Write
                </Link>

                <div 
                onClick={() =>
                    user?.role === "admin"
                      ? router.push("/admin")
                      : router.push("/")
                  }
                className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition ${isActive(user?.role === "admin" ? "/admin" : "/dashboard")}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="font-medium text-gray-800">{user?.name}</span>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    confirmLogout();
                  }}
                  className="text-left text-gray-700 hover:text-black cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
