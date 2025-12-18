// Write Page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/app/components/editor/blogEditor";
import toast from "react-hot-toast";
import type { SerializedEditorState, SerializedElementNode } from "lexical";

export default function WritePage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<SerializedEditorState | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  
  useEffect(() => {
    const draft = localStorage.getItem("blog_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || "");
        setBody(parsed.body || null);
      } catch {
        localStorage.removeItem("blog_draft");
      }
    }
  }, []);
  
  function isEditorEmpty(state: SerializedEditorState | null) {
  if (!state) return true;

  const root = state.root as SerializedElementNode;
  // No blocks
  if (!root.children || root.children.length === 0) return true;

  // Only empty paragraph
  if (
    root.children.length === 1 &&
    root.children[0].type === "paragraph"
  ) {
    const paragraph = root.children[0] as SerializedElementNode;
    return paragraph.children.length === 0;
  }

  return false;
}
  
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Title is required!");
      return;
    }

    if (isEditorEmpty(body)) {
      toast.error("Write something before publishing!");
      return;
    }

    setPublishing(true);

    try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blogs`,
      {
        method: "POST",
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

    if (!res.ok) {
      toast.error(data.error || "Failed to publish blog");
      return;
    }

    // Success
    localStorage.removeItem("blog_draft");
    toast.success("Blog published successfully!");

    router.push(`/blogs/${data.newBlog.blog_id}`);

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
  } finally{
    setPublishing(false);
  }
  };

  const handleSaveDraft = () => {
    if (!title.trim() && isEditorEmpty(body)) {
      toast.error("Nothing to save!");
      return;
    }
    
    localStorage.setItem("blog_draft", JSON.stringify({
        title,
        body,
        savedAt: new Date().toISOString(),
      }
    ));

    toast.success("Draft saved!");
  };


  return (
    <div className="min-h-screen bg-gray-50 py-10 max-sm:py-6">
      <div className="max-w-4xl mx-auto px-4 max-sm:px-3">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-black mb-8 max-sm:text-3xl max-sm:mb-6">
            Create a Blog
          </h1>
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Blog Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            w-full mb-6 text-3xl font-semibold
            text-gray-700
            bg-transparent outline-none 
            border border-gray-200
            rounded-md px-4 py-3
            placeholder-gray-300
            focus:border-gray-300 focus:ring-0

            max-sm:text-xl
            max-sm:px-3
            max-sm:py-2
          "
        />
        
        {/* Editor */}
        <BlogEditor onChange={setBody} />

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 max-sm:flex-col">
          <button
            className="px-5 py-2 rounded-full border border-[#1A1A1A] text-black hover:bg-gray-100 transition cursor-pointer max-sm:w-full"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>

          <button
            className="px-5 py-2 rounded-full bg-[#111111] text-white text-sm hover:opacity-95 transition cursor-pointer max-sm:w-full"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
