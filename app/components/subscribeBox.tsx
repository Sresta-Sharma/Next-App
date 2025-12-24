"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[A-Za-z0-9](?!.*\.\.)[A-Za-z0-9._-]*[A-Za-z0-9]@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || result.message || "Subscription failed");
      } else {
        toast.success(result.message || "Subscribed! Check your inbox.");
        setEmail("");
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full"
    >
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded-full border border-gray-200 text-sm"
        aria-label="Email"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#111111] text-white text-sm disabled:opacity-50 hover:cursor-pointer shrink-0"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
