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
          <h1 className="text-5xl font-bold text-gray-900">
            Create a Blog
          </h1>
          <p className="text-small text-gray-500 mt-3">
            Share your thoughts with the world!
          </p>
        </div>

        {/* Editor */}
        <BlogEditor onChange={handleChange} />

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-5 py-2 rounded-full border text-sm hover:bg-gray-100"
            onClick={() => setContent("")}
          >
            Clear
          </button>

          <button
            className="px-5 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800"
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
