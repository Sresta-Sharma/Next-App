"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${API}/api/blog/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || "Failed to load blogs.");
          return;
        }

        setBlogs(result.blogs || []);
      } catch (err) {
        toast.error("Unable to fetch blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog?")) return;


    const res = await fetch(`${API}/api/blog/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    });


    if (!res.ok) return toast.error("Delete failed");
    setBlogs((prev) => prev.filter((b) => b.blog_id !== id));
    toast.success("Blog deleted");
    };
  
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold">My Blogs</h1>

          <Link
            href="/write"
            className="px-4 py-2 border border-[#1A1A1A] rounded-full hover:bg-gray-300 cursor-pointer transition"
          >
            + Create Blog
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : blogs.length === 0 ? (
          <p className="text-gray-600">You haven't written any blogs yet.</p>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Link key={blog.blog_id} href={`/blogs/${blog.blog_id}`}>
                <div
                  className="p-4 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm transition cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{blog.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(blog.created_at).toLocaleDateString()} • {blog.status}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/edit-blog/${blog.blog_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-black hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(blog.blog_id);
                        }}
                        className="text-sm text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
