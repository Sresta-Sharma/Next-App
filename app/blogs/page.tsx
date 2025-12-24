"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "../components/blogCard";
import SubscribeForm from "../components/subscribeBox";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Blog = {
  blog_id: number;
  title: string;
  created_at: string;
  author_name: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      if (!API) {
        console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/blog`, {
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error("Failed to fetch blogs!");

        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT GRID (MAIN CONTENT) */}
        <div className="lg:col-span-2 space-y-12">

          {/* Heading */}
          <section>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Stories</h1>
            <p className="text-lg text-[#737373] leading-relaxed max-w-xl">
              Dive into all the posts — technical ideas, personal reflections, and everything in between.
            </p>
          </section>

          {/* Blog List */}
          <section className="space-y-8">
            {loading ? (
              <p className="text-gray-500 text-lg">Loading blogs...</p>
            ) : blogs.length === 0 ? (
              <p className="text-gray-500 text-lg">No blogs found.</p>
            ) : (
              blogs.map((blog) => (
                <Link key={blog.blog_id} href={`/blogs/${blog.blog_id}`}>
                  <BlogCard blog={blog} />
                  </Link>
              ))
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-8">

          {/* ABOUT CARD */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">About Beautiful Mess</h3>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              A space where ideas collide, evolve, and take shape—technical, personal, and honest.
            </p>

            <Link
              href="/about"
              className="text-sm inline-block mt-4 px-3 py-2 rounded-full border border-[#1A1A1A]"
            >
              Read more
            </Link>
          </section>

          {/* TRENDING TOPICS */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Trending Topics</h3>

            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Tech & Coding",
                "Life & Reflections",
                "Productivity",
                "Learning Journey",
                "Creative Thoughts",
                "Career & Growth",
                "Experiences",
                "Mindset",
              ].map((tag) => (
                <Link
                  href={`/tag/${tag.replace(/\s+/g, "-").toLowerCase()}`}
                  key={tag}
                  className="text-sm px-3 py-2 rounded-full bg-[#F3F3F3] hover:bg-[#EDEDED]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          {/* SUBSCRIBE CARD */}
          <section className="bg-white p-6 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Subscribe</h4>
            <p className="mt-2 text-sm text-gray-600">
              Get new stories delivered to your inbox.
            </p>

            <div className="mt-4">
              <SubscribeForm />
            </div>
          </section>

        </aside>
      </div>
    </main>
  );
}
