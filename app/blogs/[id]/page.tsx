"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BlogViewer from "@/app/components/editor/blogViewer";
import toast from "react-hot-toast";
import type { SerializedEditorState } from "lexical";

type Blog = {
  blog_id: number;
  title: string;
  content: string;
  author_name: string;
  author_id: number;
  created_at: string;
  tags?: string[];
};

export default function BlogReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get current user ID and role from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.user_id);
        setUserRole(user.role);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  const handleDelete = async () => {
    if (!confirm("Delete this blog?")) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Blog deleted");
    router.push("/blogs");
  };

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/${id}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch blog");

        console.log("Blog data received:", data.blog);
        console.log("Tags:", data.blog.tags);
        setBlog(data.blog);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  }

  if (!blog) {
    return <p className="text-center mt-20 text-gray-500">Blog not found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <article className="max-w-3xl mx-auto px-4">

        {/* Title & Action Buttons */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <h1 className="text-5xl font-bold text-black max-sm:text-3xl">
            {blog.title}
          </h1>
          
          <div className="flex gap-3 mt-1">
            {userId === blog.author_id && (
              <Link
                href={`/dashboard/edit-blog/${blog.blog_id}`}
                className="px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 whitespace-nowrap"
              >
                Edit
              </Link>
            )}
            
            {userRole === 'admin' && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 whitespace-nowrap cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Meta */}
        <p className="text-sm text-gray-500 mb-10">
          {blog.author_name} ·{" "}
          {new Date(blog.created_at).toLocaleDateString()}
        </p>

        {/* Tags */}
        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <BlogViewer
            content={JSON.parse(blog.content) as SerializedEditorState}
          />
        </div>

      </article>
    </main>
  );
}
