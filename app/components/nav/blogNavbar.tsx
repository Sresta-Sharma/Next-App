"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BlogNavbar() {
  const pathname = usePathname();

  const isActive = (route: string) =>
    pathname === route ? "text-black font-semibold" : "text-gray-600";

  return (
    <nav className="w-full px-6 py-4 border-b bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[#111111]">
          Beautiful Mess
        </Link>

        <div className="flex items-center gap-6 text-[15px]">
          <Link href="/blogs" className={isActive("/blogs")}>All Blogs</Link>
          <Link href="/blogs/create" className={isActive("/blogs/create")}>Write</Link>
        </div>
      </div>
    </nav>
  );
}
