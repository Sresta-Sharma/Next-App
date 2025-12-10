"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
    } else {
      setAllowed(true); // allow rendering only after login
    }
  }, []);

  if (!allowed) return null;
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to publish story.");
        setLoading(false);
        return;
      }

      setSuccess("Story published successfully!");
      setLoading(false);

      setTimeout(() => router.push("/blogs"), 1500);
    } catch (err) {
      console.log(err);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold">Write a Story</h1>

        <p className="mt-3 text-gray-600 text-lg">
          Share your thoughts, experiences, or ideas with the world.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* TITLE INPUT */}
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white"
          />

          {/* CONTENT TEXTAREA */}
          <textarea
            placeholder="Start writing your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white"
          />

          {/* ERROR */}
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-[#111] text-white text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Story"}
          </button>
        </form>
      </div>
    </main>
  );
}
