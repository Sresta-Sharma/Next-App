"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CommentType = {
  comment_id: number;
  content: string;
  blog_title: string;
  created_at: string;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments/my-comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load comments");

      setComments(data.comments || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Comments on Your Blogs</h1>

      {comments.length === 0 ? (
        <p className="text-gray-600">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.comment_id}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <p className="text-sm text-gray-700">{c.content}</p>

              <div className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>
                  On Blog: <strong>{c.blog_title}</strong>
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
