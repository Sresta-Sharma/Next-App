"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BlogEditor from "@/app/components/editor/blogEditor";
import toast from "react-hot-toast";
import type { SerializedEditorState } from "lexical";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState<SerializedEditorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

//   Load Blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setTitle(data.blog.title);
        setBody(JSON.parse(data.blog.content));
      } catch (err) {
        toast.error("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

// Update Blog
  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            content: JSON.stringify(body),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Blog updated!");
      router.push(`/blogs/${id}`);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-5xl font-bold mb-8 max-sm:text-3xl">
          Edit Blog
        </h1>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            w-full mb-6 text-3xl font-semibold
            border border-gray-200 rounded-md px-4 py-3
            bg-transparent outline-none
          "
        />

        {/* Editor */}
        <BlogEditor onChange={setBody} initialState={body} />

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-6 py-2 rounded-full bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update"}
          </button>
        </div>

      </div>
    </div>
  );
}
