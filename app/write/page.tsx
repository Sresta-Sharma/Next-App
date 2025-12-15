"use client";

import { useState } from "react";
import BlogEditor from "@/app/components/editor/blogEditor";
import toast from "react-hot-toast";

export default function WritePage() {
  const [content, setContent] = useState("");

  const handleChange = (text: string) => {
    setContent(text);
  };

  const handlePublish = () => {
    if (!content.trim()) {
      toast.error("Write something before publishing!");
      return;
    }

    // For now just log (later: send to backend)
    console.log("Blog content:", content);

    toast.success("Blog content logged to console");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Create a Blog
          </h1>
        </div>

        {/* Editor */}
        <BlogEditor onChange={handleChange} />

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-5 py-2 rounded-full border border-[#1A1A1A] text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setContent("")}
          >
            Clear
          </button>

          <button
            className="px-5 py-2 rounded-full bg-[#111111] text-white text-sm hover:opacity-95 transition"
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
