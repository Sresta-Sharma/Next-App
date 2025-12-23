"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type Draft = {
  draft_id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchDrafts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drafts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || "Failed to load drafts.");
          return;
        }

        setDrafts(result.drafts || []);
      } catch (err) {
        toast.error("Unable to fetch drafts.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this draft?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drafts/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }

      setDrafts((prev) => prev.filter((d) => d.draft_id !== id));
      toast.success("Draft deleted");
    } catch (err) {
      toast.error("Error deleting draft");
    }
  };

  const handlePublish = async (id: number, title: string) => {
    if (!confirm(`Publish "${title}" as a blog post?`)) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drafts/${id}/publish`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to publish");
        return;
      }

      setDrafts((prev) => prev.filter((d) => d.draft_id !== id));
      toast.success("Draft published!");
      router.push(`/blogs/${data.blog.blog_id}`);
    } catch (err) {
      toast.error("Error publishing draft");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#111111]">My Drafts</h1>
            <p className="text-gray-500 mt-2">Manage your unpublished drafts (expires in 7 days)</p>
          </div>

          <Link
            href="/write"
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90"
          >
            + New Draft
          </Link>
        </div>

        {/* Drafts List */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You don't have any drafts yet.</p>
            <Link
              href="/write"
              className="px-4 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 inline-block"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.draft_id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      href={`/write?draft=${draft.draft_id}`}
                      className="text-lg font-semibold text-black hover:underline cursor-pointer"
                    >
                      {draft.title || "Untitled Draft"}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {new Date(draft.updated_at).toLocaleDateString()} at{" "}
                      {new Date(draft.updated_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePublish(draft.draft_id, draft.title)}
                      className="px-3 py-1 text-sm bg-black text-white rounded-full hover:opacity-90 cursor-pointer"
                    >
                      Publish
                    </button>

                    <button
                      onClick={() => handleDelete(draft.draft_id)}
                      className="px-3 py-1 text-sm text-red-500 border border-red-300 rounded-full hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
