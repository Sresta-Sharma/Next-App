"use client";

import { useState } from "react";
import BlogEditor from "@/app/components/editor/blogEditor";
import toast from "react-hot-toast";
import type { SerializedEditorState, SerializedElementNode } from "lexical";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<SerializedEditorState | null>(null);

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
  
  const handlePublish = () => {
    if (!title.trim()) {
      toast.error("Title is required!");
      return;
    }

    if (isEditorEmpty(body)) {
      toast.error("Write something before publishing!");
      return;
    }

    const blogPost = {
      title,
      body, // Lexical JSON
    };

    console.log("Blog post: ",blogPost);
    localStorage.removeItem("blog_draft");
    toast.success("Blog content logged to console");
  };

  const handleSaveDraft = () => {
    if (!title.trim() && isEditorEmpty(body)) {
      toast.error("Nothing to save!");
      return;
    }

    const draft = {
      title,
      body,
      savedAt: new Date().toISOString(),
    };

    // TEMP: store locally (replace with API later)
    localStorage.setItem("blog_draft", JSON.stringify(draft));

    toast.success("Draft saved!");
  };


  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-black mb-8">
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
          "
        />
        
        {/* Editor */}
        <BlogEditor onChange={setBody} />

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-5 py-2 rounded-full border border-[#1A1A1A] text-black hover:bg-gray-100 transition cursor-pointer"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>

          <button
            className="px-5 py-2 rounded-full bg-[#111111] text-white text-sm hover:opacity-95 transition cursor-pointer"
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
