"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blogs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to publish blog.");
        return;
      }

      toast.success("Blog published!");
      router.push("/dashboard/my-blogs");
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white border rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-6">Create New Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm h-40"
            placeholder="Write your blog content here..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
