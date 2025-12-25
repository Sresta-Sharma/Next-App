"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/app/components/blogCard";
import SubscribeBox from "@/app/components/subscribeBox";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Blog = {
  blog_id: number;
  title: string;
  tags: string[];
  created_at: string;
  author_name: string;
};

export default function TagPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Convert slug back to tag name (e.g., "tech-coding" -> "Tech & Coding")
  const tagName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/And/g, "&");

  useEffect(() => {
    async function fetchBlogsByTag() {
      if (!API) {
        console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/blog/tag/${encodeURIComponent(tagName)}`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch blogs by tag");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setBlogs(data.blogs || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching blogs by tag:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogsByTag();
  }, [tagName]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT GRID (MAIN CONTENT) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Heading */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition"
              >
                ← Back to Home
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {tagName}
            </h1>
            <p className="text-lg text-[#737373] leading-relaxed">
              {loading
                ? "Loading posts..."
                : `${total} ${total === 1 ? "post" : "posts"} tagged with "${tagName}"`}
            </p>
          </section>

          {/* Blog List */}
          <section className="space-y-8">
            {loading ? (
              <p className="text-gray-500 text-lg">Loading blogs...</p>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No blogs found with this tag yet.
                </p>
                <Link
                  href="/blogs"
                  className="text-sm px-5 py-2 rounded-full border border-[#1A1A1A] inline-block hover:bg-gray-100 transition"
                >
                  Browse All Posts
                </Link>
              </div>
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
              A space where ideas collide, evolve, and take shape—technical,
              personal, and honest.
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
            <h3 className="text-lg font-semibold">More Topics</h3>

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
              ].map((tag) => {
                const tagSlug = tag.replace(/\s+/g, "-").toLowerCase();
                const isActive = tag === tagName;
                
                return (
                  <Link
                    href={`/tag/${tagSlug}`}
                    key={tag}
                    className={`text-sm px-3 py-2 rounded-full inline-block transition ${
                      isActive
                        ? "bg-[#111111] text-white"
                        : "bg-[#F3F3F3] hover:bg-[#EDEDED]"
                    }`}
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* SUBSCRIBE CTA */}
          <section className="bg-white p-6 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Subscribe</h4>
            <p className="mt-2 text-sm text-gray-600">
              Get new stories in your inbox.
            </p>

            <SubscribeBox />
          </section>
        </aside>
      </div>
    </main>
  );
}
