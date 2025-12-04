"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setLoggedIn(!!user);
  }, []);

  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-[#1A1A1A]">
          © 2025 Beautiful Mess — All rights reserved.
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/blogs" className="hover:underline">Blogs</Link>

          {/* Write a Story → login or write */}
          <Link
            href={loggedIn ? "/write" : "/login"}
            className="hover:underline"
          >
            Write a Story
          </Link>

          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
