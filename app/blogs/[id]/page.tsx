"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BlogViewer from "@/app/components/editor/blogViewer";
import type { SerializedEditorState } from "lexical";

type Blog = {
  blog_id: number;
  title: string;
  content: string;
  author_name: string;
  author_id: number;
  created_at: string;
};

export default function BlogReadPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.user_id);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

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

        {/* Title & Edit Link */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <h1 className="text-5xl font-bold text-black max-sm:text-3xl">
            {blog.title}
          </h1>
          
          {userId === blog.author_id && (
            <Link
              href={`/dashboard/edit-blog/${blog.blog_id}`}
              className="px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 whitespace-nowrap mt-1"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Meta */}
        <p className="text-sm text-gray-500 mb-10">
          {blog.author_name} ·{" "}
          {new Date(blog.created_at).toLocaleDateString()}
        </p>

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
