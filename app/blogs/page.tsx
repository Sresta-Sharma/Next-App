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
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

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

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT GRID (MAIN CONTENT) */}
        <div className="lg:col-span-2">

          {/* All Stories Card */}
          <section className="bg-white p-6 pb-10 rounded-lg shadow-sm">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">All Stories</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dive into all the posts — technical ideas, personal reflections, and everything in between.
              </p>
            </div>

            {/* Blog List */}
            <div className="space-y-1">
              {loading ? (
                <p className="text-gray-500 py-8 text-center">Loading blogs...</p>
              ) : blogs.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No blogs found.</p>
              ) : (
                currentBlogs.map((blog) => (
                  <BlogCard key={blog.blog_id} blog={blog} />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && blogs.length > blogsPerPage && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  &lt;&lt;
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-[#111111] text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  &gt;&gt;
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-8">

          {/* ABOUT CARD */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">About Beautiful Mess</h3>
            
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Beautiful Mess is a space where ideas collide, evolve, and take shape.
              Here, I write about technology, personal growth, challenges, experiences,
              small victories, and the lessons hidden inside the chaos of everyday life.
            </p>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Some posts are technical. Some are reflective. Some are just thoughts I
              needed to share. This space isn’t perfect — and it’s not supposed to be.
              It’s honest. It’s raw. It’s curious.
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
