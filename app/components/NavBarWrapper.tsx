"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on dashboard pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return <Navbar />;
}
