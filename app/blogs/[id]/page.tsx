"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogViewer from "@/app/components/editor/blogViewer";
import type { SerializedEditorState } from "lexical";

type Blog = {
  blog_id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
};

export default function BlogReadPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${id}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setBlog(data.blog);
      } catch (err) {
        console.error(err);
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

        {/* Title */}
        <h1 className="text-5xl font-bold text-black mb-6 max-sm:text-3xl">
          {blog.title}
        </h1>

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
