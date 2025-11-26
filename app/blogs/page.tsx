"use client";

import { useEffect, useState } from "react";
import BlogCard from "../components/blogCard";

type Blog = {
  blog_id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("http://localhost:5000/blogs", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Latest Stories
      </h1>

      <p className="text-lg text-gray-600 mb-10">
        Explore the most recent posts — technical, personal, and everything in between.
      </p>

      {loading ? (
        <p className="text-gray-500 text-lg">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-500 text-lg">No blogs found.</p>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.blog_id}
              blog={blog}
            />
          ))}
        </div>
      )}
    </div>
  );
}
