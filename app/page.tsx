"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "./components/blogCard";
import WriteStoryButton from "./components/writeStoryButton";
import SubscribeBox from "./components/subscribeBox";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/blog`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error(`Failed to fetch blogs: ${res.status} ${res.statusText}`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const blogList = Array.isArray(data) ? data : data.blogs ?? [];
        setBlogs(blogList);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  const latest = blogs.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Vichar Kendra
        </h1>

        <p className="mt-4 text-2xl font-bold text-[#635b5b]">
          Center of Thoughts
        </p>

        <p className="mt-6 text-2xl text-[#737373] max-w-2xl mx-auto leading-snug">
          A digital space where ideas, reflections, and knowledge come together.
        </p>

        <p className="mt-4 text-lg text-[#737373] max-w-2xl mx-auto">
          Share your thoughts, explore diverse perspectives, and read stories on
          technology, learning, life experiences, growth, and the everyday journey
          of a curious mind.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/blogs"
            className="px-8 py-3 bg-[#111111] text-white rounded-full hover:opacity-95 transition"
          >
            Explore Thoughts
          </Link>

          <WriteStoryButton />
        </div>
      </section>

      {/* CONTENT WRAPPER */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
        
        {/* MAIN LEFT */}
        <main className="lg:col-span-2">

          {/* LATEST POSTS */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-extrabold mb-6">Latest Thoughts</h2>

            <div className="space-y-6">
              {loading ? (
                <p className="text-gray-500">Loading posts...</p>
              ) : latest.length > 0 ? (
                latest.map((blog: any) => (
                  <BlogCard key={blog.blog_id} blog={blog} />
                ))
              ) : (
                <p className="text-gray-600">No thoughts shared yet.</p>
              )}
            </div>

            <div className="mt-5 pt-6 text-center">
              <Link
                href="/blogs"
                className="px-5 py-2 rounded-full border border-[#1A1A1A] inline-block hover:bg-gray-300 transition"
              >
                View all writings
              </Link>
            </div>
          </section> 
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-8">

          {/* ABOUT */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">About Vichar Kendra</h3>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Vichar Kendra is a platform dedicated to the expression of thoughts,
              ideas, and experiences. It serves as a digital center where technology,
              learning, personal growth, and real-life reflections meet.
            </p>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Some writings are technical, some are philosophical, and some are
              simply honest observations of everyday life. The goal is simple:
              to give thoughts a voice and provide a space for meaningful sharing.
            </p>

            <div className="mt-4">
              <Link
                href="/about"
                className="text-sm inline-block px-3 py-2 rounded-full border border-[#1A1A1A] hover:bg-gray-300 transition"
              >
                Learn more
              </Link>
            </div>
          </section>

          {/* TOPICS */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Trending Topics</h3>

            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Tech & Coding", "Life & Reflections", "Productivity", "Learning Journey", "Creative Thoughts", "Career & Growth", "Experiences", "Mindset",
              ].map((tag) => (
                <Link
                  href={`/tag/${tag.replace(/\s+/g, "-").toLowerCase()}`}
                  key={tag}
                  className="text-sm px-3 py-2 rounded-full bg-[#F3F3F3] hover:bg-[#EDEDED] inline-block"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          {/* SUBSCRIBE */}
          <section className="bg-white p-6 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold hover:cursor-pointer">Subscribe</h4>
            <p className="mt-2 text-sm text-gray-600">
              Receive new thoughts and stories directly in your inbox.
            </p>

            <SubscribeBox />
          </section>
        </aside>
      </div>
    </main>
  );
}
