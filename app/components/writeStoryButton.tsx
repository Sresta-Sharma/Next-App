"use client";

import { useRouter } from "next/navigation";

export default function WriteStoryButton() {
  const router = useRouter();

  const handleClick = () => {
   let user = null;

   try{
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
   } catch(err) {
    user = null;
   }

    if (!user) {
      router.push("/login");
    } else {
      router.push("/write");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-8 py-3 border border-[#1A1A1A] rounded-full hover:bg-gray-50 transition"
    >
      Write a Story
    </button>
  );
}
