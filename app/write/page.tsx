"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogEditor from "@/app/components/editor/blogEditor";
import toast from "react-hot-toast";
import type { SerializedEditorState, SerializedElementNode } from "lexical";

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<SerializedEditorState | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!draftId);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Load draft from database if draft ID is provided
  useEffect(() => {
    if (!draftId) {
      setLoading(false);
      return;
    }

    const fetchDraft = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drafts/${draftId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to load draft");
          setLoading(false);
          return;
        }

        const draft = data.draft;
        setTitle(draft.title || "");
        
        try {
          const parsedContent = JSON.parse(draft.content);
          setBody(parsedContent);
        } catch {
          setBody(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading draft:", err);
        toast.error("Failed to load draft");
        setLoading(false);
      }
    };

    fetchDraft();
  }, [draftId]);
  
  // Load from localStorage if no draft ID
  useEffect(() => {
    if (draftId) return; // Skip if loading from database
    
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
  }, [draftId]);
  
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog`,
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

  const handleSaveDraft = async () => {
    if (!title.trim() && isEditorEmpty(body)) {
      toast.error("Nothing to save!");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drafts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            title: title.trim() || "Untitled Draft",
            content: JSON.stringify(body),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save draft");
        return;
      }

      // Also keep in localStorage for quick backup
      localStorage.setItem("blog_draft", JSON.stringify({
        title,
        body,
        savedAt: new Date().toISOString(),
      }));

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-10 max-sm:py-6">
      <div className="max-w-4xl mx-auto px-4 max-sm:px-3">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-black mb-8 max-sm:text-3xl max-sm:mb-6">
            {draftId ? "Edit Draft" : "Create a Blog"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading draft...</p>
          </div>
        ) : (
          <>
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
            <BlogEditor onChange={setBody} initialState={body} />

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 max-sm:flex-col">
              <button
                className="px-5 py-2 rounded-full border border-[#1A1A1A] text-black hover:bg-gray-100 transition cursor-pointer max-sm:w-full disabled:opacity-50"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                className="px-5 py-2 rounded-full bg-[#111111] text-white text-sm hover:opacity-95 transition cursor-pointer max-sm:w-full disabled:opacity-50"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
